import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-column-preferences',
  templateUrl: './column-preferences.component.html',
  styleUrls: ['./column-preferences.component.scss']
})
export class ColumnPreferencesComponent implements OnInit {

  checkedColumns = [];
  searchItem;
  columns = [
    {
      "characters": 50,
      "is_required": true,
      "is_deletable": false,
      "_id": "60631199fd3f6f3f18be445f",
      "label": "First Name",
      "type": "string",
      "sort_order": 1,
      "key": "first_name",
      "desc": ""
    },
    {
      "characters": 50,
      "is_required": false,
      "is_deletable": false,
      "_id": "60631199fd3f6f3f18be4460",
      "label": "Last Name",
      "type": "string",
      "sort_order": 2,
      "key": "last_name",
      "desc": ""
    },
    {
      "is_required": false,
      "is_deletable": false,
      "_id": "6063119afd3f6f3f18be4462",
      "label": "Email",
      "type": "email",
      "sort_order": 3,
      "key": "email",
      "desc": ""
    },
    {
      "is_required": true,
      "is_deletable": false,
      "_id": "6063119afd3f6f3f18be4464",
      "label": "Phone1",
      "type": "phone",
      "sort_order": 4,
      "key": "phone1",
      "desc": ""
    },
    {
      "is_required": false,
      "is_deletable": false,
      "_id": "6063119afd3f6f3f18be4465",
      "label": "Phone2",
      "type": "phone",
      "sort_order": 5,
      "key": "phone2",
      "desc": ""
    },
    {
      "is_required": false,
      "is_deletable": false,
      "_id": "6063119afd3f6f3f18be4466",
      "label": "Phone3",
      "type": "phone",
      "sort_order": 6,
      "key": "phone3",
      "desc": ""
    },
    {
      "is_required": false,
      "is_deletable": false,
      "_id": "6063119afd3f6f3f18be4467",
      "label": "Phone4",
      "type": "phone",
      "sort_order": 7,
      "key": "phone4",
      "desc": ""
    },
    {
      "is_required": false,
      "is_deletable": false,
      "_id": "6063119afd3f6f3f18be4468",
      "label": "Phone5",
      "type": "phone",
      "sort_order": 8,
      "key": "phone5",
      "desc": ""
    },
    {
      "is_required": false,
      "is_deletable": false,
      "_id": "6063119afd3f6f3f18be4469",
      "label": "Created By",
      "type": "string",
      "sort_order": 9,
      "key": "created_by",
      "desc": ""
    },
    {
      "is_required": false,
      "is_deletable": false,
      "_id": "6063119afd3f6f3f18be446a",
      "label": "Updated By",
      "type": "string",
      "sort_order": 10,
      "key": "updated_by",
      "desc": ""
    },
    {
      "characters": 100,
      "is_required": false,
      "is_deletable": false,
      "_id": "6063119afd3f6f3f18be446b",
      "label": "Labels",
      "type": "label",
      "sort_order": 9,
      "key": "labels",
      "desc": ""
    }
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ColumnPreferencesComponent>) { }

  ngOnInit() {
this.checkedColumns = this.columns;
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
      return false
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
