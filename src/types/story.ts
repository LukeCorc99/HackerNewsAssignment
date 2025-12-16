export interface HackerNewsStory {
  id: number
  title: string
  by: string
  score: number
  time: number
  url?: string
  descendants?: number
  type: string
  kids?: number[]
}

export type StoryType = 'top' | 'new'
export type ViewMode = 'grid' | 'list'