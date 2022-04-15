import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "getFirstTwoLetters", pure: true })
export class getFirstTwoLettersPipe implements PipeTransform {
  transform(data: any, args?: any): any {
    // return data.substring(0, 2).toUpperCase();
    const matches = data.match(/\b(\w)/g);
    if (matches.length > 1) {
      return matches.join('').substring(0, 2).toUpperCase();
    } else {
      return data.substring(0, 2).toUpperCase();

    }
  }
}
