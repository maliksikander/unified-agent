import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from "@angular/material";
import { httpService } from "src/app/services/http.service";
import { sharedService } from "src/app/services/shared.service";

@Component({
  selector: "app-edit-attribute",
  templateUrl: "./edit-attribute.component.html",
  styleUrls: ["./edit-attribute.component.scss"]
})
export class EditAttributeComponent implements OnInit {
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
  columnTypeControllar = this.data.attribute.type.toLowerCase();
  mandatory: boolean = this.data.attribute.is_required;
  channelIden: boolean = this.data.attribute.is_channel_identifier;

  textLength = new FormControl(this.data.attribute.characters, []);
  label = new FormControl({ value: this.data.attribute.label, disabled: true }, [
    Validators.required,
    Validators.maxLength(50),
    Validators.minLength(1)
  ]);
  desc = new FormControl(this.data.attribute.desc, [Validators.maxLength(100)]);
  selectChannel = new FormControl(this.data.attribute.channels);
  channelList: string[] = ["WEB", "FACEBOOK", "WHATSAPP", "VIBER", "SMS", "GENERIC"];

  constructor(
    private _sharedService: sharedService,
    private _httpService: httpService,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditAttributeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    if (this.data.attribute.type == "string") {
      this.textLength.setValidators([Validators.pattern("^[0-9]*$"), Validators.required, Validators.min(1), Validators.max(1000)]);
      this.textLength.updateValueAndValidity();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  makeObject() {
    let updatedAttr = Object.assign({}, this.data.attribute);

    updatedAttr.is_required = this.mandatory;
    updatedAttr.desc = this.desc.value;
    updatedAttr.characters = this.textLength.value;
    updatedAttr.channels = this.selectChannel.value ? this.selectChannel.value : [];
    updatedAttr.is_channel_identifier = this.channelIden;

    this._httpService.updateCustomerSchema(updatedAttr).subscribe(
      (e) => {
        this.dialogRef.close({ event: "refresh" });
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }
}
