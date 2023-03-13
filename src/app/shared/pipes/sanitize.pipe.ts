import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({ name: "sanitize", pure: true })
export class sanitizePipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}
  transform(url: any, args?: any): any {
    if (url) {
      return this.domSanitizer.bypassSecurityTrustUrl(url);
    } else {
      return null;
    }
  }
}
