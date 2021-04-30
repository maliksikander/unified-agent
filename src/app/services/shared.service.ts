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
      if (e.statusCode == 401) {
        this._snackbarService.open("UNAUTHORIZED USER", "err");
      } else if (e.statusCode == 400) {
        this._snackbarService.open("Bad Request", "err");
      } else {
        this._snackbarService.open("Something went wrong", "err");
      }
    }
    if (res == "succ") {
    }
  }
}
