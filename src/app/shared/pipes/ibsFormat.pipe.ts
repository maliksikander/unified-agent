import { Pipe, PipeTransform } from "@angular/core";
import { ibsFormat } from "ibs-format";

@Pipe({ name: "ibsformat", pure: true })
export class ibsformatPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    value = ibsFormat(
      value,
      [
        ["b", "*"],
        ["i", "_"],
        ["strike", "~"],
        ["mark", "!"],
        ["em", "```"],
        ["em", "`"]
      ],
      { detectLinks: false, target: "_blank" },
      { allowXssEscaping: false }
    );
    return value;
  }
}
