import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatAutocompleteSelectedEvent} from '@angular/material';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-wrap-up-form',
  templateUrl: './wrap-up-form.component.html',
  styleUrls: ['./wrap-up-form.component.scss']
})
export class WrapUpFormComponent implements OnInit {
  wrapupLabels:any = [];
  categoriesList: any = [];

  separatorKeysCodes: number[] = [ENTER, COMMA];
  wrapCtrl = new FormControl();
  filteredWrapUp: Observable<string[]>;
  @ViewChild('wrapUpInput', null) wrapUpInput: ElementRef<HTMLInputElement>;
  selectable = true;
  removable = true;
  allWrapUps: string[] = ['Payments', 'Late Payment', 'Payment Details', 'Payment Due Date', 'Last payment', 'services1', 'services2', 'services3', 'services4', 'services5', 'services5', 'services6'];
  inputWrapup = '';
  notes: any = [
    {
      'categoryName': 'payments',
      'wrapups': [
        'Payments', 'Late Payment', 'Payment Details', 'Payment Due Date', 'Last payment'
      ]
    },
    {
      'categoryName': 'services',
      'wrapups': [
        'services1', 'services2', 'services3', 'services4', 'services5', 'services5', 'services6'
      ]
    }
  ];
  wrapUpData;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.filteredWrapUp = this.wrapCtrl.valueChanges.pipe(
      startWith(null),
      map((wrapCode: string | null) => wrapCode ? this._filter(wrapCode) : this.allWrapUps.slice()));
  }

  ngOnInit() {
    this.wrapUpData = this.data;
  }


  selectWrapupCategories(e: any, isChecked: boolean) {
    if (isChecked) {
      this.categoriesList.push(e);
    } else {
      const index = this.categoriesList.indexOf(e);
      this.categoriesList.splice(index, 1);
    }
    console.log(this.categoriesList, 'categoriesList')
  }
  removeWrapupCategories(e: any, isChecked: boolean) {
    const index = this.categoriesList.indexOf(e);
    this.categoriesList.splice(index, 1);
    this.wrapupLabels.splice(index);

  }


  removeWrapupLabels(e: any, isChecked: boolean) {

    const index = this.wrapupLabels.indexOf(e);
    this.wrapupLabels.splice(index, 1);
  }





//

  add(event: any): void {
    const value = (event.value || '').trim();
    // Add our wrapCode
    if (value) {
      if (this.allWrapUps.indexOf(value) !== -1) {
        const index = this.wrapupLabels.indexOf(value);
        if (index === -1) {
          this.wrapupLabels.push(value);
        }
        if (this.wrapupLabels.length === 0) {
          this.wrapupLabels.push(value);
        }
      }
    }

    // Clear the input value
    this.wrapUpInput.nativeElement.value = '';
    this.wrapCtrl.setValue(null);
  }

  remove(wrapCode: string): void {
    const index = this.wrapupLabels.indexOf(wrapCode);
    if (index >= 0) {
      this.wrapupLabels.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const index = this.wrapupLabels.indexOf(event.option.viewValue);
    if (index === -1) {
      this.wrapupLabels.push(event.option.viewValue);
    }
    if (this.wrapupLabels.length === 0) {
      this.wrapupLabels.push(event.option.viewValue);
    }

    this.wrapUpInput.nativeElement.value = '';
    this.wrapCtrl.setValue(null);
  }
  selectWrapup(e: any, isChecked: boolean) {
    const index = this.wrapupLabels.indexOf(e);
    if (index === -1) this.wrapupLabels.push(e);
    if (this.wrapupLabels.length === 0) {
      this.wrapupLabels.push(e);
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allWrapUps.filter(wrapCode => wrapCode.toLowerCase().includes(filterValue));
  }

}
