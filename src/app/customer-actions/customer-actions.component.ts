import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatDialog, DateAdapter } from "@angular/material";
import { FormControl, Validators, FormGroup, FormArray, FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { httpService } from "../services/http.service";
import { cacheService } from "../services/cache.service";
import { sharedService } from "../services/shared.service";
import { ConfirmationDialogComponent } from "../new-components/confirmation-dialog/confirmation-dialog.component";
import { snackbarService } from "../services/snackbar.service";

@Component({
  selector: "app-customer-actions",
  templateUrl: "./customer-actions.component.html",
  styleUrls: ["./customer-actions.component.scss"]
})
export class CustomerActionsComponent implements OnInit {
  formValidation = {};
  attributeTypes: any[] = [];
  userInfo;
  schemaAttributes;
  customerForm: FormGroup;
  userIni: boolean = false;
  schemaIni: boolean = false;
  editTab: boolean = false;
  channelTypeList: any[] = [];
  // channelIdentifierKeys: Array<any> = [];
  // editActiveMode: boolean = true;

  constructor(
    private _httpService: httpService,
    private dateAdapter: DateAdapter<any>,
    private dialog: MatDialog,
    private _cacheService: cacheService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _sharedService: sharedService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CustomerActionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackbarService: snackbarService
  ) {
    dialogRef.disableClose = true;
    this.dateAdapter.setLocale("en-GB");
  }

  // selectedUserNumbers = [];
  // phoneControl = new FormControl("", [Validators.required]);
  // smsControl = new FormControl("", [Validators.required]);

  // customerLabels = [];
  // labels = [];
  // labelSettings = {
  //   singleSelection: false,
  //   text: "",
  //   filterSelectAllText: "Select All",
  //   filterUnSelectAllText: "Unselect All",
  //   searchPlaceholderText: "Search",
  //   selectAllText: "Select All",
  //   unSelectAllText: "Unselect All",
  //   noDataLabel: "No Data available",
  //   enableSearchFilter: true,
  //   addNewItemOnFilter: true,
  //   primaryKey: "_id"
  // };

  ngOnInit() {
    this.customerForm = new FormGroup({});

    // let query = { field: "_id", value: this.data.id };
    this.getCustomerByID();
  }

  getCustomerByID() {
    this._httpService.getCustomerById(this.data.id).subscribe((res) => {
      // console.log("customer==>", res);
      this.userInfo = res;
      this.userIni = true;
      this.getCustomerSchema();
    });
  }

  getCustomerSchema() {
    this._httpService.getCustomerSchema().subscribe((res) => {
      let temp = res.filter((item) => item.key != "isAnonymous");
      this.schemaAttributes = temp.sort((a, b) => {
        return a.sort_order - b.sort_order;
      });

      this.channelTypeList = this._sharedService.channelTypeList;
      this.getAttributeTypes();
    });
  }

  // to get attribute type list
  getAttributeTypes() {
    this._httpService.getSchemaTypes().subscribe(
      (res) => {
        this.attributeTypes = res;
        this.formValidation = this.convertArrayToObject(this.attributeTypes, "type");
        this.addFormControls(this.schemaAttributes);
        // console.log("tab==>", this.data);
        if (this.data.tab == null) {
          this.editTab = false;
        } else {
          if (this.data.tab == "edit") {
            this.editTab = true;

            this.schemaAttributes.filter((e) => {
              this.customerForm.get(e.key).enable();
            });
          }
        }
        this.schemaIni = true;
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
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

  // adding forms controls to existing form group using attributes in from schema as `attrSchema` parameter
  addFormControls(attrSchema: Array<any>) {
    try {
      attrSchema.forEach((item) => {
        let validatorArray: any = this.addFormValidations(item);
        if (item.isChannelIdentifier == false) {
          this.customerForm.addControl(item.key, new FormControl("", validatorArray));
        } else {
          this.customerForm.addControl(item.key, this.fb.array([]));
          let val = this.userInfo[item.key];
          let valLength: number = val ? val.length : 1;
          for (let i = 0; i < valLength; i++) {
            this.onAddFormControl(item);
          }
        }
      });
      this.patchEditValues();
    } catch (e) {
      console.error("Error in add form control :", e);
    }
  }

  // addControlInFormArrays(schema) {
  //   let userObj = JSON.parse(JSON.stringify(this.userInfo));
  //   delete userObj._id, userObj.__v;
  //   let userObjKeys = Object.keys(userObj);
  //   let identifierKeysLength = this.channelIdentifierKeys.length;
  //   let patchObjLength = userObjKeys.length;
  //   console.log("schema==>", schema);
  //   console.log("userObjkeys==>", userObjKeys);
  //   console.log("identifierkeys==>", this.channelIdentifierKeys);

  //   let array1: Array<any> = [];
  //   let array2: Array<any> = [];

  //   if (identifierKeysLength > patchObjLength) {
  //     array1 = this.channelIdentifierKeys;
  //     array2 = userObjKeys;
  //   } else {
  //     array1 = userObjKeys;
  //     array2 = this.channelIdentifierKeys;
  //   }

  //   array1.forEach((item1) => {
  //     array2.forEach((item2) => {
  //       if (item1 == item2) {
  //         console.log("item1==>", item1);
  //         console.log("item2==>", item2);
  //         let valueLength = userObj[item1].length;
  //         console.log("length==>", valueLength);
  //         for (let i = 0; i < valueLength; i++) {
  //           this.onAddFormControl(schema);
  //         }
  //       }
  //     });
  //   });
  // }

  patchEditValues() {
    let patchObj = JSON.parse(JSON.stringify(this.userInfo));
    delete patchObj._id, patchObj.__v;
    this.customerForm.patchValue(patchObj);
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

  getFormControls(attribute) {
    let temp: any = this.customerForm.controls[attribute.key];
    return temp.controls;
  }

  onAddFormControl(attribute) {
    let validatorArray: any = this.addFormValidations(attribute);
    let temp: any = this.customerForm.controls[attribute.key];
    let tempLength: number = temp.controls.length;
    if (tempLength < 10) {
      (<FormArray>this.customerForm.controls[attribute.key]).push(new FormControl("", validatorArray));
    } else {
      this.snackbarService.open("CANNOT_ADD_MORE_FIELDS", "err");
    }
  }

  onRemoveFormControl(attribute, i) {
    const control: any = this.customerForm.get(attribute.key);
    control.removeAt(i);
  }

  onSave() {
    let customerObj = this.customerForm.value;
    customerObj.isAnonymous = this.userInfo.isAnonymous;
    this.updateCustomer(customerObj);
  }

  updateCustomer(customerObj) {
    let id = this.userInfo._id;
    this._httpService.updateCustomerById(id, customerObj).subscribe(
      (e) => {
        this.dialogRef.close({ event: "refresh" });
        this._sharedService.Interceptor("Customer updated!", "succ");
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  editClick() {
    this.editTab = true;
    this.schemaAttributes.filter((e) => {
      this.customerForm.get(e.key).enable();
    });
  }

  gotoInteractions() {
    this.onNoClick();
    let obj = { base: "interactions", id: this.userInfo._id };
    sessionStorage.setItem("url", JSON.stringify(obj));
    this._router.navigate(["interactions", this.userInfo._id]);
  }

  makeCall(number) {
    window.parent.postMessage(number, "*");
  }

  gotoLink(eam, key, value) {
    if (eam && key == "url") {
      window.open(value, "_blank");
    }
  }

  validateForm() {
    let a = this.customerForm.controls;
    for (let key in a) {
      this.customerForm.get(key).markAsTouched();
    }
    console.log("validate form", this.customerForm);
  }

  getChannelTypeLogoName(typeName) {
    let typeIndex = this.channelTypeList.findIndex((item) => item.name === typeName);
    if (typeIndex == -1) return "";
    let channelType = this.channelTypeList[typeIndex];
    let filename = channelType.channelLogo;
    return filename;
  }

  // checkType(label) {
  //   if (label == "Label12") {
  //     return "textarea";
  //   } else {
  //     return "text";
  //   }
  // }

  // deleteCustomer() {
  //   const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
  //     width: "490px",
  //     panelClass: "confirm-dialog",
  //     data: { header: "delete customer", message: `Are you sure you want to delete?` }
  //   });
  //   dialogRef.afterClosed().subscribe((result: any) => {
  //     if (result && result.event == "confirm") {
  //       this._httpService.deleteCustomerById(this.data.id).subscribe(
  //         (e) => {
  //           this._sharedService.Interceptor("deleted!", "succ");
  //           this.dialogRef.close({ event: "delete" });
  //         },
  //         (error) => {
  //           this._sharedService.Interceptor(error, "err");
  //         }
  //       );
  //     }
  //   });
  // }

  // save(a) {}
  // onItemSelect(item: any) {}
  // OnItemDeSelect(item: any) {}
  // onSelectAll(items: any) {}
  // onDeSelectAll(items: any) {}

  // onAddItem(data) {
  //   this._httpService.getLabels().subscribe((e) => {
  //     let duplicate: boolean = false;
  //     e.data.find((label) => {
  //       if (label.name == data) {
  //         duplicate = true;
  //       }
  //     });
  //     if (duplicate) {
  //       this._sharedService.snackErrorMessage("Name already exists");
  //     } else if (data.length > 100) {
  //       this._sharedService.snackErrorMessage("Max length is 100");
  //     } else {
  //       let obj = {
  //         name: data,
  //         created_by: this._cacheService.agent.username,
  //         color_code: "#a9a9a9"
  //       };
  //       this._httpService.createLabel(obj).subscribe(
  //         (e) => {
  //           this._httpService.getLabels().subscribe((ee) => {
  //             this.labels = ee.data;
  //             this.customerLabels.push(e.data);
  //             this.editCustomerForm.get("labels").patchValue(this.customerLabels);
  //             this._sharedService.serviceChangeMessage({ msg: "update-labels", data: null });
  //           });
  //         },
  //         (error) => {
  //           this._sharedService.Interceptor(error.error, "err");
  //         }
  //       );
  //     }
  //   });
  // }
  // fetchTheIdsOfLabels(obj) {
  //   let ids = [];
  //   if (obj.labels[0]) {
  //     obj.labels.filter((e) => {
  //       ids.push(e._id);
  //     });
  //   }
  //   obj.labels = ids;
  //   return obj;
  // }

  // fetchCustomerLabels() {
  //   this.userInfo.labels.filter((id) => {
  //     this.labels.filter((label) => {
  //       if (label._id == id) {
  //         this.customerLabels.push(label);
  //       }
  //     });
  //   });

  //   this.editCustomerForm.get("labels").patchValue(this.customerLabels);
  // }
}
