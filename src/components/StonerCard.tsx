import { Loader2, CheckCircle2, XCircle, Download } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { useMultiUpload } from "@/hooks/useMultiUpload";
import { useCallback } from "react";

const UNITS = ["JCRP", "PAN", "BARU"] as const;

const StonerCard = () => {
  const { slots, allDone, downloadState, downloadUrl, downloadError, uploadSlot, resetSlot, downloadFinal, resetAll } =
    useMultiUpload();

  const handleFile = useCallback(
    (unit: string) => (file: File) => uploadSlot(unit, file),
    [uploadSlot]
  );

  return (
    <div className="flex flex-col gap-4">
      {UNITS.map((unit) => {
        const slot = slots[unit];
        return (
          <div key={unit}>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">{unit}</p>

            {slot.state === "idle" && (
              <FileDropZone accept={[".xlsx"]} onFileSelected={handleFile(unit)} />
            )}

            {slot.state === "processing" && (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Processando {unit}...</span>
              </div>
            )}

            {slot.state === "done" && (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-4">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">
                  {unit}: {slot.count} linhas ✓
                </span>
              </div>
            )}

            {slot.state === "error" && (
              <div className="flex flex-col gap-2 rounded-md border border-destructive/50 bg-destructive/5 p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">{slot.errorMessage}</span>
                </div>
                <Button variant="outline" size="sm" className="w-fit" onClick={() => resetSlot(unit)}>
                  Tentar novamente
                </Button>
              </div>
            )}
          </div>
        );
      })}

      {downloadState === "processing" && (
        <div className="flex items-center justify-center gap-2 py-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Gerando arquivo...</span>
        </div>
      )}

      {downloadState === "success" && (
        <div className="flex flex-col items-center gap-2 py-3">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <Button size="sm" asChild>
            <a href={downloadUrl!} download="STONER_output.xlsx">Baixar STONER_output.xlsx</a>
          </Button>
          <button onClick={resetAll} className="text-xs text-muted-foreground underline hover:text-foreground transition-colors">
            Processar novamente
          </button>
        </div>
      )}

      {downloadState === "error" && (
        <div className="flex flex-col items-center gap-2 py-3">
          <XCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{downloadError}</p>
          <Button variant="outline" size="sm" onClick={downloadFinal}>Tentar novamente</Button>
        </div>
      )}
    </div>
  );
};

export default StonerCard;
