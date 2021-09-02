import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "filterPullModeRequests" })
export class filterPullModeRequestsPipe implements PipeTransform {
  transform(requests: any, status?: any, listId?: any): any {
    if (status == "all" && listId == "all") {
      return requests;
    } else {
      if (listId != "all") {
        requests = requests.filter((e) => {
          return e.listId == listId;
        });
      }

      if (status != "all") {
        requests = requests.filter((e) => {
          return e.status.toLowerCase() == status;
        });
      }

      return requests;
    }
  }
}
