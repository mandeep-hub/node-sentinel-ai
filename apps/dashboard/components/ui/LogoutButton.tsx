import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Button
      className="h-9 rounded-lg border border-amber-400/20 bg-amber-500/10 px-5 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-500/20 hover:text-amber-100"
      asChild
    >
      <a href="/auth/logout">Logout</a>
    </Button>
  );
}
