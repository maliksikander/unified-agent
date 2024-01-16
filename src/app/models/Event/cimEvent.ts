import { v4 as uuidv4 } from "uuid";

export class CimEvent {
  id: string;
  name: string;
  conversationId: string;
  roomInfo: {};
  type: string;
  timestamp: any;
  data: any;
  eventEmitter: {};
  channelSession: {};

  constructor(name: string, type: string, conversationId: string, roomInfo: any, data: any, customer: any) {
    this.id = uuidv4();
    this.name = name;
    this.type = type;
    this.conversationId = conversationId;
    this.roomInfo = roomInfo;
    this.timestamp = Date.now();
    this.data = data;
    this.data["header"]["conversationId"] = conversationId;
    this.data["header"]["roomId"] = roomInfo.id;
    this.data["header"]["channelSessionId"] = data.header.channelSession.id;
    this.data["header"]["customer"] = customer;
    if (data.header) {
      if (data.header.channelSession) {
        this.channelSession = data.header.channelSession;
        delete data.header.channelSession;
      }
      if (data.header.sender) {
        this.eventEmitter = data.header.sender;
      }
    }
  }
}
