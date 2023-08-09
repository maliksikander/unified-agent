import { AfterViewInit, Component, Inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, fromEvent } from 'rxjs';
import { map, startWith, throttleTime, distinctUntilChanged } from 'rxjs/operators';
import { MAT_SNACK_BAR_DATA, MatDialog, MatSnackBar, MatSnackBarRef } from '@angular/material';
import { CustomerActionsComponent } from '../../customer-actions/customer-actions.component';
import { httpService } from 'src/app/services/http.service';
import { TranslateService } from "@ngx-translate/core";
import { snackbarService } from "src/app/services/snackbar.service";
import { v4 as uuidv4 } from "uuid";
import { sharedService } from 'src/app/services/shared.service';
import { cacheService } from 'src/app/services/cache.service';

@Component({
  selector: 'app-send-sms',
  templateUrl: './send-sms.component.html',
  styleUrls: ['./send-sms.component.scss']
})
export class SendSmsComponent implements OnInit {
  @ViewChild('textInput', { static: true }) textInput: ElementRef;

  offSet = 0;
  sort = {};
  limit = 25;
  userData: any = []
  SMSServiceIdentifier;
  defaultPrefixOutbound = '';
  identifiedCustomer = null;
  phoneNumber;
  phoneNumberFieldSubscriber;
  smsForm: FormGroup;

  constructor(
    private snackBar: MatSnackBar,
    private _httpService: httpService,
    private _translateService: TranslateService,
    private _snackbarService: snackbarService,
    private _sharedService: sharedService,
    private _cacheService: cacheService,
    public fb: FormBuilder,
  ) {
  }

  ngOnInit() {

    this.defaultPrefixOutbound = this._sharedService.conversationSettings.prefixCode;

    this.smsForm = this.fb.group({


      phoneControl: [this.defaultPrefixOutbound,
      [
        Validators.required,
        Validators.pattern("^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$"),
        Validators.minLength(3),
        Validators.maxLength(20)
      ]],

      textAreaControl: ["", [Validators.required]]
    });

    // this.getAgentDeskSettings();
    //hello All
    this.fetchSMSServiceIdentifier();

    this.phoneNumberFieldSubscriber = this.smsForm.get("phoneControl").valueChanges.subscribe((phoneNumber) => {
      if (phoneNumber != null && phoneNumber != "" && phoneNumber != undefined) {
        this.formatePhoneNumber(phoneNumber);
      } else {
        this.userData = [];
      }
    });


  }


  fetchSMSServiceIdentifier() {
    const SMSChannelType = this._sharedService.channelTypeList.find((channelType) => { return channelType.name.toLowerCase() == "sms" });

    if (SMSChannelType) {
      this._httpService.getDefaultOutboundChannel(SMSChannelType.id).subscribe((res) => {

        this.SMSServiceIdentifier = res.serviceIdentifier;

      }, (error) => { this._snackbarService.open(this._translateService.instant("snackbar.unable-to-fetch-service-identifier-messages-cant-be-sent"), "err") });
    }


  }

  formatePhoneNumber(phoneNumber) {
    //   setTimeout(() => {
    let plusExists = false;
    this.smsForm.get("phoneControl").setValue('', { emitEvent: false });
    if (phoneNumber[0] == '+') {
      plusExists = true;
    }
    phoneNumber = phoneNumber.replace(/\D/g, '').replace(/\s/g, '');
    if (plusExists) {
      phoneNumber = '+' + phoneNumber;
    }
    this.phoneNumber = this.applyPrefix(phoneNumber);
    this.smsForm.get("phoneControl").setValue(this.phoneNumber, { emitEvent: false });
    // }, 100);
  }

  applyPrefix(phoneNumber) {
    if (phoneNumber == '') return phoneNumber;
    let modifiedNumber = phoneNumber;
    let prefix = this.defaultPrefixOutbound;
    if (
      phoneNumber[0] != '+' &&
      phoneNumber.startsWith(this.defaultPrefixOutbound)
    ) {
      modifiedNumber = modifiedNumber.substring(this.defaultPrefixOutbound);
      if (modifiedNumber.startsWith(this.defaultPrefixOutbound))
        return modifiedNumber;
      else return phoneNumber;
    } else if (prefix.length > 0 && modifiedNumber[0] == 0) {
      modifiedNumber = modifiedNumber.substring(1);
      modifiedNumber = prefix + modifiedNumber;
    } else if (modifiedNumber[0] !== '+' && prefix.length > 0) {
      let phoneFirstLetters = modifiedNumber.substring(0, prefix.length);
      if (prefix !== phoneFirstLetters) {
        modifiedNumber = prefix + modifiedNumber;
      }
      if (prefix[0] == '+') {
        let prefixWithoutPlus = prefix.substring(1);
        if (phoneNumber.startsWith(prefixWithoutPlus)) {
          modifiedNumber = '+' + phoneNumber;
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

    this.identifiedCustomer = "";
    if (this.smsForm.get("phoneControl").value.length > 2) {
      this.getCustomers(this.limit, this.offSet, this.sort, { field: "phoneNumber", value: encodeURIComponent(this.smsForm.get("phoneControl").value) });
    }


  }

  updateMySelection(option) {

    this.identifiedCustomer = option;

  }



  sendSMS() {

    if (this.SMSServiceIdentifier) {

      let message = {
        id: uuidv4(),
        header: {
          channelData: {
            channelCustomerIdentifier: this.smsForm.get("phoneControl").value,
            serviceIdentifier: this.SMSServiceIdentifier,
            additionalAttributes: [{ key: 'messageDirection', value: 'outbound', type: 'String2000' }]
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

      this._httpService.sendOutboundSms(message).subscribe((res) => {

        if (message.header.customer == null || message.header.customer == "" || message.header.customer == undefined) {
          message['header']['customer'] = res.additionalDetails.customer;
          this.openSuccessDialog({ newProfileCreated: true, customer: message.header.customer, sentNumber: message.header.channelData.channelCustomerIdentifier })

        } else {
          this.openSuccessDialog({ newProfileCreated: false, customer: message.header.customer, sentNumber: message.header.channelData.channelCustomerIdentifier })

        }




        this._httpService.saveActivies(message).subscribe((res) => {
        })

      }, (error) => {

        this._snackbarService.open(error.error.description, "err");

      });

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
          console.log(e, "getting agent desk settingz");
          this.defaultPrefixOutbound = e[0].prefixCode;
          //this.isOutboundEnabled = e.isOutboundSmsEnabled;
          console.log(this.defaultPrefixOutbound, "this.agentDeskSettingResp")
          // if (e.theme == "dark") {
          //   this.themeSwitch(true);
          // }
          // this.setAgentPreferedlanguage(e.language);
        },
        (error) => {
          this._sharedService.Interceptor(error.error, "err");
          console.error("error getting agent settings", error);
        }
      );



    }



  }


  openSuccessDialog
    (data) {

    let snackBar: MatSnackBarRef<SendSmsSnackbarComponent>;

    snackBar = this.snackBar.openFromComponent(SendSmsSnackbarComponent, {
      duration: 10000,
      panelClass: ['chat-success-snackbar', 'send-sms-notify'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      data: {
        info: data,
        preClose: () => {
          snackBar.dismiss(
          );
        }
      }
    });
  }
}


@Component({
  selector: 'app-send-sms-snackbar',
  template: `
  <div class="custom-sms-notification">
      <mat-icon>check_circle</mat-icon>
      <span class="main-notify"><strong>{{'chat-features.send-sms.success-sms'  | translate }} </strong>
           {{'chat-features.send-sms.the-sms-has-been-sent-to-the'  | translate }} <span *ngIf="data.info.newProfileCreated == true">new</span> customer {{'chat-features.send-sms.customer'  | translate }}<b>"{{data.info.customer.firstName}}"</b> on this number{{'chat-features.send-sms.on-this-number'  | translate }} {{data.info.sentNumber}}.<br/> 
          <span *ngIf="data.info.newProfileCreated == true"> {{'chat-features.send-sms.update-profile'  | translate }}, <button class="update-new-profile" (click)="updateUser()">{{'chat-features.send-sms.click-here'  | translate }}</button></span>
      </span>
      
      <button mat-button color="primary" (click)="dismiss()"></button>
  </div>
  `,

})
export class SendSmsSnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data, private dialog: MatDialog) {

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
