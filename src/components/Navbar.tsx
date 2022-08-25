import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="z-50 text-purple-500 font-bold text-2xl indent-5 leading-10 w-full h-12 bg-gray-900 border-b-[1px] border-b-gray-800 relative overflow-hidden">
      <Link href="/">Clippy</Link>
      <Link href="/upload">
        <a className="float-none absolute top-1/2 left-1/2 [transform:translate(-50%,-50%)] indent-0">
          Upload
        </a>
      </Link>
    </nav>
  );
};

export default Navbar;
