import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "checkOutboundCall", pure: true })
export class checkOutboundCallPipe implements PipeTransform {
  transform(data: any, args?: any): any {
    let isOutbound: boolean = false;
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item.startDirection && item.startDirection == "OUTBOUND") {
          isOutbound = true;
        }
      });
    }
    return isOutbound;
  }
}
