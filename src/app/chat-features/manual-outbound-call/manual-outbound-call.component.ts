import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MAT_SNACK_BAR_DATA, MatDialog, MatSnackBar, MatSnackBarRef} from '@angular/material';
import {socketService} from '../../services/socket.service';
import {httpService} from '../../services/http.service';
import {TranslateService} from '@ngx-translate/core';
import {snackbarService} from '../../services/snackbar.service';
import {sharedService} from '../../services/shared.service';
import {cacheService} from '../../services/cache.service';
import {Router} from '@angular/router';
import {v4 as uuidv4} from 'uuid';
import {CustomerActionsComponent} from '../../customer-actions/customer-actions.component';
import {CallControlsComponent} from '../../new-components/call-controls/call-controls.component';

@Component({
  selector: 'app-manual-outbound-call',
  templateUrl: './manual-outbound-call.component.html',
  styleUrls: ['./manual-outbound-call.component.scss']
})
export class ManualOutboundCallComponent implements OnInit, AfterViewInit  {

  offSet = 0;
  sort = {};
  limit = 25;
  userData: any = []
  defaultPrefixOutbound = '';
  isOutboundSmsSendandClose;
  identifiedCustomer = null;
  phoneNumber;
  phoneNumberFieldSubscriber;
  outboundCall: FormGroup;



  constructor(
    private snackBar: MatSnackBar,
    private _socketService: socketService,
    private _httpService: httpService,
    private _translateService: TranslateService,
    private _snackbarService: snackbarService,
    private _sharedService: sharedService,
    private _cacheService: cacheService,
    private _router: Router,
    private dialog: MatDialog,
    public fb: FormBuilder) {

    this.defaultPrefixOutbound = this._sharedService.conversationSettings.prefixCode;

    this.outboundCall = this.fb.group({


      phoneControl: [this.defaultPrefixOutbound,
        [
          Validators.required,
          Validators.pattern("^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$"),
          Validators.minLength(3),
          Validators.maxLength(20)
        ]],
    });


    // this.fetchSMSServiceIdentifier();


  }
  ngAfterViewInit(): void {
    const phoneField = document.getElementById('phoneField');


    phoneField.addEventListener('keydown', (event) => {
      // Check your conditions here
      if (this.outboundCall.get("phoneControl").value == this.defaultPrefixOutbound) {
        // Prevent the default behavior of the backspace key (key code 8)
        if (event.key === "ArrowLeft" || event.key === 'Backspace') {
          event.preventDefault();
        }
      }
    });
  }

  ngOnInit() {

    this.phoneNumberFieldSubscriber = this.outboundCall.get("phoneControl").valueChanges.subscribe((phoneNumber) => {
      if (phoneNumber != null && phoneNumber != "" && phoneNumber != undefined) {

        this.outboundCall.get("phoneControl").setValue('', { emitEvent: false });

        this.formatePhoneNumber(phoneNumber);
      } else {
        this.userData = [];
      }
    });

  }

  formatePhoneNumber(phoneNumber) {

    phoneNumber = this.removeStartingNumber(phoneNumber, this.defaultPrefixOutbound);

    phoneNumber = this.convertZerosToPlus(phoneNumber);

    //   setTimeout(() => {
    let plusExists = false;
    this.outboundCall.get("phoneControl").setValue('', { emitEvent: false });
    if (phoneNumber[0] == '+') {
      plusExists = true;
    }
    phoneNumber = phoneNumber.replace(/\D/g, '').replace(/\s/g, '');
    if (plusExists) {
      phoneNumber = '+' + phoneNumber;
    }
    this.phoneNumber = this.applyPrefix(phoneNumber);
    this.outboundCall.get("phoneControl").setValue(this.phoneNumber, { emitEvent: false });
    // }, 100);
  }

  convertZerosToPlus(input) {
    // Remove leading zeros and replace with a plus symbol
    let modifiedStr = input.replace(/^0{2,}/, '+');

    return modifiedStr;
  }

  removeStartingNumber(completeNumber, prefix) {
    if (completeNumber.startsWith(prefix)) {
      return completeNumber.substring(prefix.length);
    }
    return completeNumber;
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
    if (this.outboundCall.get("phoneControl").value.length > 2) {
      this.getCustomers(this.limit, this.offSet, this.sort, { field: "phoneNumber", value: encodeURIComponent(this.outboundCall.get("phoneControl").value) });
    }

    if (this.outboundCall.get("phoneControl").value == "") {
      this.outboundCall.get("phoneControl").setValue(this.defaultPrefixOutbound, { emitEvent: false });
    }


  }

  updateMySelection(option) {

    this.identifiedCustomer = option;
  }


  initiatingOutboundCall() {
    this.dialog.closeAll();
    const dialogRef = this.dialog.open(CallControlsComponent, {
      panelClass: "call-controls-dialog",
      hasBackdrop: false,
      position: {
        top: "8%",
        right: "8%"
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
    });


  }

}
