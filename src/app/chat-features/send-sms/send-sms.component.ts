import { AfterViewInit, Component, Inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormControl,Validators } from '@angular/forms';
import { Observable, fromEvent } from 'rxjs';
import { map, startWith, throttleTime, distinctUntilChanged } from 'rxjs/operators';
import { MAT_SNACK_BAR_DATA, MatDialog, MatSnackBar, MatSnackBarRef } from '@angular/material';
import { CustomerActionsComponent } from '../../customer-actions/customer-actions.component';
import { httpService } from 'src/app/services/http.service';
import { TranslateService } from "@ngx-translate/core";
import { snackbarService } from "src/app/services/snackbar.service";

@Component({
  selector: 'app-send-sms',
  templateUrl: './send-sms.component.html',
  styleUrls: ['./send-sms.component.scss']
})
export class SendSmsComponent implements OnInit, AfterViewInit {
  @ViewChild('textInput', { static: true }) textInput: ElementRef;
  phoneNumber = new FormControl('');
  searchNumberRequest = "";
  offSet = 0;
  sort = {};
  limit = 25;
  query = {};
  filterQuery = [];
  filterValue;
  field = "phoneNumber";
  selectedNumber:any={};
  sendSmsResponse:any={}
 thirdPartyActivityObj={}
  //userList:any;
  userData: any = []
  outboundSmsDialogData={}

  // userList: any[] = [
  //   {
  //     name: 'Martin Gupital',
  //     phone: '030012345'

  //   }, {
  //     name: 'Alex Henry',
  //     phone: '0300123456'

  //   }, {
  //     name: 'John Brit',
  //     phone: '0300123456789'

  //   },
  // ]
  //filteredOptions: Observable<any[]>;
  outboundMessage = new FormControl("", [Validators.required]);
 
  constructor(
    private snackBar: MatSnackBar,
    private _httpService: httpService,
    private _translateService: TranslateService,
    private _snackbarService: snackbarService,
  ) { }

  ngOnInit() {

    // fromEvent(this.textInput.nativeElement, 'keyup')
    // .pipe(

    //   //throttleTime(3000), // Adjust the time (in milliseconds) for throttling
    //   //distinctUntilChanged() // This ensures that only distinct values are emitted
    // )
    // .subscribe((event: Event) => {
    //   this.handleThrottledKeyUp(event);
    //   console.log( this.searchNumberRequest," this.searchNumberRequest")

    // });



    // this.filteredOptions = this.phoneNumber.valueChanges.pipe(
    //   startWith(''),
    //   map(value => this._filter(value || '')),

    // );


  }

  getCustomers(limit, offSet, sort, query) {
    this._httpService.getCustomers(limit, offSet, sort, query).subscribe((e) => {
      this.userData = e.docs;
      console.log(e.docs, "data")
      console.log(this.userData, "userdata")
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
      console.log("feild", this.field);
      console.log("this.filterValue", this.filterValue)
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
    console.log(event,"keyup event")
    phonenumber.subscribe((res) => {
      this.searchNumberRequest = res;
      console.log(this.searchNumberRequest, " this.searchNumberRequest"),
        this.filterValue = res;

    });

  }

  updateMySelection(event){
    
    if(event){
      this.selectedNumber=event;
      console.log(event,"event updated")
    console.log(this.selectedNumber,"this.selectedNumber")
    }
    else{
      this.selectedNumber={};
    }
    
  }
  
  

  // private _filter(value: any): any[] {
  //   const filterValue = value.toLowerCase();

  //   return this.userList.filter(option => option.phone.toLowerCase().includes(filterValue));
  // }

  sendSms() {


    if(Object.keys(this.selectedNumber).length === 0 ){
      this.outboundSmsDialogData={
      
        "id": null,
        "header": {
            "sender": null,
            "channelData": {
                "channelCustomerIdentifier": "57853834848772",
                "serviceIdentifier": "1218",
                "requestPriority": 0,
                "additionalAttributes": [
                    {
                        "key": "name",
                        "type": "String2000",
                        "value": null,
                    }
                ]
            },
            "language": null,
            "timestamp": 1652074481000,
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
    }

    else{
      this.outboundSmsDialogData={
      
        "id": this.selectedNumber._id,
        "header": {
            "sender": null,
            "channelData": {
                "channelCustomerIdentifier": this.selectedNumber.phoneNumber[0],
                "serviceIdentifier": "1218",
                "requestPriority": 0,
                "additionalAttributes": [
                    {
                        "key": "name",
                        "type": "String2000",
                        "value": this.selectedNumber.firstName,
                    }
                ]
            },
            "language": null,
            "timestamp": 1652074481000,
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
 
      this._httpService.sendOutboundSms(this.outboundSmsDialogData).subscribe({
        next: (val: any) => {
          this.sendSmsResponse=val;
          //this._snackbarService.open(this._translateService.instant("snackbar.New-Announcement"), "succ");
          console.log(val,"ressponse check")
          //third party API
          //call open snack bar here
          if(this.sendSmsResponse.status == 200){
            this.openSnackBar();

          }
        },
        error: (err: any) => {
          console.error(err);
         // this._snackbarService.open(this._translateService.instant("snackbar.Unable-to-Create-New-Announcement"), "err");
          
        },
      });

    }
    
   // this.openSnackBar();//use it in after API response 
    console.log("msg data",this.outboundSmsDialogData);
    //this.outboundSmsDialogData="";
  }
  saveDataInThirdPartyActivities(){
   this.thirdPartyActivityObj={
    "id": "{{$guid}}",
    "header": {
    "sender": {
      "id": this.selectedNumber._id,
      "type": "APP",
      "senderName": "APPName",
      "additionalDetail": null
    },
    "channelData": {
      "channelCustomerIdentifier": "",
      "serviceIdentifier": "",
      "requestPriority": 0,
      "additionalAttributes": []
    },
    "language": {},
    "timestamp": 1677151053951,
    "securityInfo": {},
    "stamps": [],
    "intent": null,
    "entities": {},
    "channelSessionId": null,
    "conversationId": "642b51a7d9ba694f5ba0ba7f",
    "customer": {"_id": this.sendSmsResponse.additionalDetails.customer._id},
    "replyToMessageId": null,
    "providerMessageId": null
  },
    "body": {
        "type": "PLAIN",
        "markdownText": "hello",
        "custom1": "DummyValue1",
        "custom2": "DummayVlaue2"
    }
}

   

  }


  openSnackBar() {

    let snackBar: MatSnackBarRef<SendSmsSnackbarComponent>;

    snackBar = this.snackBar.openFromComponent(SendSmsSnackbarComponent, {
      duration: 200000,
      panelClass: ['chat-success-snackbar', 'send-sms-notify'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      data: {
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
    this.dismiss();
    this.dialog.closeAll();
    this.onRowClick('64a3d6a59ae709b4096d50dc');
  }

  dismiss() {
    console.log(this.data);
    this.data.preClose();
  }

  // to open user customer action dialog
  onRowClick(id) {

    console.log(id, 'iddddddddddddd')
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
