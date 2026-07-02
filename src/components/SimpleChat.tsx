import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function SimpleChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Create assistant message placeholder
    const assistantId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
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
      let accumulatedContent = "";

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
              accumulatedContent += content;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: accumulatedContent }
                    : msg
                )
              );
            }
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: "Maaf, terjadi kesalahan. Silakan coba lagi." }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages - matches original Thread viewport structure */}
      <div className="relative flex flex-1 flex-col overflow-y-auto scroll-smooth">
        <div className={cn(
          "mx-auto flex w-full flex-1 flex-col px-4 pt-4",
          messages.length === 0 && "justify-center"
        )} style={{ maxWidth: "44rem" }}>
          {messages.length === 0 && (
            <div className="mb-6 flex flex-col items-center px-4 text-center">
              <h1 className="mb-2 text-2xl font-semibold">
                Selamat datang di <span className="text-primary">Krai</span>
              </h1>
              <p className="text-muted-foreground mb-8">
                Saya siap membantu menjawab pertanyaan seputar fitur, assessment, sertifikat, paket kredit, dan penggunaan platform Kredly.
              </p>

              {/* Input when no messages - centered below welcome text */}
              <div className="w-full" style={{ maxWidth: "44rem" }}>
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Send a message..."
                    className="min-h-11 max-h-32 resize-none"
                    rows={1}
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="h-11 w-11 shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          )}

          <div className="mb-14 flex flex-col gap-y-6 empty:hidden">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary shadow-lg ring-2 ring-yellow-500/30">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground px-4 py-2.5"
                      : "bg-muted text-foreground px-5 py-3"
                  )}
                >
                  {message.role === "assistant" ? (
                    <>
                      {message.content ? (
                        <div className="max-w-none text-sm leading-snug">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        isLoading && (
                          <div className="flex items-center gap-3 py-2">
                            <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-2">
                              <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" />
                              <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                              <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                            </div>

                            <span className="text-xs text-muted-foreground">
                              Krai sedang mengetik...
                            </span>
                          </div>
                        )
                      )}
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input when there are messages - sticky at bottom */}
      {messages.length > 0 && (
        <div className="flex flex-col gap-4 overflow-visible pb-4 md:pb-6 sticky bottom-0 mt-auto rounded-t-3xl bg-zinc-100/50">
          <div className="mx-auto w-full px-4" style={{ maxWidth: "44rem" }}>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                className="min-h-11 max-h-32 resize-none"
                rows={1}
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="h-11 w-11 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
