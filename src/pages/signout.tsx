import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

const Signout = () => {
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    try {
      if (session?.user) {
        signOut();
      }
    } catch (e) {
      router.push("/");
    }
  }, [session?.user, router]);
  return <div />;
};

export default Signout;
