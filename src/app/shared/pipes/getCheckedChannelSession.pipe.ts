import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "getCheckedChannelSession" })
export class getCheckedChannelSessionPipe implements PipeTransform {
  transform(activeChannelSessions: [], ids?: any): any {
    let obj = { logo: null, name: "no channel selected" };

    let checkedChannelSession: any = activeChannelSessions.find((channelSession: any) => {
      return channelSession.isChecked == true;
    });

    if (checkedChannelSession) {
      obj.logo = checkedChannelSession.channel.channelType.channelLogo;
      obj.name = checkedChannelSession.channel.channelType.name;
    }

    return [obj];
  }
}
