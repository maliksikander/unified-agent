import { Pipe, PipeTransform } from "@angular/core";
import { socketService } from "src/app/services/socket.service";

@Pipe({ name: "isAlreadyJoined", pure: true })
export class isAlreadyJoinedPipe implements PipeTransform {
  constructor(private _socketService: socketService) {}

  transform(requestId: any, args?: any): any {
    let index = this._socketService.conversations.findIndex((conversation) => {
      return conversation.conversationId == requestId;
    });
    if (index == -1) {
      return false;
    } else {
      return true;
    }
  }
}
