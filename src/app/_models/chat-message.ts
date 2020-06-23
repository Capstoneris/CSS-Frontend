import {User} from '@app/_models/user';

export class ChatMessage {
  timestamp: number;
  sentBy: User;
  message: string;
}
