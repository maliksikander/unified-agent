import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "timeDuration"
})
export class timeDurationPipe implements PipeTransform {
  transform(t1: any, t2: any): string {
    t1 = new Date(t1);
    t2 = new Date(t2);

    const min = Math.abs(t1.getMinutes() - t2.getMinutes());
    const hours = Math.abs(t1.getHours() - t2.getHours());
    const seconds = Math.abs(t1.getSeconds() - t2.getSeconds());

    return hours + ":" + min + ":" + seconds;
  }
}
