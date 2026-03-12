import { useState, useCallback, useRef } from "react";

type AgentUploadState = "idle" | "processing" | "success" | "error";

interface UseAgentUploadReturn {
  state: AgentUploadState;
  errorMessage: string;
  downloadUrl: string | null;
  upload: (file: File) => void;
  reset: () => void;
}

export function useAgentUpload(webhookUrl: string): UseAgentUploadReturn {
  const [state, setState] = useState<AgentUploadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setState("idle");
    setErrorMessage("");
    setDownloadUrl(null);
  }, [downloadUrl]);

  const upload = useCallback((file: File) => {
    const controller = new AbortController();
    abortRef.current = controller;

    const timeout = setTimeout(() => controller.abort(), 60000);

    setState("processing");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);

    fetch(webhookUrl, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })
      .then(async (response) => {
        clearTimeout(timeout);
        if (!response.ok) {
          throw new Error("status");
        }
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("spreadsheet") && !contentType.includes("octet-stream")) {
          throw new Error("content-type");
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setState("success");
      })
      .catch((err) => {
        clearTimeout(timeout);
        if (err.name === "AbortError") {
          setErrorMessage("Tempo esgotado. Tente novamente.");
        } else if (err instanceof TypeError) {
          setErrorMessage("Erro de conexão. Verifique sua internet.");
        } else {
          setErrorMessage("Erro ao processar o arquivo. Tente novamente.");
        }
        setState("error");
      });
  }, [webhookUrl]);

  return { state, errorMessage, downloadUrl, upload, reset };
}
