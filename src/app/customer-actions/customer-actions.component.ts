import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatDialog, DateAdapter } from "@angular/material";
import { FormControl, Validators, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { httpService } from "../services/http.service";
import { cacheService } from "../services/cache.service";
import { sharedService } from "../services/shared.service";
import { ConfirmationDialogComponent } from "../new-components/confirmation-dialog/confirmation-dialog.component";

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
  editCustomerForm: FormGroup;
  userIni: boolean = false;
  schemaIni: boolean = false;
  editTab: boolean = false;
  // editActiveMode: boolean = true;

  constructor(
    private _httpService: httpService,
    private dateAdapter: DateAdapter<any>,
    private dialog: MatDialog,
    private _cacheService: cacheService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _sharedService: sharedService,
    public dialogRef: MatDialogRef<CustomerActionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
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
    this.editCustomerForm = new FormGroup({});

    // let query = { field: "_id", value: this.data.id };
    console.log("data==>", this.data);
    this.getCustomerByID();
  }

  getCustomerByID() {
    this._httpService.getCustomerById(this.data.id).subscribe((res) => {
      console.log("customer==>", res);
      this.userInfo = res;
      this.userIni = true;
      this.getCustomerSchema();
    });
  }

  getCustomerSchema() {
    this._httpService.getCustomerSchema().subscribe((ee) => {
      this.schemaAttributes = ee.sort((a, b) => {
        return a.sort_order - b.sort_order;
      });
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
        console.log("tab==>", this.data);
        if (this.data.tab == null) {
          this.editTab = false;
        } else {
          if (this.data.tab == "edit") {
            this.editTab = true;
            // this.editActiveMode = false;
            this.schemaAttributes.filter((e) => {
              //  if (e.key != "createdBy" && e.key != "updatedBy") {
              this.editCustomerForm.get(e.key).enable();
              // }
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
        this.editCustomerForm.addControl(item.key, new FormControl(this.userInfo[item.key] ? this.userInfo[item.key] : "", validatorArray));
        if (item.type == "boolean" && item.defaultValue == "") {
          this.editCustomerForm.controls[item.key].setValue(this.userInfo[item.key]);
        }
      });
      console.log("control==>", this.editCustomerForm.controls);
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

  saveData() {
    let customerObj = this.editCustomerForm.value;
    // customerObj = this.fetchTheIdsOfLabels(customerObj);
    customerObj["updatedBy"] = this._cacheService.agent.username;
    console.log("customerObj ", customerObj);
    this._httpService.updateCustomerById(this.data.id, customerObj).subscribe(
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
    // this.editTab = !this.editTab;
    // if (this.editTab) {
    this.schemaAttributes.filter((e) => {
      this.editCustomerForm.get(e.key).enable();
    });
    // } else {
    // this.schemaAttributes.filter((e) => {
    // this.editCustomerForm.get(e.key).disable();
    // });
    // }
  }

  // checkType(label) {
  //   if (label == "Label12") {
  //     return "textarea";
  //   } else {
  //     return "text";
  //   }
  // }

  gotoInteractions() {
    this.onNoClick();
    let obj = { base: "interactions", id: this.userInfo._id };
    sessionStorage.setItem("url", JSON.stringify(obj));
    this._router.navigate(["interactions", this.userInfo._id]);
  }

  deleteCustomer() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: "490px",
      panelClass: "confirm-dialog",
      data: { header: "delete customer", message: `Are you sure you want to delete?` }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.event == "confirm") {
        this._httpService.deleteCustomerById(this.data.id).subscribe(
          (e) => {
            this._sharedService.Interceptor("deleted!", "succ");
            this.dialogRef.close({ event: "delete" });
          },
          (error) => {
            this._sharedService.Interceptor(error, "err");
          }
        );
      }
    });
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
    let a = this.editCustomerForm.controls;
    for (let key in a) {
      this.editCustomerForm.get(key).markAsTouched();
    }
    console.log("validate form", this.editCustomerForm);
  }

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
