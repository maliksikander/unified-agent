import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, DateAdapter } from "@angular/material";
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from "@angular/forms";
import { httpService } from "../services/http.service";
import { sharedService } from "../services/shared.service";
import { cacheService } from "../services/cache.service";
import { snackbarService } from "../services/snackbar.service";
import { AngularMultiSelect } from "angular2-multiselect-dropdown";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-create-customer",
  templateUrl: "./create-customer.component.html",
  styleUrls: ["./create-customer.component.scss"]
})
export class CreateCustomerComponent implements OnInit {
  formValidation = {};
  attributeTypes: any[] = [];
  channelTypeList: any[] = [];
  @ViewChild("dropdownRef", { static: false }) dropdownRef: AngularMultiSelect;

  constructor(
    private dateAdapter: DateAdapter<any>,
    // public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CreateCustomerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private _httpService: httpService,
    private _sharedService: sharedService,
    private _translateService: TranslateService,
    private _cacheService: cacheService,
    private cd: ChangeDetectorRef,
    private snackbarService: snackbarService
  ) {
    dialogRef.disableClose = true;
    this.dateAdapter.setLocale("en-GB");
  }

  schemaAttributes;

  fieldArray = [];
  dataReady: boolean = false;
  customerForm: FormGroup;
  nos;
  labelList = [];
  labelSettings = {
    singleSelection: false,
    text: "",
    filterSelectAllText: this._translateService.instant("globals.select-all"),
    filterUnSelectAllText: this._translateService.instant("globals.unselect-all"),
    searchPlaceholderText: this._translateService.instant("globals.Search"),
    selectAllText: this._translateService.instant("globals.select-all"),
    unSelectAllText: this._translateService.instant("globals.unselect-all"),
    noDataLabel: this._translateService.instant("globals.no-data-available"),
    enableSearchFilter: true,
    addNewItemOnFilter: true,
    primaryKey: "_id"
  };

  ngOnInit() {
    this.customerForm = new FormGroup({});

    this.getCustomerSchema();
    this.getAllLabels();
    this.cd.detectChanges();
  }

  getCustomerSchema() {
    this._httpService.getCustomerSchema().subscribe((res) => {
      let temp = res.filter((item) => item.key != "isAnonymous");

      this.schemaAttributes = temp.sort((a, b) => {
        return a.sortOrder - b.sortOrder;
      });

      this.channelTypeList = this._sharedService.channelTypeList;
      this.getAttributeTypes();
    });
  }
  getAllLabels() {
    this._httpService.getLabels().subscribe(
      (e) => {
        this.labelList = e;
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
        console.error("Error Getting labels", error);
      }
    );
  }

  // adding forms controls to existing form group using attributes in from schema as `attrSchema` parameter
  addFormControls(attrSchema: Array<any>) {
    try {
      attrSchema.forEach((item) => {
        let validatorArray: any = this.addFormValidations(item);
        if (item.isChannelIdentifier == false) {
          this.customerForm.addControl(item.key, new FormControl(item.defaultValue ? item.defaultValue : "", validatorArray));
        } else {
          this.customerForm.addControl(item.key, this.fb.array([new FormControl(item.defaultValue ? item.defaultValue : "", validatorArray)]));
        }
        if (item.type == "boolean" && item.defaultValue == "") {
          this.customerForm.controls[item.key].setValue(item.defaultValue);
        }
      });
      // console.log("control==>", this.customerForm.controls);
    } catch (e) {
      console.error("Error in add form control :", e);
    }
  }

  // creating validation definitions for form controls, using provider schema attribute as parameter
  addFormValidations(item) {
    try {
      let temp = [];
      let maxVal = 2147483647;
      let minVal = -2147483647;
      if (item.isRequired) temp.push(Validators.required);
      if (item.type == "string") temp.push(Validators.maxLength(JSON.parse(item.length)));
      temp.push(Validators.pattern(this.formValidation[item.type].regex));
      if (item.valueType == "Number") {
        temp.push(Validators.max(maxVal));
        temp.push(Validators.min(minVal));
      }
      return temp;
    } catch (e) {
      console.error("Error in add validion method :", e);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  // to get attribute type list
  getAttributeTypes() {
    this._httpService.getSchemaTypes().subscribe(
      (res) => {
        this.attributeTypes = res;
        this.formValidation = this.convertArrayToObject(this.attributeTypes, "type");
        this.addFormControls(this.schemaAttributes);
        this.dataReady = true;
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  getChannelTypeLogoName(typeName) {
    let typeIndex = this.channelTypeList.findIndex((item) => item.name === typeName);
    if (typeIndex == -1) return "";
    let channelType = this.channelTypeList[typeIndex];
    let filename = channelType.channelLogo;
    return filename;
  }

  // to convert an array of objects to an object of objects
  convertArrayToObject(array, key) {
    try {
      const initialValue = {};
      return array.reduce((obj, item) => {
        return {
          ...obj,
          [item[key]]: item
        };
      }, initialValue);
    } catch (e) {
      console.error("Error in converting array to object method :", e);
    }
  }

  getFormControls(attribute) {
    let temp: any = this.customerForm.controls[attribute.key];
    return temp.controls;
  }

  onAddFormControl(attribute) {
    let validatorArray: any = this.addFormValidations(attribute);
    let temp: any = this.customerForm.controls[attribute.key];
    let tempLength: number = temp.controls.length;
    if (tempLength < 10) {
      (<FormArray>this.customerForm.controls[attribute.key]).push(
        new FormControl(attribute.defaultValue ? attribute.defaultValue : "", validatorArray)
      );
    } else {
      this.snackbarService.open(this._translateService.instant("snackbar.CANNOT-ADD-MORE-FIELDS"), "err");
    }
  }

  onRemoveFormControl(attribute, i) {
    const control: any = this.customerForm.get(attribute.key);
    control.removeAt(i);
  }

  onSave() {
    let data = this.customerForm.value;
    if (data.labels == "") data.labels = [];
    data = this.fetchTheIdsOfLabels(data);
    data.isAnonymous = false;
    // console.log("save result==>", data);
    console.log("save result==>");
    this.createCustomer(data);
  }

  validateForm() {
    let a = this.customerForm.controls;
    for (let key in a) {
      this.customerForm.get(key).markAsTouched();
    }
    // console.log("valdiate result==>", this.customerForm);
  }

  createCustomer(data) {
    this._httpService.createCustomer(data).subscribe(
      (e) => {
        this.dialogRef.close({ event: "refresh" });
        this._sharedService.Interceptor(this._translateService.instant("snackbar.New-Customer-Created"), "succ");
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  fetchTheIdsOfLabels(obj) {
    let ids = [];
    obj.labels.filter((e) => {
      ids.push(e._id);
    });
    obj.labels = ids;
    return obj;
  }

  onAddItem(data) {
    this._httpService.getLabels().subscribe((e) => {
      let duplicate: boolean = false;
      e.find((label) => {
        if (label.name == data) {
          duplicate = true;
        }
      });
      if (duplicate) {
        this._sharedService.snackErrorMessage(this._translateService.instant("snackbar.Name-already-exists"));
      } else if (data.length > 100) {
        this._sharedService.snackErrorMessage(this._translateService.instant("snackbar.Max-100-characters-are-allowed"));
      } else {
        let obj = {
          name: data,
          createdBy: this._cacheService.agent.firstName,
          colorCode: "#a9a9a9"
        };
        this._httpService.createLabel(obj).subscribe(
          (e) => {
            this._httpService.getLabels().subscribe((ee) => {
              this.labelList = ee;
              if (this.customerForm.get("labels").value) {
                this.customerForm.get("labels").value.push(e);
              } else {
                this.customerForm.get("labels").patchValue([e]);
              }
              // this._sharedService.serviceChangeMessage("update-labels");
              this.dropdownRef.clearSearch();
            });
          },
          (error) => {
            this._sharedService.Interceptor(error.error, "err");
          }
        );
      }
    });
  }

  onItemSelect(item: any) {
    this.dropdownRef.clearSearch();
  }
  OnItemDeSelect(item: any) {
    this.dropdownRef.clearSearch();
  }
  onSelectAll(items: any) {}
  onDeSelectAll(items: any) {}

  // addPhone(): void {
  //   // (this.userForm.get('phones') as FormArray).push(
  //   //   this.fb.control(null)
  //   // );
  // }

  // removePhone() {
  //   // (this.userForm.get('phones') as FormArray).removeAt(index);
  // }

  // getPhonesFormControls(): AbstractControl {
  // return (<FormArray> this.userForm.get('phones')).controls
  // }
}
