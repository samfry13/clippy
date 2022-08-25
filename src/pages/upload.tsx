import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Navbar from "../components/Navbar";
import Image from "next/future/image";
import useUploadForm from "../utils/useUploadForm";

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      session: await unstable_getServerSession(
        context.req,
        context.res,
        authOptions
      ),
    },
  };
};

const Upload = () => {
  const { data: session } = useSession();
  useEffect(() => {
    if (!session?.user) {
      signIn();
    }
  }, [session]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const {
    uploadForm,
    fileSelected,
    status,
    message,
    progress,
    file,
    fileName,
  } = useUploadForm("/api/upload");

  return (
    <>
      <Head>
        <title>Clippy - Upload</title>
      </Head>

      <Navbar />
      <main className="container min-h-screen text-gray-400 bg-gray-800">
        <div className="pt-5 text-center">
          <label className="inline-block max-w-full mt-2">
            <div className="p-5 bg-gray-600 rounded-3xl">
              <form
                className="border-dashed border-4 border-gray-400 rounded-lg cursor-pointer"
                id="upload-form"
                encType="multipart/form-data"
                method="POST"
                action="/api/upload"
              >
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    fileSelected(e.target.files?.[0]);
                  }}
                />
                <div className="flex flex-col h-full w-full justify-center items-center min-w-[300px] min-h-[150px]">
                  <Image src="/upload-icon.png" width={100} height={100} />
                  <span className="text-gray-300 font-bold">
                    Click here to browse or drop file here
                  </span>
                </div>
                <div className="flex flex-col justify-center items-center pb-5">
                  <input
                    className="mt-5 border-[1px] border-gray-200 rounded-lg py-1 px-2 outline-0 text-[14pt] w-5/6"
                    placeholder="Optional title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <textarea
                    className="mt-5 border-[1px] border-gray-200 rounded-lg text-[14pt] py-1 px-2 outline-0 w-5/6"
                    placeholder="Optional description"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />

                  {fileName && (
                    <div className="flex w-full px-5 pt-5 justify-between items-center">
                      <span className="font-bold text-gray-300">
                        {fileName}
                      </span>
                      <Image
                        src="/close-icon.png"
                        width={20}
                        height={20}
                        onClick={() => fileSelected(null)}
                      />
                    </div>
                  )}

                  {message && (
                    <span className="font-bold text-gray-300 whitespace-normal px-5 break-words max-w-[300px] mt-5">
                      {message}
                    </span>
                  )}

                  {file && (
                    <div className="w-full px-5 pt-5">
                      <button
                        className="border-0 shadow-none w-full p-4 bg-black text-gray-300 rounded-lg cursor-pointer"
                        type="button"
                        onClick={() => {
                          const formData = new FormData();
                          formData.append("video_title", title);
                          formData.append("video_description", description);
                          formData.append("video_file", file);
                          uploadForm(formData);
                        }}
                      >
                        Upload
                      </button>
                    </div>
                  )}

                  {progress ? (
                    <div className="w-full px-5 pt-5">
                      <div
                        className="h-7 bg-[linear-gradient(45deg,#c7c7c7,#ae81ff)] rounded-md flex justify-center items-center"
                        style={{ width: `${progress}%` }}
                      >
                        <span className="font-bold text-black">
                          {progress}%
                        </span>
                      </div>
                      <div className="flex-grow" />
                    </div>
                  ) : null}
                </div>
              </form>
            </div>
          </label>
        </div>
      </main>
    </>
  );
};

export default Upload;
