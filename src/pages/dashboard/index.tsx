import { Textarea } from "@/components/textarea";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { MdShare } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import Head from "next/head";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { db } from "@/services/firebaseConnection";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";
import toast from "react-hot-toast";

interface DashboardProps {
  user: {
    email: string;
  };
}

interface TaskProps {
  id: string;
  created: Date;
  public: boolean;
  task: string;
  user: string;
}

export default function Dashboard({ user }: DashboardProps) {
  const [input, setInput] = useState<string>("");
  const [publicTask, setPublicTask] = useState<boolean>(false);
  const [tasks, setTasks] = useState<TaskProps[]>([]);

  useEffect(() => {
    async function loadTasks() {
      const tasksRef = collection(db, "tasks");
      const q = query(
        tasksRef,
        orderBy("created", "desc"),
        where("user", "==", user?.email)
      );
      onSnapshot(q, (snapshot) => {
        const list = [] as TaskProps[];
        snapshot.forEach((doc) => {
          list.push({
            id: doc.id,
            task: doc.data().task,
            created: doc.data().created,
            public: doc.data().public,
            user: doc.data().user,
          });
        });
        setTasks(list);
      });
    }
    loadTasks();
  }, [user?.email]);

  function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
    setPublicTask(event.target.checked);
  }

  async function handleRegisterTask(event: FormEvent) {
    event.preventDefault();
    if (input === "") return;
    try {
      await addDoc(collection(db, "tasks"), {
        task: input,
        created: new Date(),
        user: user?.email,
        public: publicTask,
      });
      toast.success("Registered task");

      setInput("");
      setPublicTask(false);
    } catch (err) {
      console.log(err);
      toast.error("Error registering task");
    }
  }

  async function handleShare(id: string) {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/task/${id}`
    );
    toast.success("Link copied");
  }

  async function handleDelete(id: string) {
    try {
      const docRef = doc(db, "tasks", id);
      await deleteDoc(docRef);

      const q = query(collection(db, "comments"), where("taskId", "==", id));
      const commentsSnapshot = await getDocs(q);
      toast.success("Task deleted");

      commentsSnapshot.forEach(async (item) => {
        try {
          await deleteDoc(item.ref);
        } catch (deleteCommentError) {
          console.error(
            `Error deleting comment document with ID ${item.id}:`,
            deleteCommentError
          );
        }
      });
    } catch (deleteTaskError) {
      console.error(
        `Error deleting task document with ID ${id}:`,
        deleteTaskError
      );
      toast.error(`Error deleting task`);
    }
  }

  return (
    <div className="w-full">
      <Head>
        <title>Dashboard</title>
      </Head>
      <main className="drop-shadow">
        <section className="w-full bg-black flex items-center justify-center">
          <div className="w-full max-w-5xl py-0 px-5 pb-7 mt-10">
            <h1 className="text-white mb-5 text-4xl font-bold">
              What is your task?
            </h1>
            <form onSubmit={handleRegisterTask}>
              <Textarea
                value={input}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(event.target.value)
                }
                placeholder="Enter a task to register here :)"
              />
              <div className="mx-0 px-1 mt-1 mb-4 flex items-center">
                <input
                  className="w-3 h-3"
                  type="checkbox"
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label className="text-white ml-1 text-sm">Public Task</label>{" "}
              </div>
              <button
                className="w-full border-0 rounded-md text-white bg-blue-800 hover:scale-105 transition-all ease-in-out duration-150 py-2 px-0 text-lg"
                type="submit"
              >
                Register
              </button>
            </form>
          </div>
        </section>
        <section className="mt-9 mx-auto mb-0 py-0 px-5 max-w-5xl w-full flex flex-col no-underline text-black">
          <h1 className="text-center font-bold text-4xl mb-4">My Tasks</h1>
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center text-xl m-2 text-center">
              <p>
                Oops! It looks like you don't have{" "}
                <span className="text-red-500">any</span> tasks registered{" "}
                <span className="text-red-500">:(</span>
              </p>
            </div>
          ) : (
            ""
          )}
          {tasks.map((item) => (
            <article
              key={item.id}
              className="mb-4 relative leading-normal min-h-24 flex border-2 border-neutral-500 rounded p-1 flex-col items-start"
            >
              <div className="flex  w-full items-center p-1 justify-between">
                {item.public ? (
                  <div className="flex w-full items-center absolute top-1 justify-between">
                    <div className="flex items-center">
                      <small className="bg-blue-500/70 tracking-wide select-none text-xs rounded text-white py-1 px-1 uppercase">
                        Public Task
                      </small>
                      <button
                        onClick={() => handleShare(item.id)}
                        className="bg-transparent border-none cursor-pointer border-0 mx-2"
                      >
                        <MdShare size={20} color="#3183ffa9" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex w-full items-center absolute top-1 justify-between">
                    <div className="flex items-center">
                      <small className="bg-red-500/70 text-xs select-none rounded text-white py-1 px-1 uppercase">
                        Private Task
                      </small>
                      <p className="bg-transparent border-none border-0 mx-2">
                        <FaLock size={18} color="#EC7474" />
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex absolute right-2 bottom-1/2 transform translate-y-1/2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="cursor-pointer font-bold bg-transparent border-0 my-0 mx-2"
                  >
                    <FaRegTrashCan size={22} color="#EC7474" />
                  </button>
                </div>
              </div>

              <div className="flex min-h-24 p-1 items-center justify-center w-full">
                {item.public ? (
                  <div className="flex flex-col w-full">
                    <div className="text-center">
                      <p className="sm:text-xl text-sm text-slate-800 mt-4 text-pretty py-2 px-10">
                        {item.task}
                      </p>
                    </div>

                    <div className="mt-1 ">
                      <Link href={`/task/${item.id}`}>
                        <small className="uppercase text-xs px-2 py-1 hover:scale-110 hover:bg-blue-800/90 hover:text-white transition-all ease-in-out text-blue-800/90 font-medium tracking-wide cursor-pointer rounded bg-slate-100/80">
                          Ver Tarefa
                        </small>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="sm:text-xl text-sm text-slate-800 mt-3 mr-4 text-center text-pretty py-2 px-10">
                    {item.task}
                  </p>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });
  if (!session?.user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {
      user: {
        email: session?.user?.email,
      },
    },
  };
};
