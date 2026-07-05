import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Coins,
  Loader2,
} from 'lucide-react';

interface TopupPackage {
  name: string;
  credits: number;
  price: string;
  priceNumeric: number;
  pricePerCredit: string;
  bonus?: number;
  popular?: boolean;
}

const topupPackages: TopupPackage[] = [
  {
    name: 'Starter',
    credits: 5,
    price: 'Rp 25.000',
    priceNumeric: 25000,
    pricePerCredit: 'Rp 5.000/kredit',
  },
  {
    name: 'Explorer',
    credits: 20,
    price: 'Rp 79.000',
    priceNumeric: 79000,
    pricePerCredit: 'Rp 3.950/kredit',
  },
  {
    name: 'Career',
    credits: 50,
    price: 'Rp 149.000',
    priceNumeric: 149000,
    pricePerCredit: 'Rp 2.980/kredit',
    popular: true,
  },
  {
    name: 'Pro',
    credits: 100,
    price: 'Rp 249.000',
    priceNumeric: 249000,
    pricePerCredit: 'Rp 2.490/kredit',
  },
];

export const Route = createFileRoute('/_app/app/checkout/')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      credits: Number(search.credits) || 50,
    };
  },
  component: CheckoutComponent,
});

type PaymentMethod = 'qris' | 'bca_va' | 'mandiri_va' | 'gopay' | 'cc';

function CheckoutComponent() {
  const { credits } = Route.useSearch();
  // Find the selected package or fallback
  const selectedPackage =
    topupPackages.find((pkg) => pkg.credits === credits) ?? topupPackages[0];

  const adminFee = 2500;
  const grandTotalNumeric = selectedPackage.priceNumeric + adminFee;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{
    orderId: string;
    added: number;
    current: number;
  } | null>(null);

  // Fetch user profile on mount to fill in details
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setUserName(data.profile.name || '');
            setUserEmail(data.profile.email || '');
          }
        }
      } catch (err) {
        console.error('Failed to load profile for checkout:', err);
      }
    }
    fetchProfile();
  }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      toast.error('Silakan lengkapi informasi penagihan Anda');
      return;
    }

    try {
      setLoading(true);

      // Simulate connection time to payment gateway
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await fetch('/api/user/me/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          credits: selectedPackage.credits,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal memproses pembayaran');
      }

      const resData = await response.json();

      // Generate a mock Order ID
      const randomOrderId =
        'KRD-' + Math.floor(10000000 + Math.random() * 90000000);

      setSuccessData({
        orderId: randomOrderId,
        added: resData.added,
        current: resData.current,
      });

      toast.success(
        `Pembayaran berhasil! +${resData.added} Kredit telah ditambahkan.`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem',
      );
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm shadow-xl p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h2 className="text-2xl font-bold text-foreground">
            Pembayaran Berhasil!
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Transaksi Anda telah berhasil diproses oleh Midtrans. Kredit telah
            ditambahkan ke akun Anda secara otomatis.
          </p>

          <div className="w-full border-t border-b border-border/60 py-6 my-6 space-y-3 text-sm text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono font-medium text-foreground">
                {successData.orderId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode Pembayaran</span>
              <span className="font-medium text-foreground">
                {paymentMethod === 'qris' && 'QRIS / GoPay'}
                {paymentMethod === 'bca_va' && 'BCA Virtual Account'}
                {paymentMethod === 'mandiri_va' && 'Mandiri Virtual Account'}
                {paymentMethod === 'gopay' && 'GoPay E-Wallet'}
                {paymentMethod === 'cc' && 'Kartu Kredit'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kredit Ditambahkan</span>
              <span className="font-semibold text-primary flex items-center gap-1">
                <Coins className="h-4 w-4 shrink-0" />+{successData.added}{' '}
                Kredit
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Pembayaran</span>
              <span className="font-semibold text-foreground">
                {formatRupiah(grandTotalNumeric)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border/40">
              <span className="text-muted-foreground">
                Total Saldo Sekarang
              </span>
              <span className="font-bold text-foreground">
                {successData.current} Kredit
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button asChild className="flex-1" size="lg">
              <Link to="/app">Dashboard Utama</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link to="/app/jobs">Lihat Rekomendasi Kerja</Link>
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back to topup link */}
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Checkout Details & Form */}
        <form onSubmit={handlePay} className="flex-1 space-y-6 w-full">
          {/* Card 1: Billing info */}
          <Card className="border-border/50 bg-background shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                Informasi Penagihan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Nama Lengkap
                  </label>
                  <Input
                    id="name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Alamat Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Masukkan alamat email"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Payment Methods */}
          <Card className="border-border/50 bg-background shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Metode Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* QRIS */}
              <label
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/30 ${
                  paymentMethod === 'qris'
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
                onClick={() => setPaymentMethod('qris')}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'qris'}
                    readOnly
                    className="accent-primary"
                  />
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        QRIS / GoPay
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Bayar cepat dengan scan kode QR
                      </p>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-muted rounded text-muted-foreground">
                  Instan
                </span>
              </label>

              {/* BCA VA */}
              <label
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/30 ${
                  paymentMethod === 'bca_va'
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
                onClick={() => setPaymentMethod('bca_va')}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'bca_va'}
                    readOnly
                    className="accent-primary"
                  />
                  <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        BCA Virtual Account
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Konfirmasi otomatis via mobile banking
                      </p>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-muted rounded text-muted-foreground">
                  VA
                </span>
              </label>

              {/* Mandiri VA */}
              <label
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/30 ${
                  paymentMethod === 'mandiri_va'
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
                onClick={() => setPaymentMethod('mandiri_va')}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'mandiri_va'}
                    readOnly
                    className="accent-primary"
                  />
                  <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Mandiri Virtual Account
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Konfirmasi otomatis via Livin' Mandiri
                      </p>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-muted rounded text-muted-foreground">
                  VA
                </span>
              </label>

              {/* Gopay */}
              <label
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/30 ${
                  paymentMethod === 'gopay'
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
                onClick={() => setPaymentMethod('gopay')}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'gopay'}
                    readOnly
                    className="accent-primary"
                  />
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        GoPay E-Wallet
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Langsung redirect ke aplikasi Gojek
                      </p>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-muted rounded text-muted-foreground">
                  E-Wallet
                </span>
              </label>

              {/* CC */}
              <label
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/30 ${
                  paymentMethod === 'cc'
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
                onClick={() => setPaymentMethod('cc')}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'cc'}
                    readOnly
                    className="accent-primary"
                  />
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Kartu Kredit / Debit
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Visa, MasterCard, JCB, atau Amex
                      </p>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-muted rounded text-muted-foreground">
                  Kartu
                </span>
              </label>
            </CardContent>
          </Card>
        </form>

        {/* Right Column: Order Summary Card */}
        <div className="w-full lg:w-96 space-y-4">
          <Card className="border-border bg-card shadow-md overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-base font-semibold">
                Ringkasan Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Product Info */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Kredly Kredit — Paket {selectedPackage.credits}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedPackage.credits} Kredit Utama
                    {selectedPackage.bonus
                      ? ` + ${selectedPackage.bonus} Bonus`
                      : ''}
                  </p>
                </div>
              </div>

              {/* Price calculations */}
              <div className="border-t border-border/40 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harga Paket</span>
                  <span className="text-foreground font-medium">
                    {selectedPackage.price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Biaya Layanan</span>
                  <span className="text-foreground font-medium">
                    {formatRupiah(adminFee)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/40 text-base font-bold text-foreground">
                  <span>Total Bayar</span>
                  <span>{formatRupiah(grandTotalNumeric)}</span>
                </div>
              </div>

              {/* Payment button */}
              <Button
                onClick={handlePay}
                className="w-full h-11"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses Pembayaran...
                  </>
                ) : (
                  <>Bayar & Tambah Kredit</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Secure disclaimer */}
          <div className="flex items-center gap-2 justify-center px-4">
            <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground text-center">
              Pembayaran aman terenkripsi oleh Midtrans SSL 256-bit.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
