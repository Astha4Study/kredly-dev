import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import AsideProfile from '@/components/AsideProfile';
import { useAuth } from '@/contexts';

export const Route = createFileRoute('/_app/app/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuth();

  const credentials = [
    {
      title: 'React Fundamentals',
      date: '15 Juni 2026',
      score: 88,
      category: 'Frontend Development',
    },
    {
      title: 'JavaScript ES6',
      date: '10 Juni 2026',
      score: 82,
      category: 'Programming Languages',
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="border-b border-border px-1 pb-5">
            <h1 className="text-xl font-semibold text-foreground">
              Selamat datang kembali, {user?.name?.split(' ')[0]}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Lanjutkan asesmen Anda dan bangun kredensial yang dapat
              diverifikasi.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            {/* Hero Stats */}
            <section className="border-b border-border">
              <div className="grid grid-cols-3">
                {[
                  {
                    value: '2',
                    label: 'Kredensial',
                    description: 'Terverifikasi blockchain',
                  },
                  {
                    value: '85%',
                    label: 'Rata-rata skor',
                    description: 'Dari seluruh asesmen',
                  },
                  {
                    value: '1',
                    label: 'Sedang berjalan',
                    description: 'Asesmen aktif',
                  },
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className={`p-6 ${
                      index !== 2 ? 'border-r border-border' : ''
                    }`}
                  >
                    <p className="text-sm text-muted-foreground">
                      {item.label}
                    </p>

                    <p className="mt-2 text-4xl font-bold">{item.value}</p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Assessment */}
            <section className="border-b border-border">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Asesmen sedang berjalan
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                      React Advanced
                    </h2>
                  </div>

                  <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    45%
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                    <span>9 dari 20 soal</span>
                    <span>15 menit tersisa</span>
                  </div>

                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: '45%' }}
                    />
                  </div>
                </div>

                <Link to="/app/assessments">
                  <Button className="mt-5">Lanjutkan asesmen</Button>
                </Link>
              </div>
            </section>

            {/* Credentials */}
            <section>
              <div className="flex items-center justify-between border-b border-border p-6">
                <div>
                  <h2 className="text-lg font-semibold">Kredensial terbaru</h2>

                  <p className="text-sm text-muted-foreground">
                    Pencapaian yang telah diverifikasi
                  </p>
                </div>

                <Link to="/app/credentials">
                  <Button variant="ghost">Lihat semua</Button>
                </Link>
              </div>

              <div className="divide-y divide-border">
                {credentials.map((cred) => (
                  <div
                    key={cred.title}
                    className="p-6 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {cred.category}
                        </p>

                        <h3 className="mt-1 text-base font-semibold">
                          {cred.title}
                        </h3>

                        <p className="mt-3 text-xs text-muted-foreground">
                          {cred.date}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-3xl font-bold">{cred.score}</p>

                        <p className="text-xs text-muted-foreground">
                          skor akhir
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Blockchain verified
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
        <div className="hidden shrink-0 md:block">
          <AsideProfile />
        </div>
      </div>
    </main>
  );
}
