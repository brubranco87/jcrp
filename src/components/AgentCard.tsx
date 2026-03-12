import { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  disabled?: boolean;
  children?: React.ReactNode;
}

const AgentCard = ({ title, description, icon: Icon, disabled = false, children }: AgentCardProps) => {
  return (
    <Card
      className={cn(
        "relative transition-shadow hover:shadow-md",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      {disabled && (
        <Badge variant="secondary" className="absolute top-3 right-3 text-[10px]">
          Em breve
        </Badge>
      )}
      <CardHeader className="items-center gap-2">
        <Icon className="h-8 w-8 text-muted-foreground" />
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground text-center">{description}</p>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
};

export default AgentCard;
