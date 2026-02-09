export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Thread {
  id: string;
  participants: User[];
  messages: Message[];
}
