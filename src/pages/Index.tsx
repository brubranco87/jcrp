import { FileSpreadsheet, FileSearch, Settings, Loader2, CheckCircle2, XCircle } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { useAgentUpload } from "@/hooks/useAgentUpload";
import { useCallback } from "react";
import * as XLSX from "xlsx";

const JUMPER_WEBHOOK = "https://fatspidermonkey-n8n.cloudfy.live/webhook/jumper";
const MAQER_WEBHOOK = "https://fatspidermonkey-n8n.cloudfy.live/webhook/maqer";

async function convertXlsxToCsv(file: File): Promise<File> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames.find((n) => n === "Sheet 1") ?? wb.SheetNames[0];
  const csv = XLSX.utils.sheet_to_csv(wb.Sheets[sheetName]);
  const blob = new Blob([csv], { type: "text/csv" });
  return new File([blob], "relatorio_stone.csv", { type: "text/csv" });
}

const Index = () => {
  const { state, errorMessage, downloadUrl, upload, reset } = useAgentUpload(JUMPER_WEBHOOK);
  const maqer = useAgentUpload(MAQER_WEBHOOK);

  const handleMaqerUpload = useCallback(async (file: File) => {
    const csvFile = await convertXlsxToCsv(file);
    maqer.upload(csvFile);
  }, [maqer]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-5 bg-[hsl(120,30%,25%)]">
        <h1 className="text-2xl font-bold tracking-tight text-white">JCRP</h1>
        <p className="text-sm text-white/70">Automações</p>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AgentCard
            title="JUMPER"
            description="Converte Histórico Operacional em PLANFINAL"
            icon={FileSpreadsheet}
          >
            {state === "idle" && (
              <FileDropZone accept={[".xls"]} onFileSelected={upload} />
            )}

            {state === "processing" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Processando...</p>
              </div>
            )}

            {state === "success" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <p className="text-sm font-medium">Arquivo pronto!</p>
                <Button size="sm" asChild>
                  <a href={downloadUrl!} download="PLANFINAL.xlsx">Baixar PLANFINAL.xlsx</a>
                </Button>
                <button
                  onClick={reset}
                  className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                >
                  Processar outro
                </button>
              </div>
            )}

            {state === "error" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <XCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive">{errorMessage}</p>
                <Button variant="outline" size="sm" onClick={reset}>
                  Tentar novamente
                </Button>
              </div>
            )}
          </AgentCard>

          <AgentCard title="STONER" description="Em breve" icon={FileSearch} disabled />
          <AgentCard
            title="MAQER"
            description="Converte XLSX Stone em CSV e envia ao webhook"
            icon={Settings}
          >
            {maqer.state === "idle" && (
              <FileDropZone accept={[".xlsx"]} onFileSelected={handleMaqerUpload} />
            )}

            {maqer.state === "processing" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Processando...</p>
              </div>
            )}

            {maqer.state === "success" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <p className="text-sm font-medium">Arquivo processado!</p>
                {maqer.downloadUrl && (
                  <Button size="sm" asChild>
                    <a href={maqer.downloadUrl} download="MAQERFINAL.xlsx">Baixar MAQERFINAL.xlsx</a>
                  </Button>
                )}
                <button
                  onClick={maqer.reset}
                  className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                >
                  Processar outro
                </button>
              </div>
            )}

            {maqer.state === "error" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <XCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive">{maqer.errorMessage}</p>
                <Button variant="outline" size="sm" onClick={maqer.reset}>
                  Tentar novamente
                </Button>
              </div>
            )}
          </AgentCard>
        </div>
      </main>
    </div>
  );
};

export default Index;
