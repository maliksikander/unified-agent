import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "checkCiscoSession", pure: true })
export class checkCiscoSessionPipe implements PipeTransform {
  transform(channelSessions: any, args?: any): any {
    try {
      if (channelSessions && channelSessions.length > 0) {
        for (let i = 0; i < channelSessions.length; i++) {
          if (channelSessions[i] && channelSessions[i].channel.channelType.name == "CISCO_CC") return true;
        }
      }
    } catch (e) {
      console.error("[checkCiscoSession Pipe]==>", e);
    }
    return false;
  }
}
