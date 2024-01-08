import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { appConfigService } from "src/app/services/appConfig.service";

@Pipe({ name: "getFileExt", pure: true })
export class getFileExtPipe implements PipeTransform {
  constructor(public _appConfigService: appConfigService, private domSanitizer: DomSanitizer) {}
  transform(fileUrl: any, args?: any): any {
    if (fileUrl) {
      fileUrl = fileUrl.split(".")[fileUrl.split(".").length - 1];
      if (fileUrl.includes("excel")) {
        return "xls";
      } else if (fileUrl.includes("octet-stream")) {
        return "genaric";
      } else if (fileUrl.includes("pdf")) {
        return "pdf";
      } else if (fileUrl.includes("ppt")) {
        return "ppt";
      } else if (fileUrl.includes("txt")) {
        return "txt";
      } else if (fileUrl.includes("plain")) {
        return "txt";
      } else if (fileUrl.includes("msword")) {
        return "doc";
      } else if (fileUrl.includes("powerpoint")) {
        return "ppt";
      } else if (fileUrl.includes("wordprocessing")) {
        return "doc";
      } else if (fileUrl.includes("sheet")) {
        return "xls";
      } else if (fileUrl.includes("doc")) {
        return "doc";
      } else if (fileUrl.includes("docx")) {
        return "doc";
      } else if (fileUrl.includes("xls")) {
        return "xls";
      } else {
        return "genaric";
      }
    } else {
      return "genaric";
    }
  }
}
