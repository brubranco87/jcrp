import { useState } from "react";
import { FileSpreadsheet, FileText, Settings, Loader2, CheckCircle2, XCircle } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";

type JumperState = "idle" | "processing" | "success" | "error";

const Index = () => {
  const [jumperState, setJumperState] = useState<JumperState>("idle");
  const [, setSelectedFile] = useState<File | null>(null);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setJumperState("processing");
    // Mock: simulate processing for 2 seconds
    setTimeout(() => {
      setJumperState("success");
    }, 2000);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setJumperState("idle");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">JCRP</h1>
        <p className="text-sm text-muted-foreground">Automações</p>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AgentCard
            title="JUMPER"
            description="Converte Histórico Operacional em PLANFINAL"
            icon={FileSpreadsheet}
          >
            {jumperState === "idle" && (
              <FileDropZone accept={[".xls"]} onFileSelected={handleFileSelected} />
            )}

            {jumperState === "processing" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Processando...</p>
              </div>
            )}

            {jumperState === "success" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <p className="text-sm font-medium">Arquivo pronto!</p>
                <Button size="sm">Baixar PLANFINAL.xlsx</Button>
                <button
                  onClick={handleReset}
                  className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                >
                  Processar outro
                </button>
              </div>
            )}

            {jumperState === "error" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <XCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive">Erro ao processar arquivo</p>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Tentar novamente
                </Button>
              </div>
            )}
          </AgentCard>

          <AgentCard
            title="STONER"
            description="Em breve"
            icon={FileText}
            disabled
          />
          <AgentCard
            title="MAQER"
            description="Em breve"
            icon={Settings}
            disabled
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
