import { AfterViewInit, Component, Inject, OnInit, ElementRef, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Observable, fromEvent } from "rxjs";
import { map, startWith, throttleTime, distinctUntilChanged } from "rxjs/operators";
import { MAT_SNACK_BAR_DATA, MAT_DIALOG_DATA, MatDialog, MatSnackBar, MatSnackBarRef, MatDialogRef } from "@angular/material";
import { CustomerActionsComponent } from "../../customer-actions/customer-actions.component";
import { httpService } from "src/app/services/http.service";
import { TranslateService } from "@ngx-translate/core";
import { snackbarService } from "src/app/services/snackbar.service";
import { v4 as uuidv4 } from "uuid";
import { sharedService } from "src/app/services/shared.service";
import { cacheService } from "src/app/services/cache.service";
import { AppHeaderComponent } from "src/app/app-header/app-header.component";
import { socketService } from "src/app/services/socket.service";
import { Router } from "@angular/router";

import { T } from "@angular/cdk/keycodes";

@Component({
  selector: "app-send-sms",
  templateUrl: "./send-sms.component.html",
  styleUrls: ["./send-sms.component.scss"]
})
export class SendSmsComponent implements OnInit, AfterViewInit {
  @ViewChild("textInput", { static: true }) textInput: ElementRef;

  offSet = 0;
  sort = {};
  limit = 25;
  userData: any = [];
  SMSServiceIdentifier;
  defaultPrefixOutbound = "";
  isOutboundSmsSendandClose;
  identifiedCustomer = null;
  phoneNumber;
  phoneNumberFieldSubscriber;
  smsForm: FormGroup;

  constructor(
    private snackBar: MatSnackBar,
    private _socketService: socketService,
    private _httpService: httpService,
    private _translateService: TranslateService,
    private _snackbarService: snackbarService,
    private _sharedService: sharedService,
    private _cacheService: cacheService,
    private _router: Router,

    @Inject(MAT_DIALOG_DATA) public smsData: any,

    public fb: FormBuilder,
    private smsDialog: MatDialog
  ) {
    this.defaultPrefixOutbound = this._sharedService.conversationSettings.prefixCode;
    this.isOutboundSmsSendandClose = this._sharedService.conversationSettings.isOutboundSmsSendandClose;

    this.smsForm = this.fb.group({
      phoneControl: [
        this.defaultPrefixOutbound,
        [Validators.required, Validators.pattern("^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$"), Validators.minLength(3), Validators.maxLength(20)]
      ],

      textAreaControl: ["", [Validators.required]]
    });

    this.fetchSMSServiceIdentifier();
  }
  ngAfterViewInit(): void {
    const phoneField = document.getElementById("phoneField");

    phoneField.addEventListener("keydown", (event) => {
      // Check your conditions here
      if (this.smsForm.get("phoneControl").value == this.defaultPrefixOutbound) {
        // Prevent the default behavior of the backspace key (key code 8)
        if (event.key === "ArrowLeft" || event.key === "Backspace") {
          event.preventDefault();
        }
      }
    });
  }

  ngOnInit() {
    if (this.smsData) {
      this.smsForm.controls.phoneControl.setValue(this.smsData.info.channelCustomerIdentifier);
      this.smsForm.controls.textAreaControl.setValue(this.smsData.info.markdownText);
      this.identifiedCustomer = this.smsData.info.customer;
    }

    this.phoneNumberFieldSubscriber = this.smsForm.get("phoneControl").valueChanges.subscribe((phoneNumber) => {
      if (phoneNumber != null && phoneNumber != "" && phoneNumber != undefined) {
        this.smsForm.get("phoneControl").setValue("", { emitEvent: false });

        this.formatePhoneNumber(phoneNumber);
      } else {
        this.userData = [];
      }
    });
  }

  fetchSMSServiceIdentifier() {
    const SMSChannelType = this._sharedService.channelTypeList.find((channelType) => {
      return channelType.name.toLowerCase() == "sms";
    });
    // console.log("SMSChannelType",SMSChannelType.id)
    if (SMSChannelType) {
      this._httpService.getDefaultOutboundChannel(SMSChannelType.id.toString()).subscribe(
        (res) => {
          this.SMSServiceIdentifier = res.serviceIdentifier;
        },
        (error) => {
          this._snackbarService.open(this._translateService.instant("snackbar.unable-to-fetch-service-identifier-messages-cant-be-sent"), "err");
        }
      );
    }
  }

  formatePhoneNumber(phoneNumber) {
    phoneNumber = this.removeStartingNumber(phoneNumber, this.defaultPrefixOutbound);

    phoneNumber = this.convertZerosToPlus(phoneNumber);

    //   setTimeout(() => {
    let plusExists = false;
    this.smsForm.get("phoneControl").setValue("", { emitEvent: false });
    if (phoneNumber[0] == "+") {
      plusExists = true;
    }
    phoneNumber = phoneNumber.replace(/\D/g, "").replace(/\s/g, "");
    if (plusExists) {
      phoneNumber = "+" + phoneNumber;
    }
    this.phoneNumber = this.applyPrefix(phoneNumber);
    this.smsForm.get("phoneControl").setValue(this.phoneNumber, { emitEvent: false });
    // }, 100);
  }

  convertZerosToPlus(input) {
    // Remove leading zeros and replace with a plus symbol
    let modifiedStr = input.replace(/^0{2,}/, "+");

    return modifiedStr;
  }

  removeStartingNumber(completeNumber, prefix) {
    if (completeNumber.startsWith(prefix)) {
      return completeNumber.substring(prefix.length);
    }
    return completeNumber;
  }

  applyPrefix(phoneNumber) {
    if (phoneNumber == "") return phoneNumber;
    let modifiedNumber = phoneNumber;
    let prefix = this.defaultPrefixOutbound;
    if (phoneNumber[0] != "+" && phoneNumber.startsWith(this.defaultPrefixOutbound)) {
      modifiedNumber = modifiedNumber.substring(this.defaultPrefixOutbound);
      if (modifiedNumber.startsWith(this.defaultPrefixOutbound)) return modifiedNumber;
      else return phoneNumber;
    } else if (prefix.length > 0 && modifiedNumber[0] == 0) {
      modifiedNumber = modifiedNumber.substring(1);
      modifiedNumber = prefix + modifiedNumber;
    } else if (modifiedNumber[0] !== "+" && prefix.length > 0) {
      let phoneFirstLetters = modifiedNumber.substring(0, prefix.length);
      if (prefix !== phoneFirstLetters) {
        modifiedNumber = prefix + modifiedNumber;
      }
      if (prefix[0] == "+") {
        let prefixWithoutPlus = prefix.substring(1);
        if (phoneNumber.startsWith(prefixWithoutPlus)) {
          modifiedNumber = "+" + phoneNumber;
        }
      }
    }
    return modifiedNumber;
  }

  getCustomers(limit, offSet, sort, query) {
    this.userData = [];
    this._httpService.getCustomers(limit, offSet, sort, query).subscribe((e) => {
      this.userData = e.docs;
    });
  }

  handleThrottledKeyUp() {
    this.smsData = null;
    this.identifiedCustomer = "";
    if (this.smsForm.get("phoneControl").value.length > 2) {
      this.getCustomers(this.limit, this.offSet, this.sort, {
        field: "phoneNumber",
        value: encodeURIComponent(this.smsForm.get("phoneControl").value)
      });
    }

    if (this.smsForm.get("phoneControl").value == "") {
      this.smsForm.get("phoneControl").setValue(this.defaultPrefixOutbound, { emitEvent: false });
    }
  }

  updateMySelection(option) {
    this.identifiedCustomer = option;
    
    this.userData=[];

  }

  openCOnversationView(customer) {
    this._socketService.onTopicData({ customer }, "FAKE_CONVERSATION","FAKE_CONVERSATION", "");
    this._router.navigate(["customers"]);
    if (this.SMSServiceIdentifier) {
      this._cacheService.storeOutboundSmsDialogData({
        customer: this.identifiedCustomer ? this.identifiedCustomer : null,
        channelCustomerIdentifier: this.smsForm.get("phoneControl").value,
        markdownText: this.smsForm.get("textAreaControl").value
      });
    }

    this.smsDialog.closeAll();
  }

  sendSMS() {
    if (this.SMSServiceIdentifier) {
      let message = {
        id: uuidv4(),
        header: {
          channelData: {
            channelCustomerIdentifier: this.smsForm.get("phoneControl").value,
            serviceIdentifier: this.SMSServiceIdentifier,
            additionalAttributes: [{ key: "messageDirection", value: "outbound", type: "String2000" }]
          },
          sender: {
            id: this._cacheService.agent.id,
            senderName: this._cacheService.agent.username,
            type: "AGENT"
          },
          customer: this.identifiedCustomer ? this.identifiedCustomer : null
        },
        body: {
          type: "PLAIN",
          markdownText: this.smsForm.get("textAreaControl").value
        }
      };

      this._httpService.sendOutboundSms(message).subscribe(
        (res) => {
          if (message.header.customer == null || message.header.customer == "" || message.header.customer == undefined) {
            message["header"]["customer"] = res.additionalDetails.customer;

            this.openSuccessDialog({
              newProfileCreated: true,
              customer: message.header.customer,
              sentNumber: message.header.channelData.channelCustomerIdentifier
            });
          } else {
            this.openSuccessDialog({
              newProfileCreated: false,
              customer: message.header.customer,
              sentNumber: message.header.channelData.channelCustomerIdentifier
            });
          }

          this._httpService.saveActivies(message).subscribe((res) => {
            if (this.isOutboundSmsSendandClose) {
              //console.log("------------this.smsDialog.closeAll();------------",this.isOutboundSmsSendandClose)
              this.smsDialog.closeAll();
            }
          });
        },
        (error) => {
          this._snackbarService.open(error.error.description, "err");
        }
      );
    } else {
      this._snackbarService.open(this._translateService.instant("snackbar.unable-to-fetch-service-identifier-messages-cant-be-sent"), "err");
    }
  }

  ngOnDestroy() {
    this.phoneNumberFieldSubscriber.unsubscribe();
  }

  getAgentDeskSettings() {
    if (this._cacheService.agent.id) {
      this._httpService.getConversationSettings().subscribe(
        (e) => {
          this.defaultPrefixOutbound = e[0].prefixCode;
        },
        (error) => {
          this._sharedService.Interceptor(error.error, "err");
          console.error("error getting agent settings", error);
        }
      );
    }
  }

  openSuccessDialog(data) {
    let snackBar: MatSnackBarRef<SendSmsSnackbarComponent>;

    snackBar = this.snackBar.openFromComponent(SendSmsSnackbarComponent, {
      duration: 10000,
      panelClass: ["chat-success-snackbar", "send-sms-notify"],
      horizontalPosition: "right",
      verticalPosition: "bottom",
      data: {
        info: data,
        preClose: () => {
          snackBar.dismiss();
        }
      }
    });
  }
}

@Component({
  selector: "app-send-sms-snackbar",
  template: `
    <div class="custom-sms-notification">
      <mat-icon>check_circle</mat-icon>
      <span class="main-notify"
        ><strong>{{ "chat-features.send-sms.success-sms" | translate }} </strong>
        {{ "chat-features.send-sms.the-sms-has-been-sent-to-the" | translate }}

        <span *ngIf="data.info.newProfileCreated == true">{{ "chat-features.send-sms.new" | translate }}</span>
        {{ "chat-features.send-sms.customer" | translate }} <b>"{{ data.info.customer.firstName }}"</b
        >{{ "chat-features.send-sms.on-this-number" | translate }} {{ data.info.sentNumber }}.<br />
        <span class="link-span" (click)="openCOnversationView()">click here </span
        >{{ "chat-features.send-sms.to-view-the-customer-profile" | translate }}<br />
      </span>

      <button mat-button color="primary" (click)="dismiss()"></button>
    </div>
  `,
  styles: [
    `
      .link-span {
        cursor: pointer;
        color: white; /* You can adjust the color to match your styling */
        text-decoration: underline;
      }

      .translation-text:before {
        content: " ";
      }
    `
  ]
})
export class SendSmsSnackbarComponent {
  constructor(private _router: Router, private _socketService: socketService, @Inject(MAT_SNACK_BAR_DATA) public data, private dialog: MatDialog) {}

  openCOnversationView() {
    this._socketService.onTopicData({ customer: this.data.info.customer },"FAKE_CONVERSATION", "FAKE_CONVERSATION", "");
    this._router.navigate(["customers"]);
    this.dialog.closeAll();
  }
  updateUser() {
    this.dismiss();
    this.dialog.closeAll();
    this.openEditCustomerDialog(this.data.info.customer._id);
  }

  dismiss() {
    this.data.preClose();
  }

  openEditCustomerDialog(id) {
    const dialogRef = this.dialog.open(CustomerActionsComponent, {
      panelClass: "edit-customer-dialog",
      maxWidth: "80vw",
      maxHeight: "88vh",
      // width: "818px",
      // height: "88vh",
      data: { id: id, tab: "edit" }
    });
  }
}
