
import { Association } from "@/types/database";
import { AssociationCard } from "./AssociationCard";
import { Loader2 } from "lucide-react";

interface AssociationListProps {
  associations: Association[];
  isLoading: boolean;
}

export function AssociationList({ associations, isLoading }: AssociationListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-epic-blue h-8 w-8" />
      </div>
    );
  }

  if (associations.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p className="text-base md:text-lg">Nenhuma associação cadastrada ainda</p>
        <p className="text-sm mt-2">Crie sua primeira associação acima</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {associations.map((association) => (
        <AssociationCard key={association.id} association={association} />
      ))}
    </div>
  );
}
