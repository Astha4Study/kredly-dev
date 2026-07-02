import { useState, useCallback, useRef, useEffect } from "react";
import type { ThreadRuntimeCore } from "@assistant-ui/react";
import { makeAssistantToolUI } from "@assistant-ui/react";

export function useCustomChatRuntime(): ThreadRuntimeCore {
  const [messages, setMessages] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const append = useCallback(async (message: any) => {
    console.log("🔵 [Runtime] Append called with message:", message);

    // Add user message immediately
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: [{ type: "text", text: message.content }],
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsRunning(true);

    // Prepare assistant message
    const assistantMessageId = `msg-${Date.now()}-assistant`;
    let assistantContent = "";

    // Add empty assistant message
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant",
        content: [{ type: "text", text: "" }],
        createdAt: new Date(),
      },
    ]);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages
            .concat(userMessage)
            .map((m) => ({
              role: m.role,
              content:
                m.content
                  .filter((c: any) => c.type === "text")
                  .map((c: any) => c.text)
                  .join("") || "",
            })),
          system: KREDLY_SYSTEM_PROMPT,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data: ")) continue;

          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              assistantContent += content;
              console.log("💬 [Runtime] Updating assistant message:", assistantContent.slice(0, 50) + "...");

              // Update assistant message with new content
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? {
                        ...msg,
                        content: [{ type: "text", text: assistantContent }],
                      }
                    : msg
                )
              );
            }
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }

      console.log("✅ [Runtime] Stream complete. Final message:", assistantContent);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("❌ [Runtime] Error:", error);
      }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  }, [messages]);

  const cancel = useCallback(() => {
    console.log("🛑 [Runtime] Cancel called");
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsRunning(false);
    }
  }, []);

  // Create runtime object
  const runtime: ThreadRuntimeCore = {
    messages,
    isRunning,
    getBranches: () => [{ id: "main", messages }],
    switchToBranch: () => {},
    append,
    startRun: () => {},
    cancelRun: cancel,
    addToolResult: () => {},
    composer: {
      text: "",
      setText: () => {},
      reset: () => {},
      send: () => {},
      cancel: () => {},
      attachments: [],
      addAttachment: () => {},
      removeAttachment: () => {},
      isEditing: false,
      edit: () => {},
      canCancel: false,
    },
    capabilities: {
      edit: false,
      reload: false,
      cancel: true,
      copy: true,
    },
    isDisabled: false,
    speech: null,
    submitFeedback: () => {},
    getModelConfig: () => ({}),
    registerModelConfigProvider: () => () => {},
    getSubmittedFeedback: () => null,
  };

  return runtime;
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
