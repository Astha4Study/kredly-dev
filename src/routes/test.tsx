import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sun,
  Moon,
  ArrowLeft,
  Paintbrush,
  Sliders,
  Layers,
  Eye,
} from 'lucide-react';

export const Route = createFileRoute('/test')({
  component: TestComponent,
});

function TestComponent() {
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-primary" />
              Shadcn Component Lab
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="px-2.5 py-0.5 text-xs font-semibold"
            >
              Preset: b1dBfuOuum
            </Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              title="Toggle Dark Mode"
              className="relative overflow-hidden"
            >
              {isDark ? (
                <Sun className="h-[1.2rem] w-[1.2rem] transition-all text-yellow-500" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-medium tracking-tight">
            Theme Component Showcase
          </h2>
          <p className="text-muted-foreground mt-2">
            Use this page to test color variables, borders, and interaction
            states for preset <strong>b1dBfuOuum</strong>.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Color Palette Preview */}
          <Card className="col-span-full lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Color Palette Explorer
              </CardTitle>
              <CardDescription>
                Visual representation of CSS color tokens.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded p-3 bg-primary text-primary-foreground font-semibold flex flex-col justify-between h-16">
                  <span>Primary</span>
                  <span>--primary</span>
                </div>
                <div className="rounded p-3 bg-secondary text-secondary-foreground font-semibold flex flex-col justify-between h-16 border border-border">
                  <span>Secondary</span>
                  <span>--secondary</span>
                </div>
                <div className="rounded p-3 bg-accent text-accent-foreground font-semibold flex flex-col justify-between h-16 border border-border">
                  <span>Accent</span>
                  <span>--accent</span>
                </div>
                <div className="rounded p-3 bg-muted text-muted-foreground font-semibold flex flex-col justify-between h-16">
                  <span>Muted</span>
                  <span>--muted</span>
                </div>
                <div className="rounded p-3 bg-card text-card-foreground font-semibold flex flex-col justify-between h-16 border border-border">
                  <span>Card</span>
                  <span>--card</span>
                </div>
                <div className="rounded p-3 bg-destructive text-destructive-foreground font-semibold flex flex-col justify-between h-16">
                  <span>Destructive</span>
                  <span>--destructive</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Radius:</span>
                  <span className="font-mono">--radius: 0rem (Square)</span>
                </div>
                <div
                  className="h-3 bg-border rounded-none"
                  title="Border Color"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Buttons & Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                Buttons & Badges
              </CardTitle>
              <CardDescription>
                Different style variants and states.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Button Variants
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link Button</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Badge Variants
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Interactive Inputs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Form Elements
              </CardTitle>
              <CardDescription>
                Interactive elements and states.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="name@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Project Role</Label>
                <Select defaultValue="developer">
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="manager">Product Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing">Marketing emails</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive promotional messages.
                  </p>
                </div>
                <Switch id="marketing" defaultChecked />
              </div>
            </CardContent>
            <CardFooter className="border-t border-border pt-4">
              <Button className="w-full">Submit Settings</Button>
            </CardFooter>
          </Card>

          {/* Card 4: Tabs Controller */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Tabs System</CardTitle>
              <CardDescription>
                Segmented controls to display different sections of data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="account">Account Profile</TabsTrigger>
                  <TabsTrigger value="preset">Theme Details</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Mode</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="account"
                  className="p-4 border border-border border-t-0 bg-card/50 space-y-4"
                >
                  <h3 className="text-lg font-semibold">Account Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    This tab displays user information. The Tabs component helps
                    segregate views without cluttering the UI.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm">Save Profile</Button>
                    <Button variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent
                  value="preset"
                  className="p-4 border border-border border-t-0 bg-card/50 space-y-2"
                >
                  <h3 className="text-lg font-semibold">
                    Preset Configuration
                  </h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Preset Key:</strong>{' '}
                      <span className="font-mono bg-muted px-1 py-0.5 text-xs text-muted-foreground">
                        b1dBfuOuum
                      </span>
                    </p>
                    <p>
                      <strong>Primary Color:</strong>{' '}
                      <span className="font-mono text-xs">
                        oklch(0.852 0.199 91.936)
                      </span>
                    </p>
                    <p>
                      <strong>Accent Color:</strong>{' '}
                      <span className="font-mono text-xs">
                        oklch(0.966 0.005 106.5)
                      </span>
                    </p>
                    <p>
                      <strong>Border Radius:</strong>{' '}
                      <span className="font-mono text-xs">
                        0px (Square theme)
                      </span>
                    </p>
                    <p>
                      <strong>Font Sans (Body):</strong>{' '}
                      <span className="font-mono text-xs">
                        'Inter', sans-serif
                      </span>
                    </p>
                    <p>
                      <strong>Font Heading (Titles):</strong>{' '}
                      <span className="font-mono text-xs">
                        'Roboto', sans-serif
                      </span>
                    </p>
                  </div>
                </TabsContent>
                <TabsContent
                  value="advanced"
                  className="p-4 border border-border border-t-0 bg-card/50 space-y-4"
                >
                  <h3 className="text-lg font-semibold">Developer Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable compiler flags, performance tuning options, and
                    custom debugging layers for React 19.
                  </p>
                  <div className="flex items-center gap-2">
                    <Switch id="debug" />
                    <Label htmlFor="debug">
                      Enable React Compiler logging in Console
                    </Label>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
