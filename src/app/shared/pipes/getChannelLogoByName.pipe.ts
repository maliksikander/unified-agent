import { Pipe, PipeTransform } from "@angular/core";
import { sharedService } from "src/app/services/shared.service";

@Pipe({ name: "channelName", pure: true })
export class channelNamePipe implements PipeTransform {
  constructor(private _sharedService: sharedService) {}
  transform(name: any, args?: any): any {
    if (name) {
      let channeltype = this._sharedService.channelTypeList.find((e) => {
        return e.name == name;
      });

      if (channeltype) {
        return channeltype.channelLogo;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}
