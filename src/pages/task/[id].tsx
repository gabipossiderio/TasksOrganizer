import { Textarea } from "@/components/textarea";
import { db } from "@/services/firebaseConnection";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { FaTrash } from "react-icons/fa";
import { ChangeEvent, FormEvent, useState } from "react";
import toast from "react-hot-toast";

interface TaskProps {
  item: {
    task: string;
    created: string;
    public: boolean;
    user: string;
    taskId: string;
  };
  commentsList: CommentProps[];
}

interface CommentProps {
  id: string;
  comment: string;
  taskId: string;
  user: string;
  name: string;
}

export default function Task({ item, commentsList }: TaskProps) {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [comments, setComments] = useState<CommentProps[]>(commentsList || []);
  const email: string = item.user;

  const atIndex: number = email.indexOf("@");
  const frontPart: string | null =
    atIndex !== -1 ? email.slice(0, atIndex) : null;

  async function handleComments(e: FormEvent) {
    e.preventDefault();
    if (input === "") {
      return;
    }

    if (!session?.user?.email || !session?.user?.name) {
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "comments"), {
        comment: input,
        created: new Date(),
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId,
      });

      const data = {
        id: docRef.id,
        comment: input,
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId,
      };
      toast.success(
        "Comment posted"
      );

      setComments((oldItems) => [data, ...oldItems]);
      setInput("");
    } catch (err) {
      console.error(err);
      toast.error(
        "Error adding comment"
      );
    }
  }

  async function handleDelete(id: string) {
    try {
      const docRef = doc(db, "comments", id);
      await deleteDoc(docRef);
      const notDeletedComment = comments.filter((item) => item.id !== id);
      toast.success(
        "Comment deleted"
      );
      setComments(notDeletedComment);
    } catch (err) {
      console.error(err);
      toast.error(
        "Error deleting comment"
      );
    }
  }

  return (
    <div className="w-full max-w-5xl mt-10 mx-auto mb-0 py-0 px-5 flex flex-col justify-center items-center">
      <Head>
        <title>@{frontPart} | Task</title>
      </Head>
      <main className="w-full">
        <h1 className="mt-6 mb-10 text-center text-black text-3xl select-none">
          @{frontPart} | Task
        </h1>
        <section>
          <article className="p-4 flex items-center justify-center rounded border-2 leading-normal border-neutral-800">
            <p className="w-full">{item.task}</p>
          </article>
        </section>
      </main>
      <section className="w-full my-4 mx-0 max-w-5xl">
        <h2 className="mx-0 my-4 text-xl">Leave your comment</h2>
        <form onSubmit={handleComments}>
          <Textarea
            value={input}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
            placeholder="Enter your comment here :)"
          />
          <button
            disabled={!session?.user}
            className="disabled:cursor-not-allowed disabled:bg-blue-600/50  bg-blue-800 hover:scale-105 transition-all ease-in-out duration-150 py-2 px-0 text-lg w-full border-0 border-none rounded text-white cursor-pointer mt-3"
          >
            Send Comment
          </button>
        </form>
      </section>
      <section className="flex flex-col justify-start w-full">
        <h2 className="mx-0 my-4 text-xl">All comments</h2>
        {comments.length === 0 && (
          <div className="w-full text-center border-2 border-neutral-400 p-4 rounded mb-4 text-lg mt-2">
            Oops! It seems this task doesn't have any comments yet :(
          </div>
        )}

        {comments.map((item) => (
          <article
            className="border-2 border-neutral-400 p-4 rounded mb-4"
            key={item.id}
          >
            <div className="flex items-center">
              <small className="bg-neutral-300 text-xs py-1 px-2 mr-2 rounded text-gray-900 select-none">
                {item.name}
              </small>
              {item.user === session?.user?.email && (
                <button
                  onClick={() => handleDelete(item.id)}
                  className="cursor-pointer font-bold bg-transparent border-0 my-0"
                >
                  <FaTrash size={16} color="#a02323" />
                </button>
              )}
            </div>
            <p className="mt-2 p-1">{item.comment}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const taskId = params?.id as string;
  const taskDocRef = doc(db, "tasks", taskId);
  const q = query(collection(db, "comments"), where("taskId", "==", taskId));
  const commentsSnapshot = await getDocs(q);

  let allComments: CommentProps[] = [];
  commentsSnapshot.forEach((doc) => {
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      user: doc.data().user,
      name: doc.data().name,
      taskId: doc.data().taskId,
    });
  });

  const taskSnapshot = await getDoc(taskDocRef);

  if (taskSnapshot.data() === undefined) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (!taskSnapshot.data()?.public) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const milliseconds = taskSnapshot.data()?.created.seconds * 1000;
  const taskData = {
    task: taskSnapshot.data()?.task,
    public: taskSnapshot.data()?.public,
    created: new Date(milliseconds).toLocaleDateString(),
    user: taskSnapshot.data()?.user,
    taskId: taskId,
  };

  return {
    props: {
      item: taskData,
      commentsList: allComments,
    },
  };
};
