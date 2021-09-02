import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { httpService } from "./http.service";

@Injectable({
  providedIn: "root"
})
export class pullModeService {
  subscribedList: any = [];
  subscribedListRequests: any = [];
  labels: any = [];
  listNames: any;

  private _subscribedListListener: BehaviorSubject<any> = new BehaviorSubject([]);

  public readonly subscribedListListener: Observable<any> = this._subscribedListListener.asObservable();

  constructor(private _httpService: httpService) {
    this.loadLabels();
  }

  updateSubscribedList(list) {
    this.subscribedList = list;
    this._subscribedListListener.next(this.subscribedList);
  }

  updateSubscribedListRequests(event) {
    let index: number = -1;
    let found: boolean = false;

    // check if the request is already present here
    this.subscribedListRequests.forEach((e, i) => {
      // if yes, then get the index of request
      if (e.id == event.id) {
        index = i;
        found = true;
        return;
      }
    });

    if (found) {
      this.subscribedListRequests[index] = event;
    } else {
      this.subscribedListRequests.push(event);
    }

    //  this._subscribedListListener.next(this.subscribedListRequests);
  }

  loadLabels() {
    this.labels = [];
    this._httpService.getLabels().subscribe((e) => {
      this.labels = e.data;
    });
  }

  initializedSubscribedListRequests(reqs) {
    this.subscribedListRequests = reqs;
  }

  addPullModeSubscribedListRequests(reqs) {
    reqs.forEach((req) => {
      if (!this.subscribedListRequests.some((e) => e.id === req.id)) {
        this.subscribedListRequests.push(req);
      }
    });
  }

  removePullModeSubscribedListRequests(id) {
    let indexesOfItemsToBeremoved = [];

    // fetch the indexes of the items to be removed
    this.subscribedListRequests.forEach((e, i) => {
      if (e.listId == id) {
        indexesOfItemsToBeremoved.push(i);
      }
    });

    // remove those items
    this.subscribedListRequests = this.subscribedListRequests.filter(function (value, index) {
      return indexesOfItemsToBeremoved.indexOf(index) == -1;
    });
  }
}
