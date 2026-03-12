import { FileSpreadsheet, FileText, Settings } from "lucide-react";
import AgentCard from "@/components/AgentCard";

const Index = () => {
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
          />
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
