import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "getmrdswitches", pure: true })
export class getMRDSwitchesPipe implements PipeTransform {
  transform(state: any, args?: any): any {
    if (state) {
      state = state.toLowerCase();
      if (state == "ready" || state == "active" || state == "busy") {
        return true;
      }
    } else {
      return false;
    }
  }
}
