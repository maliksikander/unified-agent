import { AfterViewInit, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material";
import { httpService } from "../../services/http.service";
import { sharedService } from "../../services/shared.service";
import { SipService } from "src/app/services/sip.service";

@Component({
  selector: "app-manual-outbound-call",
  templateUrl: "./manual-outbound-call.component.html",
  styleUrls: ["./manual-outbound-call.component.scss"]
})
export class ManualOutboundCallComponent implements OnInit, AfterViewInit {
  offSet = 0;
  sort = {};
  limit = 25;
  userData: any = [];
  defaultPrefixOutbound = "";
  isOutboundSmsSendandClose;
  identifiedCustomer;
  phoneNumber;
  phoneNumberFieldSubscriber;
  outboundCallForm: FormGroup;

  constructor(
    private _httpService: httpService,
    private _sharedService: sharedService,
    private _sipService: SipService,
    private dialog: MatDialog,
    public fb: FormBuilder
  ) {
    this.defaultPrefixOutbound = this._sharedService.conversationSettings.prefixCode;

    this.outboundCallForm = this.fb.group({
      phoneControl: [
        this.defaultPrefixOutbound,
        [Validators.required, Validators.pattern("^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$"), Validators.minLength(3), Validators.maxLength(20)]
      ]
    });

    // this.fetchSMSServiceIdentifier();
  }
  ngAfterViewInit(): void {
    const phoneField = document.getElementById("phoneField");

    phoneField.addEventListener("keydown", (event) => {
      // Check your conditions here
      if (this.outboundCallForm.get("phoneControl").value == this.defaultPrefixOutbound) {
        // Prevent the default behavior of the backspace key (key code 8)
        if (event.key === "ArrowLeft" || event.key === "Backspace") {
          event.preventDefault();
        }
      }
    });
  }

  ngOnInit() {
    this.phoneNumberFieldSubscriber = this.outboundCallForm.get("phoneControl").valueChanges.subscribe((phoneNumber) => {
      if (phoneNumber != null && phoneNumber != "" && phoneNumber != undefined) {
        this.outboundCallForm.get("phoneControl").setValue("", { emitEvent: false });

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
    this.outboundCallForm.get("phoneControl").setValue("", { emitEvent: false });
    if (phoneNumber[0] == "+") {
      plusExists = true;
    }
    phoneNumber = phoneNumber.replace(/\D/g, "").replace(/\s/g, "");
    if (plusExists) {
      phoneNumber = "+" + phoneNumber;
    }
    this.phoneNumber = this.applyPrefix(phoneNumber);
    this.outboundCallForm.get("phoneControl").setValue(this.phoneNumber, { emitEvent: false });
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
    this.identifiedCustomer = undefined;
    if (this.outboundCallForm.get("phoneControl").value.length > 2) {
      this.getCustomers(this.limit, this.offSet, this.sort, {
        field: "voice",
        value: encodeURIComponent(this.outboundCallForm.get("phoneControl").value)
      });
    }

    if (this.outboundCallForm.get("phoneControl").value == "") {
      this.outboundCallForm.get("phoneControl").setValue(this.defaultPrefixOutbound, { emitEvent: false });
    }
  }

  updateMySelection(option) {
    this.identifiedCustomer = option;
  }

  initiatingOutboundCall() {
    this.dialog.closeAll();
    let inputValue = this.outboundCallForm.get("phoneControl").value;
    this.getCustomerByVoiceIdentifier(inputValue);
    // else this._sipService.makeCallOnSip(inputValue);

    // this._sipService.makeCallOnSip()
    // const dialogRef = this.dialog.open(CallControlsComponent, {
    //   panelClass: "call-controls-dialog",
    //   hasBackdrop: false,
    //   position: {
    //     top: "8%",
    //     right: "8%"
    //   }
    // });
    // dialogRef.afterClosed().subscribe((result) => {});
  }

  getCustomerByVoiceIdentifier(identifier) {
    try {
      this._httpService.getCustomerByChannelTypeAndIdentifier("CX_VOICE", identifier).subscribe(
        (res) => {
          console.log("customer==>",res);
          if (res.customer) this._sipService.makeCallOnSip(identifier);
        },
        (error) => {
          this._sharedService.Interceptor(error.error, "err");
        }
      );
    } catch (e) {
      console.error("[Error] getCustomerByVoiceIdentifier Sip ==>", e);
    }
  }
}
