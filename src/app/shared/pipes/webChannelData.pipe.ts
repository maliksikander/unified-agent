import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "webChannelData", pure: true })
export class webChannelDataPipe implements PipeTransform {
    transform(value: any, img: any): any {
        if (img == "deviceType") {

            if (value.toLowerCase() == "desktop") {
                return 'desktop';
            } else if (value.toLowerCase() == "mobile") {
                return 'smartphone';
            } else {
                return 'unknown';
            }

        } else if (img == "country") {

            if (value.toLowerCase().includes("aus")) {
                return 'australia';
            } else if (value.toLowerCase().includes("chi")) {
                return 'china';
            }
            else if (value.toLowerCase().includes("eng")) {
                return 'england';
            }
            else if (value.toLowerCase().includes("fra")) {
                return 'france';
            }
            else if (value.toLowerCase().includes("ger")) {
                return 'germany';
            }
            else if (value.toLowerCase().includes("ita")) {
                return 'itly';
            }
            else if (value.toLowerCase().includes("pak")) {
                return 'pakistan';
            } else {
                return 'generic';
            }


        } else if (img == "browser") {
            if (value.toLowerCase().includes("chrome")) {
                return 'chrome';
            } else if (value.toLowerCase().includes("edge")) {
                return 'edge';
            }
            else if (value.toLowerCase().includes("firefox")) {
                return 'firefox';
            }
            else if (value.toLowerCase().includes("ie")) {
                return 'ie';
            }
            else if (value.toLowerCase().includes("opera")) {
                return 'opera';
            } else {
                return 'generic';
            }
        }
    }
}
