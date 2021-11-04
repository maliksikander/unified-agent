import { Pipe, PipeTransform } from "@angular/core";
import { httpService } from "src/app/services/http.service";
import { sharedService } from "src/app/services/shared.service";
import { DomSanitizer } from '@angular/platform-browser';


@Pipe({ name: "channelLogo" })
export class channelLogoPipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer, private _sharedService: sharedService, private _httpService: httpService) {}
  transform(filename: any): any {
    return new Promise((resolve) => {
      if (filename) {
        // check if file is exists in memory
        if (this._sharedService.channelLogoMapper.get(filename)) {
          resolve(this.domSanitizer.bypassSecurityTrustUrl(this._sharedService.channelLogoMapper.get(filename).toString()));
        } else {
          // if not found in memory then get it from file server
          this._httpService.getChannelLogo(filename).subscribe(
            (file) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onloadend = () => {
                // saving that file for the next time
                this._sharedService.channelLogoMapper.set(filename, reader.result);
                resolve(this.domSanitizer.bypassSecurityTrustUrl((reader.result).toString()));
              };
            },
            (err) => {
              resolve('assets/flags/generic.png');
            }
          );
        }
      } else {
        resolve(null);
      }
    });
  }
}
