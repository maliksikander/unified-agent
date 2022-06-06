import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Subject } from "rxjs";
import { LinkConversationDialogComponent } from "../dialogs/link-conversation-dialog/link-conversation-dialog.component";
import { ConfirmationDialogComponent } from "../new-components/confirmation-dialog/confirmation-dialog.component";
import { httpService } from "./http.service";
import { snackbarService } from "./snackbar.service";
const customerSchema: any = require("../mocks/customerSchema.json");

@Injectable({
  providedIn: "root"
})
export class sharedService {
  constructor(private dialog: MatDialog, private _snackbarService: snackbarService, private _httpService: httpService) {}

  schema;
  mainPagetile = "FETCHING CHATS ...";
  matCurrentTabIndex = 0;
  channelLogoMapper = new Map();
  serviceCurrentMessage = new Subject();
  channelTypeList;

  serviceChangeMessage(data: any) {
    console.log("subject method called")
    this.serviceCurrentMessage.next(data);
  }

  getIndexFromConversationId(conversationId, array) {
    let index = array.findIndex((e) => {
      return e.conversationId == conversationId;
    });
    return index;
  }

  spliceArray(index, array) {
    array.splice(index, 1);
  }

  setChannelIcons(channelTypes) {
    this.channelTypeList = channelTypes;
    try {
      localStorage.setItem("channelTypes", JSON.stringify(channelTypes));
    } catch (e) {}
    channelTypes.forEach((channelType) => {
      this._httpService.getChannelLogo(channelType.channelLogo).subscribe((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          // caching the channel logos
          this.channelLogoMapper.set(channelType.channelLogo, reader.result);
        };
      });
    });
  }

  getConfirmation(header, msg) {
    return new Promise((resolve) => {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: "490px",
        panelClass: "confirm-dialog",
        data: { header: header, message: msg }
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result && result.event == "confirm") {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  getProfileLinkingConfirmation(channelIdentifier, customerName, attr, isMergeAble) {
    return new Promise((resolve) => {
      const dialogRef = this.dialog.open(LinkConversationDialogComponent, {
        width: "490px",
        panelClass: "confirm-dialog",
        data: { channelIdentifier: channelIdentifier, customerName: customerName, attr: attr, isMergeAble: isMergeAble }
      });
      dialogRef.afterClosed().subscribe((decision) => {
        if (decision) {
          console.log("this is decision ", decision);
          resolve(decision);
        }
      });
    });
  }

  Interceptor(e, res) {
    if (res == "err") {
      console.log("[Error]:", e);
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
      } else if (e.error) {
        this._snackbarService.open(e.error.msg, "err");
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
