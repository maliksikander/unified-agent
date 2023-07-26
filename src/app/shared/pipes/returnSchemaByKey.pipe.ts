import { Pipe, PipeTransform } from "@angular/core";
import { sharedService } from "src/app/services/shared.service";
import { CustomerSchema } from "src/app/models/customer-schema";


@Pipe({ name: "returnSchemaByKey", pure: true })
export class returnSchemaByKeyPipe implements PipeTransform {
  constructor(private _sharedService: sharedService) {}

  transform(key: String): CustomerSchema | null {
    let schema=null;
    if (key) {
      this._sharedService.schema.find((e) => {
        if (e.key == key) {
                schema=e;
        }
      });
      return schema;
    } else {
      return null;
    }
  }
}
