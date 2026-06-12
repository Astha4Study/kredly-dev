import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { resend } from '../lib/resend';
import { auth } from '../auth/auth';

const router: Router = Router();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post('/send', async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email wajib diisi',
      });
    }

    const code = generateOTP();

    await prisma.emailOTP.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await resend.emails.send({
      from: 'Kredly <noreply@aguspriyanto.my.id>',
      to: email,
      subject: 'Kode OTP Kredly',
      html: `
        <h2>Kode OTP Anda</h2>
        <p>Gunakan kode berikut untuk ${type === 'sign-up' ? 'mendaftar' : 'masuk'} ke Kredly:</p>
        <h1 style="font-size: 32px; letter-spacing: 4px;">${code}</h1>
        <p>Kode ini berlaku selama 10 menit.</p>
      `,
    });

    return res.json({
      success: true,
      message: 'OTP berhasil dikirim',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Gagal mengirim OTP',
    });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { email, otp, type } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email dan OTP wajib diisi',
      });
    }

    const otpRecord = await prisma.emailOTP.findFirst({
      where: {
        email,
        code: otp,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Kode OTP tidak valid atau sudah kadaluarsa',
      });
    }

    await prisma.emailOTP.delete({
      where: {
        id: otpRecord.id,
      },
    });

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user && type === 'sign-up') {
      const crypto = await import('crypto');
      const userId = crypto.randomUUID();

      user = await prisma.user.create({
        data: {
          id: userId,
          email,
          emailVerified: true,
          name: email.split('@')[0],
        },
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      });
    }

    const crypto = await import('crypto');
    const sessionId = crypto.randomUUID();
    const sessionToken = crypto.randomBytes(32).toString('hex');

    const session = await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('better-auth.session_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: 'Verifikasi berhasil',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Gagal memverifikasi OTP',
    });
  }
});

export default router;
