export interface Kid {
  id: string;
  name: string;
  color: string; // hex color
  photoDataUrl: string; // base64 data URL
}

export interface Task {
  id: string;
  kidId: string;
  title: string;
  iconType: 'emoji' | 'image';
  iconValue: string; // emoji or data URL
  order: number;
  isDone: boolean;
  isActive: boolean;
}