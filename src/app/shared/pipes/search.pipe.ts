import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "LockFilter", pure: true })
export class SearchPipe implements PipeTransform {
  transform(value: any, args?: any, includedProperties?: string[]): any {
    if (!value) return null;
    if (!args) return value;

    args = args.toLowerCase();
    args = args.replace("/", "");

    return value.filter((item) => this.matchesSearch(item, args, includedProperties));
  }

  private matchesSearch(item: any, searchValue: string, includedProperties?: string[]): boolean {
    if (!includedProperties || includedProperties.length === 0) {
      includedProperties = Object.keys(item); // Include all properties if none are specified
    }

    for (const property of includedProperties) {
      const value = item[property];

      if (typeof value === "object" && value !== null) {
        if (this.matchesSearch(value, searchValue, includedProperties)) {
          return true;
        }
      } else {
        if (value && value.toString().toLowerCase().includes(searchValue)) {
          return true;
        }
      }
    }

    return false;
  }
}
