import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "filterPullModeRequests" })
export class filterPullModeRequestsPipe implements PipeTransform {
  transform(requests: any, status?: any, listName?: any): any {
    if (status == "all" && listName == "all") {
      return requests;
    } else {
      if (listName != "all") {
        requests = requests.filter((e) => {
          return e.listName == listName;
        });
      }

      if (status != "all") {
        requests = requests.filter((e) => {
          return e.status == status;
        });
      }

      return requests;
    }
  }
}
