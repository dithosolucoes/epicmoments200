
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image, Video, Loader2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useStamps } from "@/hooks/useStamps";
import { useVideos } from "@/hooks/useVideos";
import { Stamp, Video as VideoType } from "@/types/database";

interface CreateAssociationModalProps {
  onClose: () => void;
  onSubmit: (stampId: string, videoId: string) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateAssociationModal({ onClose, onSubmit, isSubmitting }: CreateAssociationModalProps) {
  const [selectedStamp, setSelectedStamp] = useState("");
  const [selectedVideo, setSelectedVideo] = useState("");
  
  const { stamps, isLoading: stampsLoading } = useStamps();
  const { videos, isLoading: videosLoading } = useVideos();

  const selectedStampData = stamps.find((s) => s.id === selectedStamp);
  const selectedVideoData = videos.find((v) => v.id === selectedVideo);

  const handleSubmit = () => {
    if (!selectedStamp || !selectedVideo) return;
    onSubmit(selectedStamp, selectedVideo);
  };

  return (
    <AlertDialogContent className="max-w-full mx-4 md:max-w-4xl bg-white">
      <AlertDialogHeader>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <AlertDialogTitle className="text-xl md:text-2xl font-bold text-epic-black">
            Nova Associação
          </AlertDialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 md:h-10 md:w-10"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </AlertDialogHeader>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <div className="flex-1 space-y-4">
          <div className="aspect-video md:aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
            {selectedStampData ? (
              <img
                src={selectedStampData.image_url}
                alt={selectedStampData.name}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            ) : (
              <div className="text-center p-4">
                <Image className="w-10 h-10 md:w-12 md:h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm md:text-base text-gray-500">
                  Selecione uma estampa abaixo
                </p>
              </div>
            )}
          </div>

          <Select
            value={selectedStamp}
            onValueChange={setSelectedStamp}
          >
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Selecione uma estampa" />
            </SelectTrigger>
            <SelectContent className="max-h-[40vh]">
              {stampsLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin" />
                </div>
              ) : stamps.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Nenhuma estampa disponível
                </div>
              ) : (
                stamps.map((stamp) => (
                  <SelectItem 
                    key={stamp.id} 
                    value={stamp.id}
                    className="py-3 px-4"
                  >
                    {stamp.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-4">
          <div className="aspect-video rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
            {selectedVideoData ? (
              <video
                src={selectedVideoData.video_url}
                controls
                className="max-h-full max-w-full rounded-lg"
                playsInline
              />
            ) : (
              <div className="text-center p-4">
                <Video className="w-10 h-10 md:w-12 md:h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm md:text-base text-gray-500">
                  Selecione um vídeo abaixo
                </p>
              </div>
            )}
          </div>

          <Select
            value={selectedVideo}
            onValueChange={setSelectedVideo}
          >
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Selecione um vídeo" />
            </SelectTrigger>
            <SelectContent className="max-h-[40vh]">
              {videosLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin" />
                </div>
              ) : videos.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Nenhum vídeo disponível
                </div>
              ) : (
                videos.map((video) => (
                  <SelectItem 
                    key={video.id} 
                    value={video.id}
                    className="py-3 px-4"
                  >
                    {video.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <AlertDialogFooter className="mt-6 md:mt-8 flex-col md:flex-row gap-2 md:gap-4">
        <Button
          variant="outline"
          onClick={onClose}
          className="w-full md:w-auto h-12 text-base"
        >
          Cancelar
        </Button>
        <Button
          className="w-full md:w-auto h-12 text-base bg-epic-blue hover:bg-epic-blue/90 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={!selectedStamp || !selectedVideo || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Criando...
            </>
          ) : (
            "Criar Associação"
          )}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
