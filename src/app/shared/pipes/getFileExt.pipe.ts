import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { appConfigService } from "src/app/services/appConfig.service";

@Pipe({ name: "getFileExt", pure: true })
export class getFileExtPipe implements PipeTransform {
  constructor(public _appConfigService: appConfigService, private domSanitizer: DomSanitizer) {}
  transform(mimeType: any, args?: any): any {
    if (mimeType) {
      if (mimeType.includes("excel")) {
        return "xls";
      } else if (mimeType.includes("octet-stream")) {
        return "genaric";
      } else if (mimeType.includes("pdf")) {
        return "pdf";
      } else if (mimeType.includes("ppt")) {
        return "ppt";
      } else if (mimeType.includes("txt")) {
        return "txt";
      } else if (mimeType.includes("plain")) {
        return "txt";
      } else if (mimeType.includes("msword")) {
        return "doc";
      } else if (mimeType.includes("powerpoint")) {
        return "ppt";
      } else if (mimeType.includes("wordprocessing")) {
        return "doc";
      } else if (mimeType.includes("sheet")) {
        return "xls";
      } else if (mimeType.includes("doc")) {
        return "doc";
      } else if (mimeType.includes("docx")) {
        return "doc";
      } else if (mimeType.includes("xls")) {
        return "xls";
      } else {
        return "genaric";
      }
    } else {
      return "genaric";
    }
  }
}
