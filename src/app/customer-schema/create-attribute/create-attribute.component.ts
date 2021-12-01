import { Component, OnInit, Inject, ChangeDetectorRef } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatDialog } from "@angular/material";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { AbstractControl } from "@angular/forms";
import { map } from "rxjs/operators";
import { httpService } from "src/app/services/http.service";
import { sharedService } from "src/app/services/shared.service";
import { appConfigService } from "src/app/services/appConfig.service";
import { Item } from "angular2-multiselect-dropdown";

@Component({
  selector: "app-create-attribute",
  templateUrl: "./create-attribute.component.html",
  styleUrls: ["./create-attribute.component.scss"]
})
export class CreateAttributeComponent implements OnInit {
  attributeTypes: Array<any> = [];
  channelIden: boolean = false;
  // selectedChannel;
  createAttributeForm: FormGroup;

  // selectChannel = new FormControl();
  // channelList: string[] = ["WEB", "FACEBOOK", "WHATSAPP", "VIBER", "SMS", "GENERIC"];
  channelTypeList: any[] = [];

  constructor(
    private _sharedService: sharedService,
    private _httpService: httpService,
    private _appConfigService: appConfigService,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CreateAttributeComponent>,
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.createAttributeForm = this.formBuilder.group({
      key: ["", [Validators.required]],
      label: ["", [Validators.required, Validators.maxLength(50), Validators.minLength(1)], this.ValidateNameDuplication.bind(this)],
      description: ["", [Validators.maxLength(100)]],
      type: ["", [Validators.required]],
      length: ["50", [Validators.pattern("^[0-9]*$"), Validators.required, Validators.min(1), Validators.max(1000)]],
      isRequired: [false, [Validators.required]],
      defaultValue: [""],
      isPii: [false, [Validators.required]],
      isChannelIdentifier: [false, [Validators.required]],
      channelTypes: []
    });

    this.getAttributeTypes();
    this.getChannelTypes();
  }

  // to get attribute type list
  getAttributeTypes() {
    this._httpService.getSchemaTypes().subscribe(
      (res) => {
        this.attributeTypes = res;
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

  onNoClick(): void {
    this.dialogRef.close();
  }

  async onSave() {
    let data = this.createAttributeForm.value;
    data.isDeletable = true;
    data.channelTypes = data.isChannelIdentifier == true ? data.channelTypes : [];
    let temp = await this._httpService.getSchemaMaxOrder().toPromise();
    let sort = temp[0].sortOrder ? temp[0].sortOrder + 1 : 0;
    data.sort = sort;
    this.createNewAttribute(data);
  }

  createNewAttribute(data) {
    this._httpService.addCustomerSchema(data).subscribe(
      (e) => {
        this.dialogRef.close({ event: "refresh" });
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  onTypeChange(e) {
    let schemaObj = this.createAttributeForm.value;
    let length = schemaObj.length ? schemaObj.length : 50;
    let typeDef;
    for (let i = 0; i <= this.attributeTypes.length; i++) {
      if (e.value == this.attributeTypes[i].type) {
        typeDef = this.attributeTypes[i];
        break;
      }
    }
    this.createAttributeForm.controls["defaultValue"].setValidators([
      Validators.required,
      Validators.maxLength(length),
      Validators.pattern(typeDef.regex)
    ]);

    this.cd.detectChanges();
  }

  onRequiredValueChange(e) {
    let schemaObj = this.createAttributeForm.value;
    let typeValue = { value: "" };
    typeValue.value = schemaObj.type;
    if (e.checked == true) {
      this.onTypeChange(typeValue);
    } else {
      this.createAttributeForm.controls["defaultValue"].setValidators(null);
      this.createAttributeForm.controls["defaultValue"].reset();
    }
    this.cd.detectChanges();
  }

  onChannelIdentifierChange(e) {
    if (e.checked == true) {
      this.createAttributeForm.controls["channelTypes"].setValidators([Validators.required]);
    } else {
      this.createAttributeForm.controls["channelTypes"].setValidators(null);
      this.createAttributeForm.controls["channelTypes"].setValue([]);
    }
    this.cd.detectChanges();
  }

  // generate key using user typed attribute label
  attrKeyGenerator(label: string) {
    let key = label.replace(" ", "_");
    this.createAttributeForm.controls["key"].setValue(key);
  }

  ValidateNameDuplication(control: AbstractControl) {
    return this._httpService.getCustomerSchema().pipe(
      map((res) => {
        const schema = res;

        if (schema.find((e) => e.label.toLowerCase() == control.value.toLowerCase())) {
          return { validName: true };
        }
      })
    );

    return null;
  }
}
