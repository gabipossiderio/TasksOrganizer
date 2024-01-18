import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { RxDashboard } from "react-icons/rx";
import { FiLogIn, FiLogOut } from "react-icons/fi";
import { useMediaQuery } from "react-responsive";


export function Header() {
  const { data: session, status } = useSession();
  const isDesktopOrLaptop = useMediaQuery({ minWidth: 640 });

  return (
    <header className="w-full h-auto min-h-20 bg-black flex items-center justify-center">
      <section className="py-3 px-5 w-full max-w-5xl flex flex-row items-center justify-between">
        <nav className="flex items-center mb-0">
          <Link className="no-underline" href="/">
            <h1 className="text-white text-3xl font-medium">
              Tasks<span className="text-red-600 px-1">+</span>
            </h1>
          </Link>
        </nav>
        {status === "loading" ? (
          <></>
        ) : (
          <div className="flex flex-row items-center">
          {session?.user && (
            <Link
              className="bg-white text-black py-2 px-5 sm:px-4 rounded-md my-0 sm:mx-4"
              href="/dashboard"
            >
              {isDesktopOrLaptop ?  "Dashboard" : <RxDashboard />}
            </Link>
          )}
          {session ? (
            <button
              onClick={() => signOut()}
              className="py-2 px-5 rounded-3xl border-2 border-white cursor-pointer hover:scale-105 hover:bg-white hover:text-black hover:font-bold transition-all ease-in-out text-white mt-0 ml-2 sm:ml-4"
            >
             {isDesktopOrLaptop ?  "Sign Out" : <FiLogOut />}
            </button>
          ) : (
            <button
              onClick={(e) => {
                signIn("google");
              }}
              className="py-2 px-5  rounded-3xl border-2 border-white cursor-pointer hover:scale-105 hover:bg-white hover:text-black hover:font-bold transition-all ease-in-out text-white mt-0 ml-4"
            >
              {window.innerWidth >= 640 ? "Sign In" : <FiLogIn />}
            </button>
          )}
        </div>
        
        )}
      </section>
    </header>
  );
}
