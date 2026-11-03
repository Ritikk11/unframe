export interface SlideItem {
  id: string;
  file?: File;
  previewUrl: string;
  width: number;
  height: number;
  aspectRatio: number; // width / height
  ratioLabel: string; // e.g. "9:16 (Story/Tall)", "4:5 (Portrait)", "1:1 (Square)", "16:9 (Landscape)"
  status: 'ready' | 'uploading' | 'published' | 'error';
  errorMessage?: string;
}

export interface InstagramAccount {
  id: string; // ig_user_id
  username: string;
  name: string;
  profilePictureUrl?: string;
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  followersCount?: number;
}

export interface MetaAppConfig {
  appId: string;
  isConfigured: boolean;
  appUrl: string;
}

export interface PublishResult {
  success: boolean;
  postId?: string;
  permalink?: string;
  error?: string;
}

