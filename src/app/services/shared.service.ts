import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { httpService } from "./http.service";
import { snackbarService } from "./snackbar.service";

@Injectable({
  providedIn: "root"
})
export class sharedService {
  constructor(private _snackbarService: snackbarService, private _httpService: httpService) { }

  matCurrentTabIndex = 0;

  channelLogoMapper = new Map();

  serviceCurrentMessage = new Subject();
  serviceChangeMessage(data: any) {
    this.serviceCurrentMessage.next(data);
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

  setChannelIcons(channels) {

    channels.forEach((channel) => {

      this._httpService.getChannelLogo(channel.channelConnector.channelType.channelLogo).subscribe((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          // caching the channel logos
          this.channelLogoMapper.set(channel.channelConnector.channelType.channelLogo, reader.result);
        }
      });

    });
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
      } else if (e.statusCode == 408) {
        this._snackbarService.open(e.msg, "err");
      } else {
        this._snackbarService.open("Something went wrong", "err");
      }
    }
    if (res == "succ") {
      this._snackbarService.open(e, "succ");
    }
  }

  snackErrorMessage(msg) {
    this._snackbarService.open(msg, "err");
  }
}
