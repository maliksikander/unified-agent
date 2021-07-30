import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, DateAdapter } from "@angular/material";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { httpService } from "../services/http.service";
import { cacheService } from "../services/cache.service";
import { sharedService } from "../services/shared.service";

@Component({
  selector: "app-create-customer",
  templateUrl: "./create-customer.component.html",
  styleUrls: ["./create-customer.component.scss"]
})
export class CreateCustomerComponent implements OnInit {
  constructor(
    private dateAdapter: DateAdapter<any>,
    private _router: Router,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CreateCustomerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private _httpService: httpService,
    private _cacheService: cacheService,
    private _sharedService: sharedService
  ) {
    dialogRef.disableClose = true;
    this.dateAdapter.setLocale("en-GB");
  }

  schemaAttributes;

  fieldArray = [];
  dataReady: boolean = false;
  myGroup: FormGroup;
  nos;
  customerLabels = [];
  labels = [
    {
      createdAt: "2021-03-30T12:09:52.497Z",
      __v: 0,
      name: "dummy",
      updated_by: "",
      _id: "606315109b5372a7aaf57e04",
      created_by: "admin",
      color_code: "#3cb44b",
      updatedAt: "2021-03-30T12:09:52.497Z"
    },
    {
      createdAt: "2021-03-30T12:11:20.124Z",
      __v: 0,
      name: "assasian",
      updated_by: "admin",
      _id: "606315689b53723ed3f57e06",
      created_by: "admin",
      color_code: "#a9a9a9",
      updatedAt: "2021-03-30T12:12:05.258Z"
    }
  ];
  labelSettings = {
    singleSelection: false,
    text: "",
    filterSelectAllText: "Select all",
    filterUnSelectAllText: "Unselect all",
    searchPlaceholderText: "Search",
    selectAllText: "Select all",
    unSelectAllText: "Unselect all",
    noDataLabel: "No Data",
    enableSearchFilter: true,
    addNewItemOnFilter: true,
    primaryKey: "_id"
  };

  ngOnInit() {
    const formGroup = {};

    this.myGroup = new FormGroup({});

    this._httpService.getCustomerSchema().subscribe((e) => {
      this.schemaAttributes = e.data.sort((a, b) => {
        return a.sort_order - b.sort_order;
      });
      let urlReg = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
      // this._callService.getLabels().subscribe((e) => {
      //   this.labels = e;
      // })

      let indexOfCreatedBy = this.schemaAttributes.findIndex((e) => {
        return e.key === "createdBy";
      });
      this.schemaAttributes.splice(indexOfCreatedBy, 1);

      let indexOfUpdatedBy = this.schemaAttributes.findIndex((e) => {
        return e.key === "updatedBy";
      });
      this.schemaAttributes.splice(indexOfUpdatedBy, 1);

      this.schemaAttributes.filter((a) => {
        formGroup[a.key] = new FormControl(a.type == "bool" ? false : "", [
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

      this.dataReady = true;
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  // validateForm() {
  //   let a = this.myGroup.controls;
  //   for (let key in a) {
  //     this.myGroup.get(key).markAsTouched();
  //   }
  // }

  // saveData(customerObj) {
  //   console.log("i am called");
  //
  //   customerObj = this.fetchTheIdsOfLabels(customerObj);
  //
  //
  //
  //   this._callService.createCustomer(customerObj).subscribe((e) => {
  //
  //     this.dialogRef.close({ event: 'refresh' });
  //
  //     if (this._callService.callActive == true) {
  //       this._callService.callCustomerName = e.first_name + " " + e.last_name;
  //       this._callService.callCustomerId = e._id;
  //       this._router.navigate(['interactions', e._id])
  //     }
  //
  //     this._callService.Interceptor("Customer-Created", 'succ');
  //
  //   }, (error) => {
  //     this._callService.Interceptor(error, 'err');
  //   });
  // }

  fetchTheIdsOfLabels(obj) {
    let ids = [];
    obj.labels.filter((e) => {
      ids.push(e._id);
    });
    obj.labels = ids;
    return obj;
  }

  onAddItem(data) {
    //
    //   this._callService.getLabels().subscribe((e) => {
    //     let duplicate : boolean = false;
    //     e.find((label) => {
    //       if (label.name == data) {
    //         duplicate = true;
    //       }
    //     });
    //
    //     if (duplicate) {
    //       this._callService.openSnackBar(this._callService.translationsObj.ALRDY, 'red-snack');
    //     }
    //     else if (data.length > 100) {
    //       this._callService.openSnackBar(this._callService.translationsObj.LBLS.MAX_LEN, 'red-snack');
    //     }
    //     else {
    //       let obj = {
    //         "name": data,
    //         "created_by": this._callService.userDetails.username,
    //         "color_code": '#a9a9a9',
    //       }
    //       this._callService.createLabel(obj).subscribe((e) => {
    //         this.customerLabels.push(e);
    //       }, (error) => {
    //         this._callService.Interceptor(error, 'err');
    //       });
    //     }
    //   });
  }

  save(a) {}
  onItemSelect(item: any) {}
  OnItemDeSelect(item: any) {}
  onSelectAll(items: any) {}
  onDeSelectAll(items: any) {}

  validateForm() {
    let a = this.myGroup.controls;
    for (let key in a) {
      this.myGroup.get(key).markAsTouched();
    }
    console.log(this.myGroup);
  }

  saveData(customerObj) {
    customerObj["createdBy"] = this._cacheService.agent.username;
    customerObj["updatedBy"] = "";
    console.log(customerObj);

    this._httpService.createCustomer(customerObj).subscribe(
      (e) => {
        this.dialogRef.close({ event: "refresh" });
        this._sharedService.Interceptor("Customer added!", "succ");
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }
}
