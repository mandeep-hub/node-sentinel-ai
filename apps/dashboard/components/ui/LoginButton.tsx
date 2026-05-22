import { Button } from "@/components/ui/button";

export default function LoginButton() {
  return (
    <Button
      size="lg"
      className="bg-yellow-500 hover:bg-yellow-700 text-black font-semibold"
      asChild
    >
      <a href="/auth/login">Login to continue</a>
    </Button>
  );
}
