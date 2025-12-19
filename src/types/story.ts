export interface HackerNewsStory {
  id: number;
  title: string;
  by: string;
  score: number;
  time: number;
  url?: string;
  descendants?: number;
  type: string;
  kids?: number[];
  text?: string;
}
