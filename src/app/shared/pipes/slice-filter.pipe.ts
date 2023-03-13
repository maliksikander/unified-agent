import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "sliceFilter",
  pure: true
})
export class SliceFilterPipe implements PipeTransform {
  transform(value: any, start?: any, end?: any): any {
    if (value) {
      value = value.slice(start, end);
      return value;
    }
  }
}
