import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatDialog } from "@angular/material";
import { FormControl, Validators } from "@angular/forms";
import { AbstractControl } from "@angular/forms";
import { map } from "rxjs/operators";
import { httpService } from "src/app/services/http.service";
import { sharedService } from "src/app/services/shared.service";

@Component({
  selector: "app-create-attribute",
  templateUrl: "./create-attribute.component.html",
  styleUrls: ["./create-attribute.component.scss"]
})
export class CreateAttributeComponent implements OnInit {
  columnTypes = [
    "string",
    "alphanumeric",
    "alphanumeric_special_character",
    "decimal",
    "phone",
    "email",
    "number",
    "date",
    "date_time",
    "url",
    "bool"
  ];
  columnTypeControllar = "string";
  mandatory: boolean = false;
  channelIden: boolean = false;
  selectedChannel;
  attributesData;
  textLength = new FormControl("50", [Validators.pattern("^[0-9]*$"), Validators.required, Validators.min(1), Validators.max(1000)]);
  label = new FormControl("", [Validators.required, Validators.maxLength(50), Validators.minLength(1)], this.ValidateNameDuplication.bind(this));
  desc = new FormControl("", [Validators.maxLength(100)]);
  defaultValue = new FormControl('', [Validators.required, Validators.maxLength(50), Validators.minLength(1)]
    , this.ValidateNameDuplication.bind(this));
  selectChannel = new FormControl();
  // channelList: string[] = ["WEB", "FACEBOOK", "WHATSAPP", "VIBER", "SMS", "GENERIC"];
  channelList: any[] = [{
    channel_name: 'WHATSAPP',
    channel_icon: 'assets/images/whatsapp-colored.svg'
  }, {
    channel_name: 'FACEBOOK',
    channel_icon: 'assets/images/facebook-colored.svg'
  }, {
    channel_name: 'SMS',
    channel_icon: 'assets/images/envelope-colored.svg'
  }, {
    channel_name: 'VIBER',
    channel_icon: 'assets/images/skype-colored.svg'
  }, {
    channel_name: 'WEB',
    channel_icon: 'assets/images/envelope-colored.svg'
  }, {
    channel_name: 'GENERIC',
    channel_icon: 'assets/images/envelope-colored.svg'
  }];

  constructor(
    private _sharedService: sharedService,
    private _httpService: httpService,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CreateAttributeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.attributesData = this.data;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  makeObject() {
    let txtLength = this.textLength.value;
    let trimmedlbl = this.label.value.trim();

    if (this.columnTypeControllar == "url") {
      txtLength = 2083;
    }

    if (this.columnTypeControllar != "url" && this.columnTypeControllar != "string") {
      txtLength = null;
    }

    let obj = {
      label: trimmedlbl,
      key: this.camelize(trimmedlbl),
      type: this.columnTypeControllar,
      is_required: this.mandatory,
      desc: this.desc.value,
      characters: txtLength,
      channels: this.selectChannel.value ? this.selectChannel.value : [],
      is_channel_identifier: this.channelIden
    };

    this._httpService.addCustomerSchema(obj).subscribe(
      (e) => {
        this.dialogRef.close({ event: "refresh" });
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  camelize(str) {
    return str
      .replace(/\s(.)/g, function ($1) {
        return $1.toUpperCase();
      })
      .replace(/\s/g, "")
      .replace(/^(.)/, function ($1) {
        return $1.toLowerCase();
      });
  }

  onTypeChange(type) {
    if (type == "string") {
      this.textLength.setValidators([Validators.pattern("^[0-9]*$"), Validators.required, Validators.min(1), Validators.max(1000)]);
    } else {
      this.textLength.clearValidators();
    }
    this.textLength.updateValueAndValidity();
  }

  ValidateNameDuplication(control: AbstractControl) {
    return this._httpService.getCustomerSchema().pipe(
      map((e) => {
        const schema = e.data;

        if (schema.find((e) => e.label.toLowerCase() == control.value.toLowerCase())) {
          return { validName: true };
        }
      })
    );

    return null;
  }
}
