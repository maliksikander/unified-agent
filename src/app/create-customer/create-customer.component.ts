import { Component, OnInit, Inject, ChangeDetectorRef } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, DateAdapter } from "@angular/material";
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl, FormArray } from "@angular/forms";
import { httpService } from "../services/http.service";
import { sharedService } from "../services/shared.service";
import { appConfigService } from "../services/appConfig.service";

@Component({
  selector: "app-create-customer",
  templateUrl: "./create-customer.component.html",
  styleUrls: ["./create-customer.component.scss"]
})
export class CreateCustomerComponent implements OnInit {
  formValidation = {};
  attributeTypes: any[] = [];
  channelTypeList: any[] = [];

  constructor(
    private dateAdapter: DateAdapter<any>,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CreateCustomerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private _httpService: httpService,
    private _sharedService: sharedService,
    private cd: ChangeDetectorRef,
    private _appConfigService: appConfigService
  ) {
    dialogRef.disableClose = true;
    this.dateAdapter.setLocale("en-GB");
  }

  schemaAttributes;

  fieldArray = [];
  dataReady: boolean = false;
  customerForm: FormGroup;
  nos;
  customerLabels = [];
  labels = [];
  labelSettings = {
    singleSelection: false,
    text: "",
    filterSelectAllText: "Select all",
    filterUnSelectAllText: "Unselect all",
    searchPlaceholderText: "Search",
    selectAllText: "Select all",
    unSelectAllText: "Unselect all",
    noDataLabel: "No Data Available",
    enableSearchFilter: true,
    addNewItemOnFilter: true,
    primaryKey: "_id"
  };

  ngOnInit() {
    // const formGroup = {};

    this.customerForm = new FormGroup({});

    this.getCustomerSchema();
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

  // adding forms controls to existing form group using attributes in from schema as `attrSchema` parameter
  addFormControls(attrSchema: Array<any>) {
    try {
      attrSchema.forEach((item) => {
        let validatorArray: any = this.addFormValidations(item);
        if(item.isChannelIdentifier == false){
          this.customerForm.addControl(item.key, new FormControl(item.defaultValue ? item.defaultValue : "", validatorArray));
        }
        else{
          // let value = new FormControl("");
          // this.customerForm.addControl(item.key, new FormArray(value));
        }
        if (item.type == "boolean" && item.defaultValue == "") {
          this.customerForm.controls[item.key].setValue(item.defaultValue);
        }
      });
      console.log("control==>", this.customerForm.controls);
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

  getChannelTypeLogo(typeName) {
    let typeIndex = this.channelTypeList.findIndex((item) => item.name === typeName);
    if (typeIndex == -1) return null;
    let channelType = this.channelTypeList[typeIndex];
    let filename = channelType.channelLogo;
    return `${this._appConfigService.config.FILE_SERVER_URL}/file-engine/api/downloadFileStream?filename=${filename}`;
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

  onSave() {}

  validateForm() {
    let a = this.customerForm.controls;
    for (let key in a) {
      this.customerForm.get(key).markAsTouched();
    }
    console.log("valdiate result==>", this.customerForm);
  }

  saveData() {
    let data = this.customerForm.value;
    console.log("save result==>", data);
    // customerObj = this.fetchTheIdsOfLabels(customerObj);
    // customerObj["createdBy"] = this._cacheService.agent.username;
    // customerObj["updatedBy"] = "";
    // console.log(customerObj);

    // this._httpService.createCustomer(customerObj).subscribe(
    //   (e) => {
    //     this.dialogRef.close({ event: "refresh" });
    //     this._sharedService.Interceptor("Customer added!", "succ");
    //   },
    //   (error) => {
    //     this._sharedService.Interceptor(error.error, "err");
    //   }
    // );
  }

  // fetchTheIdsOfLabels(obj) {
  //   let ids = [];
  //   obj.labels.filter((e) => {
  //     ids.push(e._id);
  //   });
  //   obj.labels = ids;
  //   return obj;
  // }

  // onAddItem(data) {
  //   //   this._httpService.getLabels().subscribe((e) => {
  //   //     let duplicate: boolean = false;
  //   //     e.data.find((label) => {
  //   //       if (label.name == data) {
  //   //         duplicate = true;
  //   //       }
  //   //     });
  //   //     if (duplicate) {
  //   //       this._sharedService.snackErrorMessage("Name already exists");
  //   //     } else if (data.length > 100) {
  //   //       this._sharedService.snackErrorMessage("Max 100 characters are allowed");
  //   //     } else {
  //   //       let obj = {
  //   //         name: data,
  //   //         created_by: this._cacheService.agent.username,
  //   //         color_code: "#a9a9a9"
  //   //       };
  //   //       this._httpService.createLabel(obj).subscribe(
  //   //         (e) => {
  //   //           this._httpService.getLabels().subscribe((ee) => {
  //   //             this.labels = ee.data;
  //   //             this.customerLabels.push(e.data);
  //   //             this.myGroup.get("labels").patchValue(this.customerLabels);
  //   //           });
  //   //         },
  //   //         (error) => {
  //   //           this._sharedService.Interceptor(error.error, "err");
  //   //         }
  //   //       );
  //   //     }
  //   //   });
  // }

  // onItemSelect(item: any) {}
  // OnItemDeSelect(item: any) {}
  // onSelectAll(items: any) {}
  // onDeSelectAll(items: any) {}

  addPhone(): void {
    // (this.userForm.get('phones') as FormArray).push(
    //   this.fb.control(null)
    // );
  }

  removePhone() {
    // (this.userForm.get('phones') as FormArray).removeAt(index);
  }

  // getPhonesFormControls(): AbstractControl {
  // return (<FormArray> this.userForm.get('phones')).controls
  // }
}
