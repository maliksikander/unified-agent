import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Subject } from "rxjs";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { resolve } from "url";
import { ConfirmationDialogComponent } from "../new-components/confirmation-dialog/confirmation-dialog.component";
import { httpService } from "./http.service";
import { snackbarService } from "./snackbar.service";
import { socketService } from "./socket.service";

@Injectable({
  providedIn: "root"
})
export class sharedService {
  constructor(private dialog: MatDialog, private _snackbarService: snackbarService, private _httpService: httpService) { }

  schema = [
    {
      "channelTypes": [],
      "_id": "61a62b05134fc2f8a65bc2a0",
      "key": "firstName",
      "defaultValue": "John Doe",
      "description": "",
      "isChannelIdentifier": false,
      "isDeletable": false,
      "isPii": false,
      "isRequired": true,
      "label": "First Name",
      "length": 50,
      "sortOrder": 1,
      "type": "String"
    },
    {
      "channelTypes": [
        "WhatsApp",
        "SMS"
      ],
      "_id": "61a7ab05134fc2f8a65c566f",
      "key": "phoneNumber",
      "defaultValue": "",
      "description": "",
      "isChannelIdentifier": true,
      "isDeletable": false,
      "isPii": false,
      "isRequired": false,
      "label": "Phone Number",
      "length": 18,
      "sortOrder": 2,
      "type": "PhoneNumber"
    },
    {
      "channelTypes": [],
      "_id": "61a7ab05134fc2f8a65c5670",
      "key": "isAnonymous",
      "defaultValue": false,
      "description": "",
      "isChannelIdentifier": false,
      "isDeletable": false,
      "isPii": false,
      "isRequired": true,
      "label": "Anonymous",
      "length": 4,
      "sortOrder": 3,
      "type": "Boolean"
    },
    {
      "channelTypes": [
        "Web"
      ],
      "_id": "61b0460ccaefbc32b489e82e",
      "key": "webChannelIdentifier",
      "label": "Web Channel Identifier",
      "description": "fsdf",
      "type": "String",
      "length": 50,
      "isRequired": false,
      "defaultValue": null,
      "isPii": false,
      "isChannelIdentifier": true,
      "isDeletable": true,
      "sortOrder": 4,
      "__v": 0
    },
    {
      "channelTypes": [
        "Viber"
      ],
      "_id": "61b04645caefbc32b489e86a",
      "key": "viber",
      "label": "Viber",
      "description": "",
      "type": "String",
      "length": 50,
      "isRequired": false,
      "defaultValue": "",
      "isPii": false,
      "isChannelIdentifier": true,
      "isDeletable": true,
      "sortOrder": 5,
      "__v": 0
    }
  ];

  matCurrentTabIndex = 0;

  channelTypeList = [];
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

  setChannelIcons(channelTypes) {
    this.channelTypeList = channelTypes;
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
    })

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
