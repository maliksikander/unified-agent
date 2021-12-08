import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "spaceInArray", pure: true })
export class spaceInArrayPipe implements PipeTransform {
    transform(data: any, args?: any): any {
        if (data) {
            if (Array.isArray(data)) {
                return data.join(", ");
            } else {
                return data;
            }
        } else {
            return null
        }
    }
}
