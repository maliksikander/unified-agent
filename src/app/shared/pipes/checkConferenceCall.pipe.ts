import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "checkConferenceCall", pure: true })
export class checkConferenceCallPipe implements PipeTransform {
  transform(data: any, args?: any): any {
    let isConference: boolean = false;
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item.startDirection && item.startDirection == "CONSULT_CONFERENCE") {
          isConference = true;
        }
      });
    }
    return isConference;
  }
}
