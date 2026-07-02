import { createFileRoute } from '@tanstack/react-router'
import { AssistantRuntimeProvider } from "@assistant-ui/react"
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk"
import { Thread } from "@/components/thread"
import { useAuiState } from "@assistant-ui/react"

export const Route = createFileRoute('/_public/chat/')({
  component: RouteComponent,
})

function RouteComponent() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatContainer />
    </AssistantRuntimeProvider>
  )
}

function ChatContainer() {
  const hasMessages = useAuiState((s) => s.thread.messages.length > 0)

  return (
    <div className={`fixed inset-x-0 bottom-0 top-14 md:top-12 flex w-full bg-zinc-100/50 ${!hasMessages ? 'overflow-hidden' : ''}`}>
      <main className="flex-1">
        <Thread />
      </main>
    </div>
  )
}
