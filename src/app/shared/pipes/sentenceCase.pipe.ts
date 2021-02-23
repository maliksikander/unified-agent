import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sentenceCase', pure: true })
export class sentenceCasePipe implements PipeTransform {


    transform(data: any, args?: any): any {
        var result = data.replace(/([A-Z])/g, " $1");
        var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
        return finalResult;
    }
}