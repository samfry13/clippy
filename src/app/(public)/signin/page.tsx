import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getProviders } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { ProviderButton } from "~/components/provider-button";
import { EmailSigninForm } from "~/components/email-signin-form";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ErrorMessage = {
  OAuthSignin: "OAuthSignin",
  OAuthCallback: "OAuthCallback",
  OAuthCreateAccount: "OAuthCreateAccount",
  EmailCreateAccount: "EmailCreateAccount",
  Callback: "Callback",
  OAuthAccountNotLinked: "OAuthAccountNotLinked",
  EmailSignin: "EmailSignin",
  SessionRequired: "SessionRequired",
  Default: "Default",
} as const;
const ErrorMessagesSchema = z.nativeEnum(ErrorMessage);
type ErrorMessage = z.infer<typeof ErrorMessagesSchema>;

export default async function Signin({
  searchParams,
}: {
  searchParams?: { error: string | undefined; callbackUrl: string | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  const errorParseResult = ErrorMessagesSchema.safeParse(searchParams?.error);

  const errorMessage = errorParseResult.success
    ? (
        {
          [ErrorMessage.OAuthSignin]:
            "Try signing in with a different account.",
          [ErrorMessage.OAuthCallback]:
            "Try signing in with a different account.",
          [ErrorMessage.OAuthCreateAccount]:
            "Try signing in with a different account.",
          [ErrorMessage.EmailCreateAccount]:
            "Try signing in with a different account.",
          [ErrorMessage.Callback]: "Try signing in with a different account.",
          [ErrorMessage.OAuthAccountNotLinked]:
            "To confirm your identity, sign in with the same account you used originally.",
          [ErrorMessage.EmailSignin]: "The e-mail could not be sent.",
          [ErrorMessage.SessionRequired]: "Please sign in to access this page.",
          [ErrorMessage.Default]: "Unable to sign in.",
        } satisfies Record<ErrorMessage, string>
      )[errorParseResult.data]
    : undefined;

  const providers = await getProviders();

  return (
    <div className="max-w-xs mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <EmailSigninForm callbackUrl={searchParams?.callbackUrl} />

          {providers && (
            <>
              <Separator className="my-4" />

              <div className="flex flex-col gap-4">
                {Object.values(providers)
                  .filter((provider) => provider.name !== "Email")
                  .map((provider) => (
                    <ProviderButton
                      key={provider.name}
                      id={provider.id}
                      name={provider.name}
                      callbackUrl={searchParams?.callbackUrl}
                    />
                  ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
