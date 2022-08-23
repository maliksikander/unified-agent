import { Pipe, PipeTransform } from "@angular/core";
@Pipe({
  name: "checkActiveChannelSession"
})
export class CheckActiveChannelSession implements PipeTransform {
  transform(activeChannelSessionList: any[], activeChannelSessionName: string): boolean {
    return activeChannelSessionList.find((activeChannelSession)=>{
      return activeChannelSession.name==activeChannelSessionName;
  })
  }
}
