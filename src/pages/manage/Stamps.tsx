import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image, Loader2, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { useStamps } from "@/hooks/useStamps";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { processImageForAR } from '@/lib/ar-utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const StampsManager = () => {
  const [stampName, setStampName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingStamp, setEditingStamp] = useState<{ id: string; name: string } | null>(null);
  const [newName, setNewName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { stamps, isLoading, uploadStamp, deleteStamp, updateStampName } = useStamps();
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("O arquivo é muito grande. Tamanho máximo: 5MB");
      return false;
    }

    return true;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!stampName.trim()) {
      toast.error("Por favor, insira um nome para a estampa");
      return;
    }

    if (!validateFile(file)) return;

    try {
      await handleUpload(file);
      setStampName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error("Erro ao fazer upload da estampa. Tente novamente.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!stampName.trim()) {
      toast.error("Por favor, insira um nome para a estampa");
      return;
    }

    if (!validateFile(file)) return;

    try {
      await handleUpload(file);
      setStampName("");
    } catch (error) {
      toast.error("Erro ao fazer upload da estampa. Tente novamente.");
    }
  };

  const handleDelete = async () => {
    if (!selectedStamp) return;
    
    try {
      await deleteStamp.mutateAsync(selectedStamp);
      setShowDeleteDialog(false);
      setSelectedStamp(null);
    } catch (error) {
      toast.error("Erro ao excluir estampa. Tente novamente.");
    }
  };

  const handleEdit = async () => {
    if (!editingStamp || !newName.trim()) return;
    
    try {
      await updateStampName.mutateAsync({ id: editingStamp.id, name: newName });
      setIsEditSheetOpen(false);
      setEditingStamp(null);
      setNewName("");
    } catch (error) {
      toast.error("Erro ao atualizar nome da estampa. Tente novamente.");
    }
  };

  const openEditSheet = (stamp: { id: string; name: string }) => {
    setEditingStamp(stamp);
    setNewName(stamp.name);
    setIsEditSheetOpen(true);
  };

  const handleUpload = async (file: File) => {
    try {
      // Primeiro fazer upload da imagem original
      const { data: uploadData, error: uploadError } = await uploadStamp.mutateAsync({ file, name: stampName });

      if (uploadError) throw uploadError;

      // Obter URL da imagem original
      const { data: { publicUrl } } = uploadData;

      // Processar imagem para AR
      const processedImageUrl = await processImageForAR(publicUrl);

      // Fazer upload da imagem processada
      const processedFile = await fetch(processedImageUrl).then(res => res.blob());
      const { data: processedData, error: processedError } = await uploadStamp.mutateAsync({ file: processedFile, name: stampName });

      if (processedError) throw processedError;

      toast.success('Estampa enviada com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar estampa');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-epic-black mb-2">
          Gerenciar Estampas
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Faça upload e gerencie suas estampas
        </p>
      </header>

      <Card className="mb-6 md:mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Upload className="text-epic-blue h-5 w-5 md:h-6 md:w-6" />
            Upload de Estampa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Nome da estampa"
              value={stampName}
              onChange={(e) => setStampName(e.target.value)}
              className="text-base md:text-lg"
            />
            <div
              className={`border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors
                ${isDragging ? 'border-epic-blue bg-epic-blue/5' : 'border-epic-blue/40 hover:border-epic-blue/70'}
                ${uploadStamp.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-4">
                <Image className="w-12 h-12 text-epic-blue/60" />
                <div>
                  <p className="text-base md:text-lg font-medium mb-1">
                    Arraste sua estampa aqui
                  </p>
                  <p className="text-sm text-muted-foreground">
                    JPEG, PNG ou WebP (max. 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                />
                <Button
                  variant="default"
                  className="bg-epic-blue hover:bg-epic-blue/90 w-full md:w-auto"
                  disabled={uploadStamp.isPending}
                >
                  {uploadStamp.isPending ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Enviando...
                    </>
                  ) : (
                    "Selecionar Arquivo"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Image className="text-epic-blue h-5 w-5 md:h-6 md:w-6" />
            Estampas Cadastradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-epic-blue h-8 w-8" />
            </div>
          ) : stamps.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" />
              <p className="text-base md:text-lg">Nenhuma estampa cadastrada ainda</p>
              <p className="text-sm mt-2">Faça upload da sua primeira estampa acima</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {stamps.map((stamp) => (
                <div
                  key={stamp.id}
                  className="border rounded-lg p-3 md:p-4 space-y-2 hover:border-epic-blue/40 transition-colors group"
                >
                  {/* Debug info */}
                  <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto">
                    {JSON.stringify(stamp, null, 2)}
                  </pre>

                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 relative group">
                    <img
                      src={stamp.image_url}
                      alt={stamp.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        console.error('Erro ao carregar imagem:', stamp.image_url);
                        e.currentTarget.src = 'https://placehold.co/400x400?text=Erro+ao+carregar';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-9 w-9"
                        onClick={() => openEditSheet(stamp)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-9 w-9"
                        onClick={() => {
                          setSelectedStamp(stamp.id);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="font-medium text-center text-sm md:text-base truncate px-2">
                    {stamp.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Estampa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta estampa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteStamp.isPending ? (
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

      {/* Sheet de edição */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar Estampa</SheetTitle>
            <SheetDescription>
              Atualize o nome da estampa. Clique em salvar quando terminar.
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Novo nome da estampa"
            />
          </div>
          
          <SheetFooter>
            <Button
              onClick={() => setIsEditSheetOpen(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEdit}
              disabled={updateStampName.isPending || !newName.trim()}
            >
              {updateStampName.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default StampsManager;
