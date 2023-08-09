import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "SuggestionsFilter", pure: true })
export class SearchSuggestionsPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (!value) return null;
    if (!args) return value;

    args = args.toLowerCase();
    args = args.replace("/", "");

    return value.filter(function (item) {
      return JSON.stringify(item).toLowerCase().includes(args);
    });
  }
}
