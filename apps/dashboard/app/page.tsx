import { Button } from "@/components/ui/button";
import { auth0 } from "@/lib/auth0";
import LoginButton from "@/components/ui/LoginButton";

export default async function Home() {
  const session = await auth0.getSession();
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6 p-10">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Node <span className="text-yellow-500">Sentinel</span> AI
        </h1>
        <p className="text-muted-foreground text-sm">
          Risk monitoring dashboard
        </p>
      </div>

      {session ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="text-foreground font-medium">
              {session.user.email}
            </span>
          </p>
          <div className="flex gap-2">
            <Button
              className="bg-yellow-600 hover:bg-yellow-300 text-black font-semibold px-5"
              asChild
            >
              <a href="/transactions">Dashboard</a>
            </Button>
          </div>
        </div>
      ) : (
        <LoginButton />
      )}
    </main>
  );
}
