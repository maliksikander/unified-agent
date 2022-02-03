import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from "@angular/material";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { httpService } from "../services/http.service";
import { cacheService } from "../services/cache.service";
import { sharedService } from "../services/shared.service";

@Component({
  selector: "app-phonebook",
  templateUrl: "./column-preferences.component.html",
  styleUrls: ["./column-preferences.component.scss"]
})
export class columnPreferences implements OnInit {
  columns: Array<any> = [];
  checkedColumns: Array<any> = [];
  searchItem;
  editObj;

  constructor(
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<columnPreferences>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _httpService: httpService,
    private _cacheService: cacheService,
    private _sharedService: sharedService
  ) {}

  ngOnInit() {
    this.getCustomerSchema();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getCustomerSchema() {
    this._httpService.getCustomerSchema().subscribe((res) => {
      let temp = res.filter((item) => item.key != "isAnonymous");

      this.columns = temp.sort((a, b) => {
        return a.sortOrder - b.sortOrder;
      });

      this.getUserPreference();
    });
  }

  getUserPreference() {
    this._httpService.getUserPreference(this._cacheService.agent.id).subscribe((res) => {
      if (res.docs.length > 0 && res.docs[0].columns != null) {
        let arr = res.docs[0].columns;
        this.checkForSchemaConsistency(arr);
        this.editObj = res.docs[0];
        // this.checkedColumns = arr;
      }
      // else{

      // }
    });
  }

  checkForSchemaConsistency(savedPref: Array<any>) {
    let prefArray: Array<any> = savedPref;
    let finalArray: Array<any> = [];
    prefArray.forEach((item) => {
      let temp = this.columns.findIndex((item1) => item1.key == item.field);
      if (temp != -1) finalArray.push(item);
    });
    this.checkedColumns = finalArray;
  }

  onChange(event, item) {
    if (event.checked == true) {
      this.checkedColumns.push({ field: item.key, header: item.label, type: item.type });
    }
    if (event.checked == false) {
      const index = this.checkedColumns.findIndex((e) => e.field == item.key);
      if (index !== undefined) this.checkedColumns.splice(index, 1);
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.checkedColumns, event.previousIndex, event.currentIndex);
  }

  save() {
    if (this.checkedColumns.length == 0) {
      this._sharedService.Interceptor("No settings are valid", "succ");
    } else {
      let prefObj = {
        user_Id: this._cacheService.agent.id,
        pageSize: null,
        columns: this.checkedColumns,
        sortOption: [
          {
            field: "",
            sortOption: ""
          }
        ]
      };
      this.addPreference(prefObj);
    }
  }

  addPreference(obj) {
    if (this.editObj) {
      this.editPreference(obj, this.editObj._id);
    } else {
      this.createPreference(obj);
    }
  }

  createPreference(obj) {
    this._httpService.createUserPreference(obj).subscribe(
      (e) => {
        this.dialogRef.close({ event: "refresh" });
        this._sharedService.Interceptor("Preference Added", "succ");
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  editPreference(obj, id) {
    this._httpService.updateUserPreference(obj, id).subscribe(
      (e) => {
        this.dialogRef.close({ event: "refresh" });
        this._sharedService.Interceptor("Preference Updated!", "succ");
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  loadChecked(value) {
    if (this.checkedColumns) {
      let x: boolean;
      this.checkedColumns.filter((e) => {
        if (e.field == value) {
          x = true;
        }
      });
      if (x) {
        return true;
      }
    } else {
      return false;
    }
  }
}
