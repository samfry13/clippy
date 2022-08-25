import { useState } from "react";

type UploadStatus = "idle" | "loading" | "processing" | "success" | "error";

const useUploadForm = (url: string) => {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("No File Selected");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  const fileSelected = (file: File | null | undefined) => {
    if (!file) {
      setFile(null);
      setFileName("");
      setMessage("No File Selected");
      return;
    }
    if (file.size > 104857600) {
      setMessage(
        "Your file is too big. It can't be accepted. Please select a smaller file."
      );
      setStatus("error");
    }

    setFile(file);

    setMessage("");
    setProgress(0);

    const filename =
      file.name.length <= 20
        ? file.name
        : `${file.name.substring(0, 14)}...${file.name.substring(
            file.name.length - 3
          )}`;
    setFileName(filename);
  };

  const uploadForm = (formData: FormData) => {
    if (status === "loading" || status === "processing") return;
    setStatus("loading");
    setProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener(
      "progress",
      (e) => {
        if (e.lengthComputable) {
          const bytesUploaded = e.loaded;
          const bytesTotal = e.total;
          const percentComplete = Math.round(
            (bytesUploaded / bytesTotal) * 100
          );
          setProgress(percentComplete);
          if (percentComplete === 100) {
            setStatus("processing");
            setMessage("Processing video... please wait");
          }
        } else {
          setMessage("Unable to compute progress.");
        }
      },
      false
    );
    xhr.addEventListener(
      "load",
      (e: any) => {
        const message = JSON.parse(e.target.responseText).message;
        const isSuccess = e.target?.status < 400;
        setProgress(0);
        setMessage(message);
        setStatus(isSuccess ? "success" : "error");
        setFile(null);
        setFileName("");
      },
      false
    );
    xhr.addEventListener(
      "error",
      () => {
        setMessage("An error occurred while uploading the file.");
        setStatus("error");
        setProgress(0);
      },
      false
    );
    xhr.addEventListener(
      "abort",
      () => {
        setMessage(
          "The upload has been canceled by the user or the browser dropped the connection."
        );
        setStatus("error");
        setProgress(0);
      },
      false
    );

    xhr.open("POST", url);
    xhr.send(formData);
  };

  return {
    uploadForm,
    fileSelected,
    status,
    message,
    progress,
    fileName,
    file,
  };
};

export default useUploadForm;
