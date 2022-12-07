import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import {  FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from "@angular/material";
import { httpService } from "src/app/services/http.service";
import { sharedService } from "src/app/services/shared.service";

@Component({
  selector: "app-edit-attribute",
  templateUrl: "./edit-attribute.component.html",
  styleUrls: ["./edit-attribute.component.scss"]
})
export class EditAttributeComponent implements OnInit {
  attributeTypes: Array<any> = [];
  channelTypeList: any[] = [];
  editAttributeForm: FormGroup;

  constructor(
    private _sharedService: sharedService,
    private _httpService: httpService,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditAttributeComponent>,
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.editAttributeForm = this.formBuilder.group({
      key: ["", [Validators.required]],
      label: ["", [Validators.required, Validators.maxLength(50), Validators.minLength(1)]],
      description: ["", [Validators.maxLength(100)]],
      type: ["", [Validators.required]],
      length: ["50", [Validators.pattern("^[0-9]*$"), Validators.min(1), Validators.max(1000)]],
      isRequired: [false, [Validators.required]],
      defaultValue: [""],
      isPii: [false, [Validators.required]],
      isChannelIdentifier: [false, [Validators.required]],
      channelTypes: []
    });

    this.channelTypeList = this._sharedService.channelTypeList;
    this.getAttributeTypes();
  }

  patchFormValues() {
    // if(this.data.length == null ) this.data.length = ""
    //  console.log("data==>",this.data)
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
    if (schemaObj.isRequired)
      this.editAttributeForm.controls["defaultValue"].setValidators([
        Validators.required,
        // Validators.maxLength(length),
        Validators.pattern(typeDef.regex)
      ]);

    if (schemaObj.type == "string") {
      this.editAttributeForm.controls["length"].setValidators([Validators.required]);
      this.editAttributeForm.controls["defaultValue"].setValidators([Validators.maxLength(length)]);
    }

    // console.log("added ==>", this.editAttributeForm);
  }

  // to get attribute type list
  getAttributeTypes() {
    this._httpService.getSchemaTypes().subscribe(
      (res) => {
        this.attributeTypes = res;
        if (this.data) this.patchFormValues();
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  onTypeChange(e) {
    let schemaObj = this.editAttributeForm.value;
    let length = schemaObj.length ? schemaObj.length : 50;
    let typeDef = this.attributeTypes.find((item) => item.type == e.value);
    let validatorArray: Array<any> = [Validators.required, Validators.pattern(typeDef.regex), Validators.maxLength(length)];
    if (e.value != "string") validatorArray.pop();
    this.editAttributeForm.controls["defaultValue"].setValidators(validatorArray);

    this.cd.detectChanges();
  }

  onRequiredValueChange(e) {
    if (this.editAttributeForm.value.key == "labels") {
      this.editAttributeForm.get("defaultValue").setValue([]);
    } else {
      let schemaObj = this.editAttributeForm.value;
      let typeValue = { value: "" };
      typeValue.value = schemaObj.type;
      if (e.checked == true) {
        this.onTypeChange(typeValue);
      } else {
        this.editAttributeForm.controls["defaultValue"].setValidators(null);
        this.editAttributeForm.controls["defaultValue"].reset();
      }
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

  onLengthChange() {
    let value = this.editAttributeForm.value.length;
    if (value && value != null) {
      this.onTypeChange({ value: "string" });
      let def = this.editAttributeForm.value.defaultValue;
      this.editAttributeForm.get("defaultValue").setValue(def);
    }
  }

  onSave() {
    let editedData = this.editAttributeForm.value;
    editedData.isDeleteAble = this.data.isDeleteAble;
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
