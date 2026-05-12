import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-10 p-10">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-yellow-400">
          Node Sentinel AI
        </h1>
        <p className="text-muted-foreground text-sm">shadcn/ui theme test</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-center">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>

      <div className="rounded-lg border border-border bg-card text-card-foreground p-6 max-w-sm w-full shadow-sm">
        <h2 className="text-lg font-semibold text-yellow-400 mb-1">
          Theme Preview
        </h2>
        <p className="text-sm text-muted-foreground">
          This card confirms the dark theme CSS variables are wired up correctly.
          Background, border, and text colors are all pulled from the shadcn
          token system.
        </p>
      </div>
    </main>
  );
}
