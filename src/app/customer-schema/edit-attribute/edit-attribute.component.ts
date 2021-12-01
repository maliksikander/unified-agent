import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from "@angular/material";
import { map } from "rxjs/operators";
import { appConfigService } from "src/app/services/appConfig.service";
import { httpService } from "src/app/services/http.service";
import { sharedService } from "src/app/services/shared.service";

@Component({
  selector: "app-edit-attribute",
  templateUrl: "./edit-attribute.component.html",
  styleUrls: ["./edit-attribute.component.scss"]
})
export class EditAttributeComponent implements OnInit {
  attributeTypes: Array<any> = [];
  // columnTypeControllar = this.data.attribute.type.toLowerCase();
  // mandatory: boolean = this.data.attribute.is_required;
  // channelIden: boolean = this.data.attribute.is_channel_identifier;

  // textLength = new FormControl(this.data.attribute.characters, []);
  // label = new FormControl({ value: this.data.attribute.label, disabled: true });
  // desc = new FormControl(this.data.attribute.desc, [Validators.maxLength(100)]);
  // selectChannel = new FormControl(this.data.attribute.channels);
  // channelList: string[] = ["WEB", "FACEBOOK", "WHATSAPP", "VIBER", "SMS", "GENERIC"];
  channelTypeList: any[] = [];

  // defaultValue = new FormControl("", [Validators.required, Validators.maxLength(50), Validators.minLength(1)]);

  editAttributeForm: FormGroup;

  constructor(
    private _sharedService: sharedService,
    private _httpService: httpService,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditAttributeComponent>,
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    private _appConfigService: appConfigService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.editAttributeForm = this.formBuilder.group({
      key: ["", [Validators.required]],
      label: ["", [Validators.required, Validators.maxLength(50), Validators.minLength(1)]],
      description: ["", [Validators.maxLength(100)]],
      type: ["", [Validators.required]],
      length: ["50", [Validators.pattern("^[0-9]*$"), Validators.required, Validators.min(1), Validators.max(1000)]],
      isRequired: [false, [Validators.required]],
      defaultValue: [""],
      isPii: [false, [Validators.required]],
      isChannelIdentifier: [false, [Validators.required]],
      channelTypes: []
    });

    // console.log("data==>", this.data);
    this.getAttributeTypes();
  }

  patchFormValues() {
    this.editAttributeForm.patchValue(this.data);
    this.setValidations();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  setValidations() {
    let schemaObj = this.editAttributeForm.value;
    let length = schemaObj.length ? schemaObj.length : 50;
    let typeDef;
    for (let i = 0; i <= this.attributeTypes.length; i++) {
      if (schemaObj.type == this.attributeTypes[i].type) {
        typeDef = this.attributeTypes[i];
        break;
      }
    }
    this.editAttributeForm.controls["defaultValue"].setValidators([
      Validators.required,
      Validators.maxLength(length),
      Validators.pattern(typeDef.regex)
    ]);
  }

  // to get attribute type list
  getAttributeTypes() {
    this._httpService.getSchemaTypes().subscribe(
      (res) => {
        this.attributeTypes = res;
        this.getChannelTypes();
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  // to get channel type list
  getChannelTypes() {
    this._httpService.getChannelTypes().subscribe(
      (res) => {
        this.channelTypeList = res;
        if (this.data) this.patchFormValues();
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  // to get file asset
  getFileURL(filename) {
    return `${this._appConfigService.config.FILE_SERVER_URL}/file-engine/api/downloadFileStream?filename=${filename}`;
  }

  onTypeChange(e) {
    let schemaObj = this.editAttributeForm.value;
    let length = schemaObj.length ? schemaObj.length : 50;
    let typeDef;
    for (let i = 0; i <= this.attributeTypes.length; i++) {
      if (e.value == this.attributeTypes[i].type) {
        typeDef = this.attributeTypes[i];
        break;
      }
    }
    this.editAttributeForm.controls["defaultValue"].setValidators([
      Validators.required,
      Validators.maxLength(length),
      Validators.pattern(typeDef.regex)
    ]);

    this.cd.detectChanges();
  }

  onRequiredValueChange(e) {
    let schemaObj = this.editAttributeForm.value;
    let typeValue = { value: "" };
    typeValue.value = schemaObj.type;
    if (e.checked == true) {
      this.onTypeChange(typeValue);
    } else {
      this.editAttributeForm.controls["defaultValue"].setValidators(null);
      this.editAttributeForm.controls["defaultValue"].reset();
    }
    this.cd.detectChanges();
  }

  onChannelIdentifierChange(e) {
    if (e.checked == true) {
      this.editAttributeForm.controls["channelTypes"].setValidators([Validators.required]);
    } else {
      this.editAttributeForm.controls["channelTypes"].setValidators(null);
      this.editAttributeForm.controls["channelTypes"].setValue([]);
    }
    this.cd.detectChanges();
  }

  // onLengthChange(e) {
  //   // console.log("event==>", e);
  //   console.log("value==>", this.editAttributeForm.value.length);
  //   let len = this.editAttributeForm.value.length;
  //   let typeIndex = this.attributeTypes.findIndex((item) => this.editAttributeForm.value.type == item.type);
  //   console.log("index==>", typeIndex);
  //   let type = this.attributeTypes[typeIndex];
  //   console.log("ind==>", type);
  //   if (len && len <= 1000) {
  //     this.editAttributeForm.controls["defaultValue"].setValidators([
  //       Validators.required,
  //       Validators.maxLength(length),
  //       Validators.pattern(type.regex)
  //     ]);
  //   }
  // }

  onSave() {
    let editedData = this.editAttributeForm.value;
    editedData.isDeletable = this.data.isDeletable;
    editedData.sortOrder = this.data.sortOrder;
    let id = this.data._id;
    this.editAttribute(editedData, id);
  }

  editAttribute(data, id) {
    this._httpService.updateCustomerSchema(data, id).subscribe(
      (e) => {
        this.dialogRef.close({ event: "refresh" });
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  // ValidateNameDuplication(control: AbstractControl) {
  //   return this._httpService.getCustomerSchema().pipe(
  //     map((res) => {
  //       const schema = res;

  //       if (schema.find((e) => e.label.toLowerCase() == control.value.toLowerCase())) {
  //         return { validName: true };
  //       }
  //     })
  //   );

  //   return null;
  // }
}
