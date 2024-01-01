import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  transform(value: number): string {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    let result = '';

    if (hours > 0) {
      result += hours + 'h ';
    }

    if (minutes > 0) {
      result += minutes + 'm ';
    }

    if (seconds > 0) {
      result += seconds + 's';
    }

    return result.trim();
  }
}
