import { v4 as uuidv4 } from "uuid";

export class CimEvent {
  id: string;
  name: string;
  conversationId: string;
  type: string;
  timestamp: any;
  data: {};

  constructor(name: string, type: string, conversationId: string, data: {}) {
    this.id = uuidv4();
    this.name = name;
    this.type = type;
    this.conversationId = conversationId;
    this.timestamp = Date.now();
    this.data = data;
  }
}
