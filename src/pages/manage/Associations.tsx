
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2 } from "lucide-react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useAssociations } from "@/hooks/useAssociations";
import { CreateAssociationModal } from "@/components/associations/CreateAssociationModal";
import { AssociationList } from "@/components/associations/AssociationList";

const AssociationsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { associations, isLoading, createAssociation } = useAssociations();

  const handleCreateAssociation = async (stampId: string, videoId: string) => {
    await createAssociation.mutateAsync({
      stampId,
      videoId,
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-epic-black mb-2">
          Vincular Estampas e Vídeos
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Associe cada estampa ao seu vídeo correspondente
        </p>
      </header>

      <Card className="mb-6 md:mb-8 hover-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Link2 className="text-epic-blue h-5 w-5 md:h-6 md:w-6" />
            Nova Associação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full bg-epic-blue hover:bg-epic-blue/90 text-base md:text-lg h-12 md:h-14"
            onClick={() => setIsDialogOpen(true)}
          >
            Criar Associação
          </Button>

          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <CreateAssociationModal
              onClose={() => setIsDialogOpen(false)}
              onSubmit={handleCreateAssociation}
              isSubmitting={createAssociation.isPending}
            />
          </AlertDialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Link2 className="text-epic-blue h-5 w-5 md:h-6 md:w-6" />
            Associações Existentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AssociationList
            associations={associations}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AssociationsManager;
