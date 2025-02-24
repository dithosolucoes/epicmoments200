export interface Stamp {
  id: string;
  created_at: string;
  name: string;
  image_url: string;
  processed_image_url: string;
}

export interface Video {
  id: string;
  created_at: string;
  title: string;
  video_url: string;
}

export interface Association {
  id: string;
  created_at: string;
  stamp_id: string;
  video_id: string;
  stamp?: Stamp;
  video?: Video;
}
