import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "checkConsultCall", pure: true })
export class checkConsultCallPipe implements PipeTransform {
  transform(data: any, args?: any): any {
    let isConsult: boolean = false;
    if (Array.isArray(data)) {
      if(data.length < 3){
        data.forEach((item) => {
          if (item.startDirection && item.startDirection == "CONSULT") {
            isConsult = true;
          }
        });
      }

    }
    return isConsult;
  }
}
