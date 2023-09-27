import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getCsrfToken, getProviders } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { ProviderButton } from "~/components/provider-button";
import { EmailSigninForm } from "~/components/email-signin-form";

export default async function Signin() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  const providers = await getProviders();
  const csrfToken = await getCsrfToken();

  return (
    <div className="max-w-xs mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>

        <CardContent>
          <EmailSigninForm />

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
