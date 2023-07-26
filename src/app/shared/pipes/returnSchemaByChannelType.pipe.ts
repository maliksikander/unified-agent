import { Pipe, PipeTransform } from "@angular/core";
import { sharedService } from "src/app/services/shared.service";
import { CustomerSchema } from "src/app/models/customer-schema";

@Pipe({ name: "returnSchemaByChannelType", pure: true })
export class returnSchemaByChannelTypePipe implements PipeTransform {
  constructor(private _sharedService: sharedService) {}

  transform(channelType: String): CustomerSchema | null  {
    let schema=null;
    if (channelType) {
      this._sharedService.schema.find((e) => {
        if (e.channelTypes.includes(channelType)) {
                schema=e;
        }
      });
      return schema;
    } else {
      return null;
    }
  }
}
