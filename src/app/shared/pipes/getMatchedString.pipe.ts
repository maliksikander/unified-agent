import { PipeTransform, Pipe } from "@angular/core";
@Pipe({
  name: "getMatchedString",
  pure: true
})
export class getMatchedStringPipe implements PipeTransform {
  transform(matchFrom: [], tobeMatched: any): any[] {
    const matched = matchFrom.filter((e: any) => {
      return e.toString().includes(tobeMatched);
    });

    return matched[0];
  }
}
