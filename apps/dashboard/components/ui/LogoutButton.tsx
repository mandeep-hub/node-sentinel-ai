import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Button
      className="h-10 cursor-pointer rounded-lg border border-zinc-700 bg-zinc-900 !px-7 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
      asChild
    >
      <a href="/auth/logout">Logout</a>
    </Button>
  );
}
