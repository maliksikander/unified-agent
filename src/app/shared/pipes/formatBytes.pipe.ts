import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { appConfigService } from "src/app/services/appConfig.service";

@Pipe({ name: "getFormattedBytes", pure: true })
export class getFormattedBytesPipe implements PipeTransform {
    transform(bytes: any, args?: any): any {

        if (bytes) {
            const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            let l = 0, n = parseInt(bytes, 10) || 0;
            while (n >= 1024 && ++l) {
                n = n / 1024;
            }
            return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
        }else{
            return '0KB'
        }


    }
}
