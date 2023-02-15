import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "checkConferenceCall", pure: true })
export class checkConferenceCallPipe implements PipeTransform {
  transform(data: any, args?: any): any {
    // return data.substring(0, 2).toUpperCase();
    console.log("dat==>", data);
    if (Array.isArray(data)) {
      console.log("data==>");
      data.forEach((item) => {
        if (item.startDirection && (item.startDirection == "INBOUND" || item.startDirection == "OUTBOUND")) {
          console.log("data1==>");
          return item.dialog.ani;
        } else {
          console.log("data2==>");
          return "false";
        }
      });
    }
    // const matches = data.match(/\b(\w)/g);
    // if (matches.length > 1) {
    //   return matches.join("").substring(0, 2).toUpperCase();
    // } else {
    //   return data.substring(0, 2).toUpperCase();
    // }
  }
}
