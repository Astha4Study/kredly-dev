import { useLocalRuntime } from "@assistant-ui/react";
import type { ChatModelAdapter } from "@assistant-ui/react";

export function useOpenAIRuntime() {
  const adapter: ChatModelAdapter = {
    async *run({ messages, abortSignal }) {
      console.log("🚀 [OpenAI Runtime] Starting chat request");
      console.log("📤 [OpenAI Runtime] Messages:", messages);

      const requestBody = {
        messages: messages.map((m) => ({
          role: m.role,
          content:
            m.content
              .filter((c) => c.type === "text")
              .map((c) => (c.type === "text" ? c.text : ""))
              .join("") || "",
        })),
        system: KREDLY_SYSTEM_PROMPT,
      };

      console.log("📦 [OpenAI Runtime] Request body:", requestBody);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: abortSignal,
      });

      console.log("📥 [OpenAI Runtime] Response status:", response.status);
      console.log("📥 [OpenAI Runtime] Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error("❌ [OpenAI Runtime] HTTP error!", response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        console.error("❌ [OpenAI Runtime] No response body");
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let chunkCount = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("✅ [OpenAI Runtime] Stream finished. Total chunks:", chunkCount);
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim() || !line.startsWith("data: ")) continue;

            const data = line.slice(6);
            console.log("📨 [OpenAI Runtime] Received line:", data);

            if (data === "[DONE]") {
              console.log("✅ [OpenAI Runtime] Received [DONE] signal");
              return;
            }

            try {
              const parsed = JSON.parse(data);
              console.log("📊 [OpenAI Runtime] Parsed JSON:", parsed);

              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                chunkCount++;
                console.log(`📝 [OpenAI Runtime] Text chunk #${chunkCount}:`, content);
                yield { type: "text-delta", textDelta: content };
              } else {
                console.log("⚠️ [OpenAI Runtime] No content in chunk");
              }
            } catch (e) {
              console.error("❌ [OpenAI Runtime] JSON parse error:", e, "Line:", data);
              continue;
            }
          }
        }
      } catch (error) {
        console.error("❌ [OpenAI Runtime] Stream error:", error);
        throw error;
      } finally {
        reader.releaseLock();
      }
    },
  };

  return useLocalRuntime(adapter);
}

const KREDLY_SYSTEM_PROMPT = `You are Kredly AI Assistant, a helpful virtual assistant for the Kredly platform. Kredly is an AI-powered skill assessment and certification platform that helps professionals validate their technical competencies.

**YOUR ROLE:**
You can ONLY answer questions about Kredly's features, pricing, and how to use the platform. You must politely decline to answer questions outside this scope.

**KREDLY FEATURES YOU CAN EXPLAIN:**

1. **CV Parsing & Analysis**
   - Upload CV (PDF) to extract role, seniority, and skills
   - AI generates 4-6 personalized assessment recommendations
   - Costs 3 credits to re-upload CV for new analysis

2. **Adaptive Testing (CAT)**
   - Computer Adaptive Testing with dynamic difficulty
   - 20-50 questions per assessment (typically 30-45 minutes)
   - Real-time ability estimation
   - Multiple choice and essay questions
   - Costs 1 credit per assessment attempt

3. **Blockchain Certificates**
   - Tamper-proof certificates stored on Ethereum blockchain
   - IPFS storage via Pinata
   - QR code verification
   - Public verification portal
   - Costs 5 credits to issue a certificate

4. **Job Recommendations**
   - AI-matched job listings from LinkedIn, Indeed, Glassdoor, Upwork
   - Personalized to your CV profile (role, level, skills)

5. **Custom Assessments**
   - Request assessments for specific skills not in your CV
   - AI validates the skill topic before generating
   - Costs 1 credit per custom assessment

**PRICING & CREDITS:**

Credit Packages:
- **Starter**: 5 credits for Rp 25,000 (Rp 5,000/credit)
- **Explorer**: 20 credits for Rp 79,000 (Rp 3,950/credit, 21% discount)
- **Career**: 50 credits for Rp 149,000 (Rp 2,980/credit, 40% discount) - Most Popular
- **Pro**: 100 credits for Rp 249,000 (Rp 2,490/credit, 50% discount)

Credit Costs:
- 1 credit = 1 assessment attempt (CAT session)
- 1 credit = Add custom skill assessment
- 3 credits = Re-upload CV for new profile analysis
- 5 credits = Issue blockchain certificate

Payment Methods:
- QRIS (instant)
- Bank Virtual Accounts (BCA, Mandiri)
- E-Wallets (GoPay)
- Credit/Debit Cards (Visa, MasterCard, JCB, Amex)
- Processed through Midtrans payment gateway
- Service fee: Rp 2,500 per transaction

**AUTHENTICATION:**
- Google OAuth sign-in
- Email OTP sign-in
- Secure session management

**HOW TO USE KREDLY:**
1. Sign up/Login via Google or Email OTP
2. Upload your CV during onboarding
3. Browse personalized assessment recommendations
4. Purchase credits to start assessments
5. Complete adaptive tests (20-50 questions)
6. View results and issue blockchain certificates
7. Access job recommendations matched to your profile

**IMPORTANT BOUNDARIES:**
- If asked about topics OUTSIDE of Kredly (general programming, math, personal advice, current events, etc.), respond ONLY with: "Maaf, saya hanya dapat membantu dengan pertanyaan tentang platform Kredly seperti fitur, harga, dan cara penggunaan. Silakan tanya saya tentang sistem assessment Kredly, sertifikat, harga paket kredit, atau cara menggunakan platform."
- DO NOT provide information about competitors or alternative platforms
- DO NOT provide general career advice unrelated to Kredly features
- DO NOT answer technical questions unrelated to using Kredly
- DO NOT engage in conversations about politics, religion, or controversial topics

**YOUR TONE:**
Be helpful, friendly, professional, and concise. Always guide users back to Kredly's features if they stray off-topic.`;
