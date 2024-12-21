export const sampleUsers = [
  { address: '0x00001', username: "alice", avatar: "/placeholder.svg?height=40&width=40" },
  { address: '0x00002', username: "bob", avatar: "/placeholder.svg?height=40&width=40" },
  { address: '0x00003', username: "charlie", avatar: "/placeholder.svg?height=40&width=40" },
  { address: '0x00004', username: "david", avatar: "/placeholder.svg?height=40&width=40" },
]

export const samplePosts = [
  { 
    id: '1', 
    userId: '1', 
    content: "Découverte incroyable sur la blockchain aujourd'hui !", 
    timestamp: "2023-06-01T10:00:00Z",
    likes: ['2', '3'],
    comments: [
      { id: '1', userId: '0x00002', content: "Wow, c'est fascinant !", timestamp: "2023-06-01T10:05:00Z" },
      { id: '2', userId: '0x00003', content: "Peux-tu nous en dire plus ?", timestamp: "2023-06-01T10:10:00Z" }
    ]
  },
  { 
    id: '2', 
    userId: '2', 
    content: "Qui est partant pour un hackathon ce weekend ?", 
    timestamp: "2023-06-01T11:00:00Z",
    likes: ['1', '4'],
    comments: [
      { id: '3', userId: '0x00004', content: "Je suis partant !", timestamp: "2023-06-01T11:15:00Z" }
    ]
  },
]

export const sampleNotifications = [
  { id: '1', type: 'like', userId: '0x00002', postId: '1', timestamp: "2023-06-01T10:02:00Z" },
  { id: '2', type: 'comment', userId: '0x00002', postId: '1', commentId: '1', timestamp: "2023-06-01T10:05:00Z" },
  { id: '3', type: 'like', userId: '0x00003', postId: '1', timestamp: "2023-06-01T10:07:00Z" },
  { id: '4', type: 'comment', userId: '0x00003', postId: '1', commentId: '2', timestamp: "2023-06-01T10:10:00Z" },
  { id: '5', type: 'like', userId: '0x00001', postId: '2', timestamp: "2023-06-01T11:05:00Z" },
  { id: '6', type: 'comment', userId: '0x00004', postId: '2', commentId: '3', timestamp: "2023-06-01T11:15:00Z" },
  { id: '7', type: 'like', userId: '0x00004', postId: '2', timestamp: "2023-06-01T11:20:00Z" },
]
