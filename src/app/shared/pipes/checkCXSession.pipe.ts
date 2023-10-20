import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "checkCXSession", pure: true })
export class checkCXSessionPipe implements PipeTransform {
  transform(channelSessions: any, args?: any): any {
    try {
      if (channelSessions && channelSessions.length > 0) {
        for (let i = 0; i < channelSessions.length; i++) {
          if (channelSessions[i] && channelSessions[i].channel.channelType.name == "CX_VOICE") return true;
        }
      }
    } catch (e) {
      console.error("[checkCXSession Pipe]==>", e);
    }
    return false;
  }
}
