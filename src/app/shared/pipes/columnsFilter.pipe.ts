import { PipeTransform, Pipe } from "@angular/core";
@Pipe({
  name: "columnsFilterPipe",
  pure: true
})
export class columnsFilterClass implements PipeTransform {
  transform(columns: any, name: string): any[] {
    if (!columns || !name) {
      return columns;
    }
    return columns.filter((e) => e.label.toLowerCase().indexOf(name.toLowerCase()) !== -1);
  }
}
