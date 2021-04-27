import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "getLatestActiveChannel", pure: true })
export class getLatestActiveChannelPipe implements PipeTransform {
  transform(activeChannelSessions: any, args?: any): any {

    let session = activeChannelSessions[activeChannelSessions.length - 1];
    if (session) {
      return session.channel.channelConnector.type.name;
    } else {
      return "none"
    }

  }
}
