import { PipeTransform, Pipe } from "@angular/core";
@Pipe({
  name: "tableFilter",
  pure: true
})
export class TableFilterPipe implements PipeTransform {
  transform(list: any[], value: string) {
    return value ? list.filter((item) => item.status === value) : list;
  }
}
