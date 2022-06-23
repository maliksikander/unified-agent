import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeDuration'
})
export class timeDurationPipe implements PipeTransform {

    transform(fromDate: any, substractDate: any): string {

        fromDate = new Date(fromDate);
        substractDate = new Date(substractDate);
        const difference = fromDate.valueOf() - substractDate.valueOf();

        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const hours = Math.floor(difference / (1000 * 60 * 60) % 24);

        return `${this.formatTime(hours)}:${this.formatTime(minutes)}`;
    }

    formatTime(time: number): string {
        const formattedTime = (time < 10) ? '0' + time : time.toString();
        return formattedTime;
    }

}