import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, DateAdapter } from "@angular/material";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { DateTimeAdapter } from "ng-pick-datetime";

@Component({
  selector: "app-create-customer",
  templateUrl: "./create-customer.component.html",
  styleUrls: ["./create-customer.component.scss"]
})
export class CreateCustomerComponent implements OnInit {
  constructor(
    private dateTimeAdapter: DateTimeAdapter<any>,
    private dateAdapter: DateAdapter<any>,
    private _router: Router,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CreateCustomerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    dialogRef.disableClose = true;
  }

  schemaAttributes = [
    {
      characters: 50,
      is_required: true,
      is_deletable: false,
      _id: "60631199fd3f6f3f18be445f",
      label: "First Name",
      type: "string",
      sort_order: 1,
      key: "first_name",
      desc: ""
    },
    {
      characters: 50,
      is_required: false,
      is_deletable: false,
      _id: "60631199fd3f6f3f18be4460",
      label: "Last Name",
      type: "string",
      sort_order: 2,
      key: "last_name",
      desc: ""
    },
    {
      is_required: false,
      is_deletable: false,
      _id: "6063119afd3f6f3f18be4462",
      label: "Email",
      type: "email",
      sort_order: 3,
      key: "email",
      desc: ""
    },
    {
      is_required: true,
      is_deletable: false,
      _id: "6063119afd3f6f3f18be4464",
      label: "Phone1",
      type: "phone",
      sort_order: 4,
      key: "phone1",
      desc: ""
    },
    {
      is_required: false,
      is_deletable: false,
      _id: "6063119afd3f6f3f18be4465",
      label: "Phone2",
      type: "phone",
      sort_order: 5,
      key: "phone2",
      desc: ""
    },
    {
      is_required: false,
      is_deletable: false,
      _id: "6063119afd3f6f3f18be4466",
      label: "Phone3",
      type: "phone",
      sort_order: 6,
      key: "phone3",
      desc: ""
    },
    {
      is_required: false,
      is_deletable: false,
      _id: "6063119afd3f6f3f18be4467",
      label: "Phone4",
      type: "phone",
      sort_order: 7,
      key: "phone4",
      desc: ""
    },
    {
      is_required: false,
      is_deletable: false,
      _id: "6063119afd3f6f3f18be4468",
      label: "Phone5",
      type: "phone",
      sort_order: 8,
      key: "phone5",
      desc: ""
    },
    {
      is_required: false,
      is_deletable: false,
      _id: "6063119afd3f6f3f18be4469",
      label: "Created By",
      type: "string",
      sort_order: 9,
      key: "created_by",
      desc: ""
    },
    {
      is_required: false,
      is_deletable: false,
      _id: "6063119afd3f6f3f18be446a",
      label: "Updated By",
      type: "string",
      sort_order: 10,
      key: "updated_by",
      desc: ""
    },
    {
      characters: 100,
      is_required: false,
      is_deletable: false,
      _id: "6063119afd3f6f3f18be446b",
      label: "Labels",
      type: "label",
      sort_order: 9,
      key: "labels",
      desc: ""
    }
  ];

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

    this.schemaAttributes = this.schemaAttributes.sort((a, b) => {
      return a.sort_order - b.sort_order;
    });
    let urlReg = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

    this.schemaAttributes.filter((a) => {
      formGroup[a.key] = new FormControl("", [
        a.is_required ? Validators.required : Validators.maxLength(2083),
        a.characters ? Validators.maxLength(a.characters) : Validators.maxLength(2083),
        a.type == "email" ? Validators.email : Validators.maxLength(2083),
        a.type == "phone" ? Validators.pattern("^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$") : Validators.maxLength(2083),
        a.type == "phone" ? Validators.maxLength(20) : Validators.maxLength(2083),
        a.type == "url" ? Validators.pattern(urlReg) : Validators.maxLength(2083)
      ]);
    });

    this.myGroup = new FormGroup(formGroup);
    this.dataReady = true;
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
}
