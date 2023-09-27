import Link from "next/link";
import { Bird } from "~/components/bird";
import { Button } from "~/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center mt-20 gap-4">
      <Bird />
      <p>404 - Page Not Found</p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
