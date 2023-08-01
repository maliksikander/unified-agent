import { AfterViewInit, Component, Inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
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
export class SendSmsComponent implements OnInit, AfterViewInit {
  @ViewChild('textInput', { static: true }) textInput: ElementRef;
  channelTypeId;
  phoneNumberSelector;
  searchNumberRequest = "";
  offSet = 0;
  sort = {};
  limit = 25;
  query = {};
  filterQuery = [];
  filterValue;
  field = "phoneNumber";
  selectedNumber: any = {};
  sendSmsResponse: any = {}
  thirdPartyActivityObj = {}
  randomUUID: string;
  userData: any = []
  outboundSmsDialogData = {}
  outboundSmsDialogDataforAnonmyous;
  serviceIdentifier;
  anonmyousCustomerDetails;
  outboundMessage;
  rowID;

  constructor(
    private snackBar: MatSnackBar,
    private _httpService: httpService,
    private _translateService: TranslateService,
    private _snackbarService: snackbarService,
    private _sharedService: sharedService,
    private _cacheService: cacheService,
  ) {
    this.randomUUID = uuidv4();
  }

  ngOnInit() {

    //Validators.pattern("^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$"),
    this.phoneNumberSelector = new FormControl('', [Validators.required,Validators.pattern("^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$"), Validators.minLength(3), Validators.maxLength(20)]);
    this.outboundMessage = new FormControl("", [Validators.required]);

    this.channelTypeId = this._sharedService.channelTypeList[3].id;
    this._httpService.getDefaultOutboundChannel(this.channelTypeId).subscribe(res => {
      this.serviceIdentifier = res.serviceIdentifier;

    });

  }

  getCustomers(limit, offSet, sort, query) {
    this._httpService.getCustomers(limit, offSet, sort, query).subscribe((e) => {
      this.userData = e.docs;
     // console.log(e.docs, "data")
    //console.log(this.userData.length, "userdata")
    });
  }

  loadCustomerOnSearchOp(limit, offSet, sort, query) {
    this.getCustomers(limit, offSet, sort, query);
  }

  filter() {
    if (this.filterValue && this.field) {
      let filterVal = JSON.parse(JSON.stringify(this.filterValue));
      filterVal = encodeURIComponent(filterVal);
      this.query = { field: this.field, value: filterVal };
      this.filterQuery = [];
      this.filterQuery.push({ field: this.field, value: this.filterValue });
      // this.loadCustomers(this.limit, this.offSet, this.sort, this.query);
      this.offSet = 0;
      // console.log("feild", this.field);
      // console.log("this.filterValue", this.filterValue)
      this.loadCustomerOnSearchOp(this.limit, this.offSet, this.sort, this.query);
    }
  }


  ngAfterViewInit(): void {
    fromEvent(this.textInput.nativeElement, 'keyup').pipe(
      throttleTime(2000), // Adjust the time (in milliseconds) for throttling
      distinctUntilChanged()
    )

      .subscribe((event: Event) => {
        this.handleThrottledKeyUp(event);
        this.filter();

      });
  }

  handleThrottledKeyUp(event: Event) {
    let phonenumber = fromEvent<any>(this.textInput.nativeElement, 'keyup')
      .pipe(
        map(event => event.target.value),

      )
    //console.log(event, "keyup event")
    phonenumber.subscribe((res) => {
      this.searchNumberRequest = res;
     // console.log(this.searchNumberRequest, " this.searchNumberRequest"),
        this.filterValue = res;

    });

  }

  updateMySelection(event) {
    if (event) {
      this.selectedNumber = event;
    }
    else {
      this.selectedNumber = {};
    }
  }

  sendSms() {

    if (this.userData.length === 0) {
      this.outboundSmsDialogDataforAnonmyous = {

        "id": this.randomUUID,
        "header": {
          "sender": {
            "id": this._cacheService.agent.id,
            "type": "AGENT",
            "senderName": this._cacheService.agent.firstName,
          },
          "customer": null,
          "channelData": {
            "channelCustomerIdentifier": this.phoneNumberSelector.value,
            "serviceIdentifier": this.serviceIdentifier,
            "requestPriority": 0,
            "additionalAttributes": null
          },
          "language": null,
          "timestamp": new Date(),
          "securityInfo": null,
          "stamps": null,
          "intent": null,
          "entities": null,
          "channelSession": null,
          "replyToMessageId": null,
          "providerMessageId": null
        },
        "body": {
          "type": "PLAIN",
          "markdownText": this.outboundMessage.value
        }
      };
      this._httpService.sendOutboundSms(this.outboundSmsDialogDataforAnonmyous).subscribe({
        next: (val: any) => {
          this.anonmyousCustomerDetails = val.additionalDetails.customer;
          console.log(this.anonmyousCustomerDetails, "(return customer obj)+++++++++++++++++++response check val.additionalDetails.customer+++++++++++")
          this.rowID = this.randomUUID;
          console.log(this.rowID,"row IID")
          if (val.status == 200) {
            this.openSnackBar();
            this.saveDataInThirdPartyActivities()

          } else { }
        },
        error: (err: any) => {
          console.error(err);
          // this._snackbarService.open(this._translateService.instant("snackbar.Unable-to-Create-New-Announcement"), "err");

        },
      });
    }

    else {
      this.outboundSmsDialogData = {

        "id": this.randomUUID,
        "header": {
          "sender": {
            "id": this._cacheService.agent.id,
            "type": "AGENT",
            "senderName": this._cacheService.agent.firstName,
          },
          "customer": this.selectedNumber,
          "channelData": {
            "channelCustomerIdentifier": this.selectedNumber.phoneNumber[0],
            "serviceIdentifier": this.serviceIdentifier,
            "requestPriority": 0,
            "additionalAttributes": null
          },
          "language": null,
          "timestamp": new Date(),
          "securityInfo": null,
          "stamps": null,
          "intent": null,
          "entities": null,
          "channelSession": null,
          "replyToMessageId": null,
          "providerMessageId": null
        },
        "body": {
          "type": "PLAIN",
          "markdownText": this.outboundMessage.value
        }
      };
      //ccm API CALL
      this._httpService.sendOutboundSms(this.outboundSmsDialogData).subscribe({
        next: (val: any) => {
          this.sendSmsResponse = val;
          //this._snackbarService.open(this._translateService.instant("snackbar.New-Announcement"), "succ");
         // console.log(val, "ressponse check")
          //third party API
          //call open snack bar here
          this.rowID = this.randomUUID;
          if (this.sendSmsResponse.status == 200) {
            this.openSnackBar();
            // call saveActivities func here
            this.saveDataInThirdPartyActivities();
          } else { }
        },
        error: (err: any) => {
          console.error(err);
          // this._snackbarService.open(this._translateService.instant("snackbar.Unable-to-Create-New-Announcement"), "err");

        },
      });

    }

  }

  saveDataInThirdPartyActivities() {
    //with customer
    //without customer
    console.log("this.anonmyousCustomerDetails", this.anonmyousCustomerDetails)
    if (this.anonmyousCustomerDetails) {



      this.thirdPartyActivityObj = {
        "id": this.randomUUID,
        "header": {
          "sender": {
            "id": this._cacheService.agent.id,
            "type": "AGENT",
            "senderName": this._cacheService.agent.firstName,
          },
          //{id:"",senderName:"",type:"AGENT"}
          "customer": this.anonmyousCustomerDetails,
          "channelData": {
            "channelCustomerIdentifier": this.phoneNumberSelector.value,
            "serviceIdentifier": this.serviceIdentifier,//call api
            "requestPriority": 0,
            "additionalAttributes": null
          },
          "language": null,
          "timestamp": new Date(),//date
          "securityInfo": null,
          "stamps": null,
          "intent": null,
          "entities": null,
          "channelSession": null,
          "replyToMessageId": null,
          "providerMessageId": null
        },
        "body": {
          "type": "PLAIN",
          "markdownText": this.outboundMessage.value
        }

      }

      this._httpService.saveActivies(this.thirdPartyActivityObj).subscribe({
        next: (val: any) => {
          console.log(val, "ressponse check of third party Activities+this.thirdPartyActivityObj")

        },
        error: (err: any) => {
          console.error(err);

        },
      });
    }

    else {
      /// callin API
      console.log(this.outboundSmsDialogData, "ressponse check BEFORE SAVING of third party Activities+this.outboundSmsDialogData ")
      this._httpService.saveActivies(this.outboundSmsDialogData).subscribe({
        next: (val: any) => {
          console.log(val, "ressponse check of third party Activities+this.outboundSmsDialogData ")

        },
        error: (err: any) => {
          console.error(err);

        },
      });

    }


    /// callin API

    // this._httpService.saveActivies(this.thirdPartyActivityObj).subscribe({
    //   next: (val: any) => {
    //     console.log(val,"ressponse check of third party Activities")

    //   },
    //   error: (err: any) => {
    //     console.error(err);

    //   },
    // });


  }


  openSnackBar() {

    let snackBar: MatSnackBarRef<SendSmsSnackbarComponent>;

    snackBar = this.snackBar.openFromComponent(SendSmsSnackbarComponent, {
      duration: 200000,
      panelClass: ['chat-success-snackbar', 'send-sms-notify'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      data: {
        id: this.rowID,
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
      <span class="main-notify"><strong>SMS sent successfully </strong>
           The SMS has been sent to the new customer <b>"Jane Doe"</b> on this number 030012345678.<br/> To update the customer profile, <button class="update-new-profile" (click)="updateUser()"> click here</button>
      </span>
      
      <button mat-button color="primary" (click)="dismiss()"></button>
  </div>
  `,

})
export class SendSmsSnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data, private dialog: MatDialog) { }

  updateUser() {
    //let id=this.sendSmsResponse.additionalDetails.customer._id
    this.dismiss();
    this.dialog.closeAll();
    //this.onRowClick(this.data.id);
    this.onRowClick("642404aad1fb9c565b21d45a");
  }

  dismiss() {
    console.log(this.data);
    this.data.preClose();
  }

  // to open user customer action dialog
  onRowClick(id) {

    console.log(this.data.id, 'iddddddddddddd')
    const dialogRef = this.dialog.open(CustomerActionsComponent, {
      panelClass: "edit-customer-dialog",
      maxWidth: "80vw",
      maxHeight: "88vh",
      // width: "818px",
      // height: "88vh",
      data: { id: id }
    });
    //   dialogRef.afterClosed().subscribe((result: any) => {
    //   if ((result && result.event && result.event == "refresh") || (result && result.event && result.event == "delete")) {
    //   this.loadLabelsAndCustomer();
    // }
    // });
  }
}
