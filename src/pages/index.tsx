import Head from "next/head";
import Image from "next/image";
import heroImg from "../../public/assets/hero.png";
import { GetStaticProps } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebaseConnection";

interface HomeProps {
  posts: number;
  comments: number;
}

export default function Home({ posts, comments }: HomeProps) {
  return (
    <div className="bg-black select-none w-full h-[calc(100vh-_80px)] flex justify-center items-center flex-col">
      <Head>
        <title>Tasks+ | Organize Yourself</title>
        <meta property="og:url" content="https://tasksplus.gabis.dev/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Tasks+" />
        <meta
          property="og:description"
          content="Organize your studies and tasks"
        />
        <meta
          property="og:image"
          content="https://tasksplus.gabis.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fhero.397efab8.png&w=640&q=75"
        />
      </Head>
      <main className="flex flex-col gap-2">
        <div className="flex flex-col items-center justify-center">
          <Image
            className="w-auto h-auto max-w-80 object-contain sm:max-w-md"
            alt="Tasks Logo"
            src={heroImg}
            priority
          />
        </div>
        <h1 className="text-white text-center m-7 leading-relaxed text-xl sm:text-4xl font-bold">
          Organize <span className="text-red-600">your</span> studies and tasks
          <span className="block leading-relaxed">
            with Tasks<span className="text-red-600">+</span>
          </span>
        </h1>
        <section className="flex flex-col sm:flex-row sm:gap-0 gap-5 items-center justify-around">
          <article className="bg-white py-4 px-11 rounded-md hover:scale-105 transition-all duration-500 ease-in-out">
            <p>+{posts} posts</p>
          </article>
          <article className="bg-white py-4 px-6 rounded-md hover:scale-105 transition-all duration-500 ease-in-out">
            <p>+{comments} comments</p>
          </article>
        </section>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const commentRef = collection(db, "comments");
  const postRef = collection(db, "tasks");
  const commentSnapshot = await getDocs(commentRef);
  const postSnapshot = await getDocs(postRef);

  return {
    props: {
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0,
    },
    revalidate: 60,
  };
};
