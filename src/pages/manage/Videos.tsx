import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Video, Loader2, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { useVideos } from "@/hooks/useVideos";
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

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const VideosManager = () => {
  const [videoTitle, setVideoTitle] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<{ id: string; title: string } | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { videos, isLoading, uploadVideo, deleteVideo, updateVideoTitle } = useVideos();
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File) => {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error("Tipo de arquivo não suportado. Use MP4, WebM ou QuickTime.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("O arquivo é muito grande. Tamanho máximo: 50MB");
      return false;
    }

    return true;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!videoTitle.trim()) {
      toast.error("Por favor, insira um título para o vídeo");
      return;
    }

    if (!validateFile(file)) return;
    
    try {
      await uploadVideo.mutateAsync({ file, title: videoTitle });
      setVideoTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error("Erro ao fazer upload do vídeo. Tente novamente.");
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

    if (!videoTitle.trim()) {
      toast.error("Por favor, insira um título para o vídeo");
      return;
    }

    if (!validateFile(file)) return;

    try {
      await uploadVideo.mutateAsync({ file, title: videoTitle });
      setVideoTitle("");
    } catch (error) {
      toast.error("Erro ao fazer upload do vídeo. Tente novamente.");
    }
  };

  const handleDelete = async () => {
    if (!selectedVideo) return;
    
    try {
      await deleteVideo.mutateAsync(selectedVideo);
      setShowDeleteDialog(false);
      setSelectedVideo(null);
    } catch (error) {
      toast.error("Erro ao excluir vídeo. Tente novamente.");
    }
  };

  const handleEdit = async () => {
    if (!editingVideo || !newTitle.trim()) return;
    
    try {
      await updateVideoTitle.mutateAsync({ id: editingVideo.id, title: newTitle });
      setIsEditSheetOpen(false);
      setEditingVideo(null);
      setNewTitle("");
    } catch (error) {
      toast.error("Erro ao atualizar título do vídeo. Tente novamente.");
    }
  };

  const openEditSheet = (video: { id: string; title: string }) => {
    setEditingVideo(video);
    setNewTitle(video.title);
    setIsEditSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-epic-black mb-2">
          Gerenciar Vídeos
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Faça upload e gerencie seus vídeos
        </p>
      </header>

      <Card className="mb-6 md:mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Upload className="text-epic-blue h-5 w-5 md:h-6 md:w-6" />
            Upload de Vídeo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Título do vídeo"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="text-base md:text-lg"
            />
            <div
              className={`border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors
                ${isDragging ? 'border-epic-blue bg-epic-blue/5' : 'border-epic-blue/40 hover:border-epic-blue/70'}
                ${uploadVideo.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-4">
                <Video className="w-12 h-12 text-epic-blue/60" />
                <div>
                  <p className="text-base md:text-lg font-medium mb-1">
                    Arraste seu vídeo aqui
                  </p>
                  <p className="text-sm text-muted-foreground">
                    MP4, WebM ou QuickTime (max. 50MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                />
                <Button
                  variant="default"
                  className="bg-epic-blue hover:bg-epic-blue/90 w-full md:w-auto"
                  disabled={uploadVideo.isPending}
                >
                  {uploadVideo.isPending ? (
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
            <Video className="text-epic-blue h-5 w-5 md:h-6 md:w-6" />
            Vídeos Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-epic-blue h-8 w-8" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" />
              <p className="text-base md:text-lg">Nenhum vídeo cadastrado ainda</p>
              <p className="text-sm mt-2">Faça upload do seu primeiro vídeo acima</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="border rounded-lg p-3 md:p-4 space-y-2 hover:border-epic-blue/40 transition-colors group"
                >
                  <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 relative group">
                    <video
                      src={video.video_url}
                      controls
                      className="w-full h-full object-cover"
                      preload="metadata"
                      controlsList="nodownload"
                      playsInline
                    >
                      Seu navegador não suporta o elemento de vídeo.
                    </video>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-9 w-9"
                        onClick={() => openEditSheet(video)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-9 w-9"
                        onClick={() => {
                          setSelectedVideo(video.id);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="font-medium text-center text-sm md:text-base truncate px-2">
                    {video.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Vídeo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteVideo.isPending ? (
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

      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar Vídeo</SheetTitle>
            <SheetDescription>
              Atualize o título do vídeo. Clique em salvar quando terminar.
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Novo título do vídeo"
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
              disabled={updateVideoTitle.isPending || !newTitle.trim()}
            >
              {updateVideoTitle.isPending ? (
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

export default VideosManager;
