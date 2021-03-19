import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "convertToFormData", pure: true })
export class convertToFormDataPipe implements PipeTransform {
  transform(data: any, args?: any): any {
    console.log("data ", data);
    let processedObj = [];
    let keys = Object.keys(data);
    let values = Object.values(data);
    for (let i = 0; i < keys.length; i++) {
      processedObj.push({ key: keys[i], value: values[i] });
    }
    return processedObj;
  }
}
