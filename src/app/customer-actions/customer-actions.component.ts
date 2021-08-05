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

  userInfo;
  schemaAttributes;
  myGroup: FormGroup;
  userIni: boolean = false;
  schemaIni: boolean = false;
  editTab: boolean = false;
  editActiveMode: boolean = true;
  selectedUserNumbers = [];
  phoneControl = new FormControl("", [Validators.required]);
  smsControl = new FormControl("", [Validators.required]);

  customerLabels = [];
  labels = [];
  labelSettings = {
    singleSelection: false,
    text: "",
    filterSelectAllText: "Select All",
    filterUnSelectAllText: "Unselect All",
    searchPlaceholderText: "Search",
    selectAllText: "Select All",
    unSelectAllText: "Unselect All",
    noDataLabel: "No Data available",
    enableSearchFilter: true,
    addNewItemOnFilter: true,
    primaryKey: "_id"
  };

  ngOnInit() {
    const formGroup = {};

    this.myGroup = new FormGroup({});

    let query = { field: "_id", value: this.data.id };

    this._httpService.getCustomerById(this.data.id).subscribe((e) => {
      console.log("userid ", e);
      this.userInfo = e.data;
      this.userIni = true;

      this._httpService.getCustomerSchema().subscribe((ee) => {
        this.schemaAttributes = ee.data.sort((a, b) => {
          return a.sort_order - b.sort_order;
        });

        this.schemaIni = true;
        let urlReg = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

        this._httpService.getLabels().subscribe((e) => {
          this.labels = e.data;
          this.fetchCustomerLabels();
        });

        this.schemaAttributes.filter((a) => {
          formGroup[a.key] = new FormControl({ value: this.userInfo[a.key], disabled: true }, [
            a.is_required ? Validators.required : Validators.maxLength(2083),
            a.characters ? Validators.maxLength(a.characters) : Validators.maxLength(2083),
            a.type == "email" ? Validators.email : Validators.maxLength(2083),
            a.type == "phone" ? Validators.pattern("^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$") : Validators.maxLength(2083),
            a.type == "number" ? Validators.pattern("^[0-9]*$") : Validators.maxLength(2083),
            a.type == "alphanumeric" ? Validators.pattern("^[a-zA-Z0-9- _]*$") : Validators.maxLength(2083),
            a.type == "alphanumeric_special_character"
              ? Validators.pattern("^[a-zA-Z0-9,  _ @ . : = * % ; $ # ! + / & -]*$")
              : Validators.maxLength(2083),
            a.type == "decimal" ? Validators.pattern("^[+-]?([0-9]+.?[0-9]*|.[0-9]+)$") : Validators.maxLength(2083),
            a.type == "url" ? Validators.pattern(urlReg) : Validators.maxLength(2083)
          ]);
        });

        this.myGroup = new FormGroup(formGroup);

        if (this.data.tab == null) {
          this.editTab = true;
        } else {
          if (this.data.tab == "edit") {
            this.editTab = true;
            this.editActiveMode = false;
            this.schemaAttributes.filter((e) => {
              //  if (e.key != "createdBy" && e.key != "updatedBy") {
              this.myGroup.get(e.key).enable();
              // }
            });
          }
        }
      });
    });
  }

  fetchCustomerLabels() {
    this.userInfo.labels.filter((id) => {
      this.labels.filter((label) => {
        if (label._id == id) {
          this.customerLabels.push(label);
        }
      });
    });

    this.myGroup.get("labels").patchValue(this.customerLabels);
  }

  saveData(customerObj) {
    customerObj = this.fetchTheIdsOfLabels(customerObj);
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

  fetchTheIdsOfLabels(obj) {
    let ids = [];
    if (obj.labels[0]) {
      obj.labels.filter((e) => {
        ids.push(e._id);
      });
    }
    obj.labels = ids;
    return obj;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  editClick() {
    this.editTab = true;
    this.editActiveMode = !this.editActiveMode;
    if (!this.editActiveMode) {
      this.schemaAttributes.filter((e) => {
        // if (e.key != "createdBy" && e.key != "updatedBy") {
        this.myGroup.get(e.key).enable();
        // }
      });
    }
    if (this.editActiveMode) {
      this.schemaAttributes.filter((e) => {
        this.myGroup.get(e.key).disable();
      });
    }
  }

  checkType(label) {
    if (label == "Label12") {
      return "textarea";
    } else {
      return "text";
    }
  }

  gotoInteractions() {
    this.onNoClick();
    let obj = { base: "interactions", id: this.userInfo._id };
    sessionStorage.setItem("url", JSON.stringify(obj));
    this._router.navigate(["interactions", this.userInfo._id]);
  }

  deleteCUstomer() {
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

  onAddItem(data) {
    this._httpService.getLabels().subscribe((e) => {
      let duplicate: boolean = false;
      e.data.find((label) => {
        if (label.name == data) {
          duplicate = true;
        }
      });
      if (duplicate) {
        this._sharedService.snackErrorMessage("Name already exists");
      } else if (data.length > 100) {
        this._sharedService.snackErrorMessage("Max length is 100");
      } else {
        let obj = {
          name: data,
          created_by: this._cacheService.agent.username,
          color_code: "#a9a9a9"
        };
        this._httpService.createLabel(obj).subscribe(
          (e) => {
            this._httpService.getLabels().subscribe((ee) => {
              this.labels = ee.data;
              this.customerLabels.push(e.data);
              this.myGroup.get("labels").patchValue(this.customerLabels);
              this._sharedService.serviceChangeMessage({ msg: "update-labels", data: null });
            });
          },
          (error) => {
            this._sharedService.Interceptor(error.error, "err");
          }
        );
      }
    });
  }

  validateForm() {
    let a = this.myGroup.controls;
    for (let key in a) {
      this.myGroup.get(key).markAsTouched();
    }
    console.log(this.myGroup);
  }

  save(a) {}
  onItemSelect(item: any) {}
  OnItemDeSelect(item: any) {}
  onSelectAll(items: any) {}
  onDeSelectAll(items: any) {}
}
