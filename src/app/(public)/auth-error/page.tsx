import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { z } from "zod";
import Link from "next/link";

const ErrorMessage = {
  Configuration: "Configuration",
  AccessDenied: "AccessDenied",
  Verification: "Verification",
  Default: "Default",
} as const;
const ErrorMessagesSchema = z.nativeEnum(ErrorMessage);
type ErrorMessage = z.infer<typeof ErrorMessagesSchema>;

export default function AuthError({
  searchParams,
}: {
  searchParams?: { error: string | undefined };
}) {
  const errorParseResult = ErrorMessagesSchema.safeParse(searchParams?.error);

  const error: ErrorMessage = errorParseResult.success
    ? errorParseResult.data
    : ErrorMessage.Default;

  return (
    <div className="max-w-xs mx-auto mt-20">
      {error === ErrorMessage.Default && (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col">
            <Button asChild>
              <Link href="/">Home</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {error === ErrorMessage.Configuration && (
        <Card>
          <CardHeader>
            <CardTitle>Server Error</CardTitle>
            <CardDescription>
              There is a problem with the server configuration.
            </CardDescription>
            <CardDescription>
              Check the server logs for more information.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col">
            <Button asChild>
              <Link href="/">Home</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {error === ErrorMessage.AccessDenied && (
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to sign in.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col">
            <Button asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {error === ErrorMessage.Verification && (
        <Card>
          <CardHeader>
            <CardTitle>Unable to sign in</CardTitle>
            <CardDescription>
              The sign in link is no longer valid.
            </CardDescription>
            <CardDescription>
              It may have been used already or it may have expired.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col">
            <Button asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
