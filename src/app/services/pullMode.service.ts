import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { httpService } from "./http.service";
import { snackbarService } from "./snackbar.service";

@Injectable({
  providedIn: "root"
})
export class pullModeService {
  subscribedList: any = []; // contains the list which are subscribed by the agent
  subscribedListRequests: any = []; // contains the requests of those subscribed list
  subscribedListJoinedRequests: any = []; // contains the Ids of subscribed list's subscribed requests
  labels: any = [];
  listNames: any;

  private _subscribedListListener: BehaviorSubject<any> = new BehaviorSubject([]);

  public readonly subscribedListListener: Observable<any> = this._subscribedListListener.asObservable();

  constructor(private _httpService: httpService, private _snackbarService: snackbarService) {
    this.loadLabels();
  }

  updateSubscribedList(list) {
    this.subscribedList = list;
    this._subscribedListListener.next(this.subscribedList);
  }

  updateSubscribedListRequests(incomingRequest, type) {
    if (type.toUpperCase() == "PULL_MODE_LIST_REQUEST_RECEIVED") {
      this._snackbarService.open("A new request on " + this.listNames[incomingRequest.listId] + " is arrived", "succ");
    } else {
      if (incomingRequest.status.toLowerCase() == "closing") {
        this.deleteRequestById(incomingRequest.id);
        return;
      }
    }

    let index: number = -1;
    let found: boolean = false;

    // check if the request is already present here
    this.subscribedListRequests.forEach((request, i) => {
      // if yes, then get the index of request
      if (request.id == incomingRequest.id) {
        index = i;
        found = true;
        return;
      }
    });
    // if the request already in it, update the request
    if (found) {
      this.subscribedListRequests[index] = incomingRequest;
    } else {
      // else, add a new entry
      this.subscribedListRequests.push(incomingRequest);
    }

    this.updateRequestArrayRef(this.subscribedListRequests);
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
    this.updateRequestArrayRef(this.subscribedListRequests);
  }

  removePullModeSubscribedListRequests(listId) {
    let indexesOfItemsToBeremoved = [];

    // fetch the indexes of the items to be removed
    this.subscribedListRequests.forEach((e, i) => {
      if (e.listId == listId) {
        indexesOfItemsToBeremoved.push(i);
      }
    });

    // remove those items
    this.subscribedListRequests = this.subscribedListRequests.filter(function (value, index) {
      return indexesOfItemsToBeremoved.indexOf(index) == -1;
    });
    this.updateRequestArrayRef(this.subscribedListRequests);
  }

  updatePullModeJoinedRequestIds(reqs) {
    this.subscribedListJoinedRequests = reqs;
  }

  deleteRequestById(reqId) {
    this.subscribedListRequests = this.subscribedListRequests.filter((req) => {
      return req.id != reqId;
    });
    console.log("this.subscribedListRequests after deleted ", this.subscribedListRequests);
    this.updateRequestArrayRef(this.subscribedListRequests);
  }

  updateRequestArrayRef(requests) {
    // we are using impure pipe with this data, as impure pipe does not changes with the same array reference so we need to change
    // the reference of that array
    this.subscribedListRequests = [];
    this.subscribedListRequests = this.subscribedListRequests.concat(requests);
  }
}
