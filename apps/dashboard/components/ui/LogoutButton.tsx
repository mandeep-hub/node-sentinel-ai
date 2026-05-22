import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Button
      size="lg"
      className="bg-yellow-500 hover:bg-yellow-700 text-black font-semibold"
      asChild
    >
      <a href="/auth/logout">Logout</a>
    </Button>
  );
}
