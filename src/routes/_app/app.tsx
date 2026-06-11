import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/app')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Selamat datang di dashboard Kredly. Halaman ini akan muncul setelah login.
      </p>
    </div>
  )
}
