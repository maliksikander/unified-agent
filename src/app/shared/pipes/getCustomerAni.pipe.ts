import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "getCustomerAni", pure: true })
export class getCustomerAniPipe implements PipeTransform {
  transform(data: any, args?: any): any {
    let ani;
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item.startDirection && (item.startDirection == "INBOUND" || item.startDirection == "OUTBOUND")) {
          if(item.additionalDetail.dialog){
          if (item.additionalDetail.dialog.customerNumber) {
            ani = item.additionalDetail.dialog.customerNumber;
          } else {
            ani = item.additionalDetail.dialog.ani;
          }
        }
        else if(item.additionalDetail.customerNumber){
            ani = item.additionalDetail.customerNumber;
          }
        }
      });
    }
    return ani;
  }
}
