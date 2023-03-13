import { PipeTransform, Pipe } from "@angular/core";
@Pipe({
  name: "getReferredMsg",
  pure: true
})
export class getReferredMessagePipe implements PipeTransform {
  transform(msgId: any, messages: any): any[] {
    if (msgId) {
      let message = messages.find((message) => {
        return message.id == msgId;
      });
      if (message) {
        return [message];
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}
