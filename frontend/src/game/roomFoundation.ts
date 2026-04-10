export type RoomAction = 'sleep' | 'sit' | 'idle' | 'move'

export type RoomItemType = 'bed' | 'chair' | 'table' | 'decor'

export type RoomEntity = {
  id: string
  name: string
  spriteKey: string
  position: { x: number; y: number }
  action: RoomAction
}

export type RoomFurniture = {
  id: string
  type: RoomItemType
  position: { x: number; y: number }
  rotation?: 0 | 90 | 180 | 270
}

export type RoomSnapshot = {
  roomId: string
  participants: string[]
  entities: RoomEntity[]
  furniture: RoomFurniture[]
  updatedAt: string
}

// This function is intentionally simple now.
// It provides one centralized shape for future realtime state updates.
export function createEmptyRoomSnapshot(roomId: string, participants: string[]): RoomSnapshot {
  return {
    roomId,
    participants,
    entities: [],
    furniture: [],
    updatedAt: new Date().toISOString(),
  }
}
