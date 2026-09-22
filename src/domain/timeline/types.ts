export interface TimelineItem {
  id: string
  date: string
  type: 'note' | 'message' | 'measurement' | 'workout' | 'checkin'
  title: string
  body: string
  important?: boolean
  fromStudent?: boolean
}
