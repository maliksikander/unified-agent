import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { snackbarService } from "./snackbar.service";

@Injectable({
  providedIn: "root"
})
export class sharedService {
  constructor(private _snackbarService: snackbarService) {}

  matCurrentTabIndex = 0;
  private serviceMessageSource = new BehaviorSubject({ msg: null, data: null });
  serviceCurrentMessage = this.serviceMessageSource.asObservable();
  serviceChangeMessage(data: any) {
    this.serviceMessageSource.next(data);
  }

  getIndexFromTopicId(topicId, array) {
    let index = array.findIndex((e) => {
      return e.topicId == topicId;
    });
    return index;
  }

  spliceArray(index, array) {
    array.splice(index, 1);
  }

  Interceptor(e, res) {
    if (res == "err") {
      console.log("e", e);
      if (e.statusCode == 401) {
        this._snackbarService.open("UNAUTHORIZED USER", "err");
      } else if (e.statusCode == 400) {
        this._snackbarService.open(e.msg.error.attribute ? e.msg.error.attribute + " is " + e.msg.error.validation : "Bad Request", "err");
      } else if (e.statusCode == 412) {
        this._snackbarService.open("unable to fetch license status", "err");
      } else if (e.statusCode == 500) {
        this._snackbarService.open("Internal Server Error", "err");
      } else {
        this._snackbarService.open("Something went wrong", "err");
      }
    }
    if (res == "succ") {
      this._snackbarService.open(e, "succ");
    }
  }
}
