export interface Review {
  name: string;
  rating: number;
  text: string;
  date?: string;
  likes?: number;
}

export interface Kedai {
  id: string;
  name: string;
  area: string;
  lat: number;
  lon: number;
  price_level: string;
  tags: string[];
  signature: string;
  reviews: Review[];
  created_at?: string;
  rating?: number;
  totalReviews?: number;
  hasRealReviews?: boolean;
  thumbnail?: string;
  distance?: number;
  distanceFormatted?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  kedaiResults?: Kedai[];
  timestamp: Date;
}
