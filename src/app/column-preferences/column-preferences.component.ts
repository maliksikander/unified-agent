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
  columns = [];
  checkedColumns = [];
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
    this._httpService.getCustomerSchema().subscribe((ea) => {
      delete ea.labels;
      this.columns = ea.data.sort((a, b) => {
        return a.sort_order - b.sort_order;
      });
      this._httpService.getUserPreference(this._cacheService.agent.id).subscribe((e) => {
        if (e.data.docs[0].columns != null) {
          let arr = e.data.docs[0].columns;
          let index = arr.findIndex((r) => r.type == "label");
          if (index != -1) {
            arr.splice(index, 1);
          }
          this.checkedColumns = arr;
        }
      });
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
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
      this._httpService.changeUserPreference(prefObj).subscribe(
        (e) => {
          this.dialogRef.close({ event: "refresh" });
          this._sharedService.Interceptor("Preference Updated!", "succ");
        },
        (error) => {
          this._sharedService.Interceptor(error, "err");
        }
      );
    }
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
