import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "getCustomerAni", pure: true })
export class getCustomerAniPipe implements PipeTransform {
  transform(data: any, args?: any): any {
    let ani;
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item.startDirection && (item.startDirection == "INBOUND" || item.startDirection == "OUTBOUND")) {
          if (item.dialog.ani) {
            ani = item.dialog.ani;
          } else {
            ani = item.dialog.fromAddress;
          }
        }
      });
    }
    return ani;
  }
}
