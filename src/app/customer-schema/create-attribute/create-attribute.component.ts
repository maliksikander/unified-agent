import { Component, OnInit, Inject, ChangeDetectorRef } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from "@angular/material";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AbstractControl } from "@angular/forms";
import { map } from "rxjs/operators";
import { httpService } from "src/app/services/http.service";
import { sharedService } from "src/app/services/shared.service";
import { snackbarService } from "src/app/services/snackbar.service";

@Component({
  selector: "app-create-attribute",
  templateUrl: "./create-attribute.component.html",
  styleUrls: ["./create-attribute.component.scss"]
})
export class CreateAttributeComponent implements OnInit {
  attributeTypes: Array<any> = [];
  channelIden: boolean = false;
  createAttributeForm: FormGroup;
  channelTypeList: any[] = [];

  constructor(
    private _sharedService: sharedService,
    private _httpService: httpService,
    public dialogRef: MatDialogRef<CreateAttributeComponent>,
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackbarService: snackbarService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.createAttributeForm = this.formBuilder.group({
      key: [""],
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

    this.channelTypeList = this._sharedService.channelTypeList;
    this.getAttributeTypes();
  }

  // to get attribute type list
  getAttributeTypes() {
    this._httpService.getSchemaTypes().subscribe(
      (res) => {
        this.attributeTypes = res;
        this.createAttributeForm.controls["type"].setValue("string");
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave() {
    let data = this.createAttributeForm.value;
    data.key = this.camelize(data.label);
    data.isDeleteAble = true;
    data.channelTypes = data.isChannelIdentifier == true ? data.channelTypes : [];
    if (data.type != "string") data.length = "";
    // console.log("attr data==>", data);
    this.createNewAttribute(data);
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

  createNewAttribute(data) {
    this._httpService.addCustomerSchema(data).subscribe(
      (res) => {
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
    let typeDef = this.attributeTypes.find((item) => item.type == e.value);
    let validatorArray: Array<any> = [Validators.required, Validators.pattern(typeDef.regex), Validators.maxLength(length)];
    if (e.value != "string") validatorArray.pop();
    this.createAttributeForm.controls["defaultValue"].setValidators(validatorArray);

    if (e.value == "number" || e.value == "password" || e.value == "name" || e.value == "boolean" || e.value == "url") {
      this.createAttributeForm.controls["isChannelIdentifier"].setValue(false);
      this.createAttributeForm.controls["channelTypes"].setValue([]);
    }

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

  onLengthChange() {
    let value = this.createAttributeForm.value.length;
    if (value && value != null) {
      this.onTypeChange({ value: "string" });
      let def = this.createAttributeForm.value.defaultValue;
      this.createAttributeForm.get("defaultValue").setValue(def);
    }
  }
}
