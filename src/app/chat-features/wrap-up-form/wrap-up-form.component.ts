import { Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatAutocompleteSelectedEvent } from "@angular/material";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { httpService } from "src/app/services/http.service";
import { sharedService } from "src/app/services/shared.service";
import { ThrowStmt } from "@angular/compiler";

@Component({
  selector: "app-wrap-up-form",
  templateUrl: "./wrap-up-form.component.html",
  styleUrls: ["./wrap-up-form.component.scss"]
})
export class WrapUpFormComponent implements OnInit {
  selectedWrapUpList: Array<any> = [];
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
  wrapUpData;
  categoryOptions;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private _httpService: httpService, private _sharedService: sharedService) {}

  ngOnInit() {
    this.wrapUpData = this.data;

    this.getWrapUpForm();
  }

  selectWrapupCategories(e: any, isChecked: boolean) {
    if (isChecked) {
      this.categoriesList.push(e);
    } else {
      const index = this.categoriesList.indexOf(e);
      this.categoriesList.splice(index, 1);
    }
    console.log(this.categoriesList, "categoriesList");
  }
  removeWrapupCategories(e: any, isChecked: boolean) {
    const index = this.categoriesList.indexOf(e);
    this.categoriesList.splice(index, 1);
    this.selectedWrapUpList.splice(index);
  }

  removeWrapupLabels(e: any, isChecked: boolean) {
    const index = this.selectedWrapUpList.indexOf(e);
    this.selectedWrapUpList.splice(index, 1);
  }

  //

  add(event: any): void {
    const value = (event.value || "").trim();
    // Add our wrapCode
    console.log("add event val==>", value);
    if (value) {
      // if (this.allWrapUps.indexOf(value) !== -1) {
      //   const index = this.wrapupLabels.indexOf(value);
      //   if (index === -1) {
      //     this.wrapupLabels.push(value);
      //   }
      //   if (this.wrapupLabels.length === 0) {
      //     this.wrapupLabels.push(value);
      //   }
      // }
    }

    // Clear the input value
    this.wrapUpInput.nativeElement.value = "";
    this.wrapCtrl.setValue(null);
  }

  remove(wrapCode: string): void {
    const index = this.selectedWrapUpList.indexOf(wrapCode);
    if (index >= 0) {
      this.selectedWrapUpList.splice(index, 1);
    }
  }

  onSelectionReset(event: MatAutocompleteSelectedEvent): void {
    // const index = this.selectedWrapUpList.indexOf(event.option.viewValue);
    // if (index === -1) {
    //   this.selectedWrapUpList.push(event.option.viewValue);
    // }
    // if (this.selectedWrapUpList.length === 0) {
    //   this.selectedWrapUpList.push(event.option.viewValue);
    // }

    this.wrapUpInput.nativeElement.value = "";
    this.wrapCtrl.setValue(null);
  }

  selectWrapup(category, wrapup) {
    let obj = {
      category,
      value: wrapup
    };
    if (this.selectedWrapUpList.length === 0) {
      this.selectedWrapUpList.push(obj);
    }

    const index = this.selectedWrapUpList.findIndex((item) => {
      return item.category == category && item.value == wrapup;
    });

    if (this.categoryOptions.isMultipleChoice == true) {
      if (index === -1 && this.selectedWrapUpList.length <= 5) this.selectedWrapUpList.push(obj);
    } else {
      if (index === -1 && this.selectedWrapUpList.length < 1) this.selectedWrapUpList.push(obj);
    }
  }

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
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  getCategoryValues() {
    this.convertCategoryListForSearch();
    this.filteredWrapUp = this.wrapCtrl.valueChanges.pipe(
      startWith(null),
      map((wrapCode: string | null) => (wrapCode ? this._filter(wrapCode) : this.singleValueList))
    );
  }

  singleValueList = [];
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

  onSave() {
    console.log("check-->", this.notesFormCtrl.value);
  }
}
