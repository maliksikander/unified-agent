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
        // this.checkedColumns = arr;
        // console.log("checked columns==>", res);
      }
    });
  }

  checkForSchemaConsistency(savedPref: Array<any>) {
    // console.log("saved array==>", savedPref);
    // console.log("schema ==>", this.columns);
    let array1: Array<any> = [];
    let array2: Array<any> = [];
    let finalArray: Array<any> = [];

    let schemaLength = this.columns.length;
    let savedPrefLength = savedPref.length;

    if (schemaLength > savedPrefLength) {
      array1 = this.columns;
      array2 = savedPref;
    } else {
      array1 = savedPref;
      array2 = this.columns;
    }

    array1.forEach((item1) => {
      array2.forEach((item2) => {
        if (schemaLength > savedPrefLength) {
          if (item1.key == item2.field) {
            finalArray.push(item2);
          }
        } else {
          if (item2.key == item1.field) {
            finalArray.push(item1);
          }
        }
      });
    });
    this.checkedColumns = finalArray;
    // console.log("final ==>", finalArray);
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
      // console.log("check==>", prefObj);
      this.createPeference(prefObj);
    }
  }

  createPeference(obj) {
    this._httpService.changeUserPreference(obj).subscribe(
      (e) => {
        this.dialogRef.close({ event: "refresh" });
        this._sharedService.Interceptor("Preference Updated!", "succ");
      },
      (error) => {
        this._sharedService.Interceptor(error, "err");
      }
    );
  }

  loadChecked(value) {
    // console.log("Value==>",value)
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
