import { useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";

type SlotState = "idle" | "processing" | "done" | "error";

export interface SlotInfo {
  state: SlotState;
  count: number;
  errorMessage: string;
}

interface UseMultiUploadReturn {
  slots: Record<string, SlotInfo>;
  allDone: boolean;
  downloadState: "idle" | "processing" | "success" | "error";
  downloadUrl: string | null;
  downloadError: string;
  uploadSlot: (unit: string, file: File) => void;
  resetSlot: (unit: string) => void;
  downloadFinal: () => void;
  resetAll: () => void;
}

const UNITS = ["JCRP", "PAN", "BARU"];
const WEBHOOK = "https://fatspidermonkey-n8n.cloudfy.live/webhook/stoner";
const DOWNLOAD_WEBHOOK = "https://fatspidermonkey-n8n.cloudfy.live/webhook/stoner-download";

function makeInitialSlots(): Record<string, SlotInfo> {
  const s: Record<string, SlotInfo> = {};
  for (const u of UNITS) s[u] = { state: "idle", count: 0, errorMessage: "" };
  return s;
}

async function convertXlsxToCsv(file: File): Promise<File> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const csv = XLSX.utils.sheet_to_csv(ws);
  return new File([new Blob([csv], { type: "text/csv" })], "stone.csv", { type: "text/csv" });
}

export function useMultiUpload(): UseMultiUploadReturn {
  const [slots, setSlots] = useState<Record<string, SlotInfo>>(makeInitialSlots);
  const [downloadState, setDownloadState] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState("");
  const abortRefs = useRef<Record<string, AbortController>>({});

  const allDone = UNITS.every((u) => slots[u]?.state === "done");

  const updateSlot = (unit: string, patch: Partial<SlotInfo>) =>
    setSlots((prev) => ({ ...prev, [unit]: { ...prev[unit], ...patch } }));

  const uploadSlot = useCallback((unit: string, file: File) => {
    const controller = new AbortController();
    abortRefs.current[unit]?.abort();
    abortRefs.current[unit] = controller;
    const timeout = setTimeout(() => controller.abort(), 60000);

    updateSlot(unit, { state: "processing", errorMessage: "", count: 0 });

    convertXlsxToCsv(file)
      .then((csvFile) => {
        const fd = new FormData();
        fd.append("file", csvFile);
        return fetch(`${WEBHOOK}?unidade=${unit}`, { method: "POST", body: fd, signal: controller.signal });
      })
      .then(async (res) => {
        clearTimeout(timeout);
        if (!res.ok) throw new Error("status");
        const json = await res.json();
        if (json.status !== "ok") throw new Error("status");
        updateSlot(unit, { state: "done", count: json.count ?? 0 });
      })
      .catch((err) => {
        clearTimeout(timeout);
        const msg =
          err.name === "AbortError"
            ? "Tempo esgotado. Tente novamente."
            : err instanceof TypeError
              ? "Erro de conexão. Verifique sua internet."
              : "Erro ao processar. Tente novamente.";
        updateSlot(unit, { state: "error", errorMessage: msg });
      });
  }, []);

  const resetSlot = useCallback((unit: string) => {
    abortRefs.current[unit]?.abort();
    setSlots((prev) => ({ ...prev, [unit]: { state: "idle", count: 0, errorMessage: "" } }));
  }, []);

  const downloadFinal = useCallback(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    setDownloadState("processing");
    setDownloadError("");

    fetch(DOWNLOAD_WEBHOOK, { method: "POST", signal: controller.signal })
      .then(async (res) => {
        clearTimeout(timeout);
        if (!res.ok) throw new Error("status");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDownloadState("success");
      })
      .catch((err) => {
        clearTimeout(timeout);
        const msg =
          err.name === "AbortError"
            ? "Tempo esgotado. Tente novamente."
            : "Erro ao baixar. Tente novamente.";
        setDownloadError(msg);
        setDownloadState("error");
      });
  }, []);

  const resetAll = useCallback(() => {
    Object.values(abortRefs.current).forEach((c) => c.abort());
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setSlots(makeInitialSlots());
    setDownloadState("idle");
    setDownloadUrl(null);
    setDownloadError("");
  }, [downloadUrl]);

  return { slots, allDone, downloadState, downloadUrl, downloadError, uploadSlot, resetSlot, downloadFinal, resetAll };
}
