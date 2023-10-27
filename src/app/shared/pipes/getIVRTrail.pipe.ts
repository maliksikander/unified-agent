import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "getIVRTrail", pure: true })
export class getIVRTrailPipe implements PipeTransform {
  transform(data: any, args?: any): any {
    let trail: string;
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        trail = index == 0 ? `${item.menu} > ${item.selection} >` : `${trail} > ${item.menu} > ${item.selection} >`;
      });
      trail = trail.substring(0, trail.length - 1);
    }

    return trail;
  }
}
