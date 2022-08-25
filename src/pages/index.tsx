import type { NextPage } from "next";
import Head from "next/head";
import Navbar from "../components/Navbar";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Clippy</title>
        <meta name="description" content="Self-hosted clips" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <main className="container min-h-screen text-gray-400 bg-gray-800"></main>
    </>
  );
};

export default Home;
