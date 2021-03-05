import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'getFirstTwoLetters', pure: true })
export class getFirstTwoLettersPipe implements PipeTransform {
    transform(data: any, args?: any): any {
        return data.substring(0, 2).toUpperCase();
    }
}