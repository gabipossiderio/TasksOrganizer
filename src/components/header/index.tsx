import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="w-full h-auto min-h-20 bg-black flex items-center justify-center">
      <section className="py-2 px-4 sm:py-3 sm:px-5 w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between">
        <nav className="flex items-center sm:mb-0">
          <Link className="no-underline" href="/">
            <h1 className="text-white text-3xl font-medium">
              Tasks<span className="text-red-600 px-1">+</span>
            </h1>
          </Link>
        </nav>
        {status === "loading" ? (
          <></>
        ) : (
          <div className="flex flex-col sm:flex-row  items-center">
            {session?.user && (
              <Link
                className="bg-white text-black py-1 px-4 rounded-md my-2 sm:my-0 sm:mx-4"
                href="/dashboard"
              >
                Dashboard
              </Link>
            )}
            {session ? (
              <button
                onClick={() => signOut()}
                className="py-1 px-6 rounded-3xl border-2 border-white cursor-pointer hover:scale-105 hover:bg-white hover:text-black hover:font-bold transition-all ease-in-out text-white mt-2 sm:mt-0 sm:ml-4"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="py-1 px-6 rounded-3xl border-2 border-white cursor-pointer hover:scale-105 hover:bg-white hover:text-black hover:font-bold transition-all ease-in-out text-white mt-2 sm:mt-0 sm:ml-4"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </section>
    </header>
  );
}
