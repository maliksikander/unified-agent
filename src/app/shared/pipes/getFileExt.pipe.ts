import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { appConfigService } from "src/app/services/appConfig.service";

@Pipe({ name: "getFileExt", pure: true })
export class getFileExtPipe implements PipeTransform {
    constructor(public _appConfigService: appConfigService, private domSanitizer: DomSanitizer) { }
    transform(fileName: any, args?: any): any {
        if (fileName) {

            let ext = fileName.split('.').pop();

            if (ext.includes('doc')) {
                return 'doc';
            } else if (ext.includes('pdf')) {
                return 'pdf';
            }
            else if (ext.includes('ppt')) {
                return 'ppt';
            }
            else if (ext.includes('txt')) {
                return 'txt';
            }
            // else if (ext.includes('plain')) {
            //     return 'txt';
            // }
            // else if (ext.includes('msword')) {
            //     return 'doc';
            // }
            // else if (ext.includes('powerpoint')) {
            //     return 'ppt';
            // }
            // else if (ext.includes('officedocument')) {
            //     return 'doc';
            // }
            // else if (ext.includes('sheet')) {
            //     return 'xls';
            // }
            // else if (ext.includes('excel')) {
            //     return 'xls';
            // }
            else if (ext.includes('docx')) {
                return 'doc';
            }
            else if (ext.includes('xls')) {
                return 'xls';
            } else {
                return 'genaric';
            }

        } else {
            return 'genaric';
        }
    }
}
