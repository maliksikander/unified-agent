import {Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import { MAT_DIALOG_DATA, MatAutocompleteSelectedEvent, MatDialogRef } from "@angular/material";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { httpService } from "src/app/services/http.service";
import { sharedService } from "src/app/services/shared.service";
import { snackbarService } from "src/app/services/snackbar.service";




@Component({
  selector: "app-wrap-up-form",
  templateUrl: "./wrap-up-form.component.html",
  styleUrls: ["./wrap-up-form.component.scss"]
})

export class WrapUpFormComponent implements OnInit {
  selectedWrapUpList: Array<any> = [];
  singleValueList = [];
  categoriesList: any = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  wrapCtrl = new FormControl();
  notesFormCtrl = new FormControl();
  filteredWrapUp: Observable<any[]>;
  @ViewChild("wrapUpInput", null) wrapUpInput: ElementRef<HTMLInputElement>;
  selectable = true;
  removable = true;
  inputWrapup = "";
  categoryList: any = [];

   // wrapUpData;
  categoryOptions;
  interval;
  @Input() wrapUpData: any;
  @Output() closeWrapDialog = new EventEmitter<any>();
  timeProgress: number;

  constructor(
    // @Inject(MAT_DIALOG_DATA) public data: any,
    private _httpService: httpService,
    private _sharedService: sharedService,
    private snackBar:snackbarService,
    // private dialogRef: MatDialogRef<WrapUpFormComponent>,
  ) {}

  ngOnInit() {
    this.getWrapUpForm();
    this.timeProgress=this.wrapUpData.wrapUpDialog.durationLeft;
  }

  // to remove selected wrap up from list
  remove(wrapCode: string): void {
    const index = this.selectedWrapUpList.indexOf(wrapCode);
    if (index >= 0) {
      this.selectedWrapUpList.splice(index, 1);
    }
  }

  onSelectionReset(event: MatAutocompleteSelectedEvent): void {
    this.wrapUpInput.nativeElement.value = "";
    this.wrapCtrl.setValue(null);
  }

  //to add wrap up to list
  selectWrapup(category, wrapup) {
    let obj = {
      categoryName: category,
      value: wrapup
    };
    if (this.selectedWrapUpList.length === 0) {
      this.selectedWrapUpList.push(obj);
    }

    const index = this.selectedWrapUpList.findIndex((item) => {
      return item.categoryName == category && item.value == wrapup;
    });

    if (this.categoryOptions.isMultipleChoice == true) {
      if (index === -1 && this.selectedWrapUpList.length < 5) this.selectedWrapUpList.push(obj);
    } else {
      if (index === -1 && this.selectedWrapUpList.length < 1) this.selectedWrapUpList.push(obj);
    }
  }

  //to filter wrap up codes
  private _filter(value): any[] {
    if (value) {
      if (typeof value == "string") {
        const filterValue = value.toLowerCase();
        const valueList: Array<any> = [];
        this.singleValueList.forEach((item) => {
          if (item.value.toLowerCase().includes(filterValue)) {
            valueList.push(item);
          }
        });

        return valueList;
      } else if (typeof value == "object") {
        this.selectWrapup(value.categoryName, value.value);
      }
    }
  }

  // to get attribute type list
  getWrapUpForm() {
    this._httpService.getWrapUpForm().subscribe(
      (res) => {
        this.categoryOptions = res.attributes[0].categoryOptions;
        this.categoryList = this.categoryOptions.categories;
        this.getCategoryValues();
        // this.startWrapUpTimer();
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  //to get filtered wrap up codes
  getCategoryValues() {
    this.convertCategoryListForSearch();
    this.filteredWrapUp = this.wrapCtrl.valueChanges.pipe(
      startWith(null),
      map((wrapCode: string | null) => (wrapCode ? this._filter(wrapCode) : this.singleValueList))
    );
  }

  //to convert category based wrap list array structure
  convertCategoryListForSearch() {
    let list: Array<any> = [];

    this.categoryList.forEach((item) => {
      let catValue: Array<any> = item.values;
      catValue.forEach((item2) => {
        let obj = {
          categoryName: item.categoryName,
          value: ""
        };
        obj.value = item2;
        list.push(obj);
      });
    });
    this.singleValueList = list;
  }

  closeDialog() {
    // this.dialogRef.close({ event: "close" });
    this.closeWrapDialog.emit(false);

  }

  onSave() {
    let data = {
      wrapups: this.selectedWrapUpList,
      note: this.notesFormCtrl.value ? this.notesFormCtrl.value : ""
    };
    // this.dialogRef.close({ event: "apply", data });
    this.closeWrapDialog.emit(data);
  }



// startWrapUpTimer() {
//   console.log("called");
//   this.interval = setInterval(() => {
//     if (this.timeLeft > 0) {
//       this.timeLeft--;

//     } else {
//       if (this.timeLeft == 0 && this.wrapUpData.isWrapUpTimer) {
//         this.closeDialog();


//         this.customerLeft('Wrap-up time for the conversation with ‘Jason Slayer’ has expired.', '');
//         this.stopTimer();
//       }
//       this.timeLeft = 0;
//     }
//   }, 1000);
// }

// stopTimer() {
//   if (this.interval) {
//     clearInterval(this.interval);
//   }
// }
customerLeft(message: string, action: string) {
  setTimeout(() => {
    this.snackBar.open( message, ' ', {
      duration: 8000,
      panelClass: 'chat-fail-snackbar',
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
  }, 1000);

}
}
