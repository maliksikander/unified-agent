import { Injectable } from "@angular/core";
import { httpService } from "./http.service";
import { sharedService } from "./shared.service";
import { cacheService } from "./cache.service";
@Injectable({
  providedIn: "root"
})
export class announcementService {
  announcementList: any = []; // contains the list which are subscribed by the agent
 

  constructor(private _sharedService: sharedService, private _httpService: httpService, private _cacheService: cacheService,) {
    // this.loadLabels();
    // this.getPullModeList();
  }

  ngOnInit() {

    let teamIds=this._cacheService.agent.supervisedTeams;
    //teamIds.push(this._cacheService.agent.userTeam?this._cacheService.agent.userTeam[0]);
    this._httpService.getAnnouncements().subscribe((data) => {
      console.log("data", data)
      this.announcementList = data;
      
      
    });

  getPullModeList() {
    this._httpService.getPullModeList().subscribe(
      (e) => {
        
        this.setListNames(e);
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  setListNames(list) {
    let obj = {};
    list.forEach((e) => {
      obj[e.id] = e.name;
    });
   // this.listNames = obj;
  }

  getAnnouncementsList(list) {
    //this.subscribedList = list;
  }

  updateSubscribedListRequests(incomingRequest, type) {
    if (type.toUpperCase() == "PULL_MODE_LIST_REQUEST_RECEIVED") {
      //  this._snackbarService.open("A new request on " + this.listNames[incomingRequest.listId] + " is arrived", "succ");
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

      // this will also show the request header on screen area
      this._sharedService.serviceChangeMessage({ msg: "openPullModeRequestHeader", data: incomingRequest });
    }

    this.updateRequestArrayRef();
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
    this.updateRequestArrayRef();
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
    this.updateRequestArrayRef();
  }

  deleteRequestById(reqId) {
    this.subscribedListRequests = this.subscribedListRequests.filter((req) => {
      return req.id != reqId;
    });
    // this will close the notification header from main screen
    this._sharedService.serviceChangeMessage({ msg: "closePullModeRequestHeader", data: reqId });
    this.updateRequestArrayRef();
  }

  updateRequestArrayRef() {
    // we are using impure pipe with this data, as impure pipe does not changes with the same array reference so we need to change
    // the reference of that array
    this.subscribedListRequests = this.subscribedListRequests.concat([]);
  }
}
