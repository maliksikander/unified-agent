import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { appConfigService } from "src/app/services/appConfig.service";

@Pipe({ name: "getFileUrl", pure: true })
export class getFileUrlPipe implements PipeTransform {
    constructor(public _appConfigService: appConfigService, private domSanitizer: DomSanitizer) { }
    transform(url: any, args?: any): any {
        if (url) {
            return this._appConfigService.config.FILE_SERVER_URL + "/file-engine/api/downloadFileStream" + new URL(url).search;
        } else {
            return null;
        }
    }
}
