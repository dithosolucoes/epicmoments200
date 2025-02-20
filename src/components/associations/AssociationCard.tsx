
import { Association } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useAssociations } from "@/hooks/useAssociations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface AssociationCardProps {
  association: Association;
}

export function AssociationCard({ association }: AssociationCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteAssociation } = useAssociations();

  const handleDelete = async () => {
    await deleteAssociation.mutateAsync(association.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="border rounded-lg p-3 md:p-4 space-y-3 hover:border-epic-blue/40 transition-colors relative group">
        <div className="space-y-2">
          <p className="font-medium text-sm md:text-base">Estampa:</p>
          <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
            <img
              src={association.stamp?.image_url}
              alt={association.stamp?.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <p className="text-sm text-center truncate px-2">
            {association.stamp?.name}
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-sm md:text-base">Vídeo:</p>
          <div className="aspect-video rounded-lg overflow-hidden bg-slate-100">
            <video
              src={association.video?.video_url}
              controls
              className="w-full h-full object-cover"
              preload="none"
              playsInline
            />
          </div>
          <p className="text-sm text-center truncate px-2">
            {association.video?.title}
          </p>
        </div>

        {/* Botão de exclusão */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="destructive"
            className="h-8 w-8"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Associação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta associação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAssociation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Sim, excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
