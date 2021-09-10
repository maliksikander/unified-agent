import { Component, OnInit } from '@angular/core';
import { moveItemInArray, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatSnackBar, MatDialog } from '@angular/material';
import {CreateAttributeComponent} from '../create-attribute/create-attribute.component';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-schema-settings',
  templateUrl: './schema-settings.component.html',
  styleUrls: ['./schema-settings.component.scss']
})
export class SchemaSettingsComponent implements OnInit {

  schema1 = [{
    "characters": 50,
    "is_required": true,
    "is_deletable": false,
    "_id": "60631199fd3f6f3f18be445f",
    "label": "First Name",
    "type": "string",
    "sort_order": 1,
    "key": "first_name",
    "desc": ""
  }, {
    "characters": 50,
    "is_required": false,
    "is_deletable": false,
    "_id": "60631199fd3f6f3f18be4460",
    "label": "Last Name",
    "type": "string",
    "sort_order": 2,
    "key": "last_name",
    "desc": ""
  }, {
    "is_required": false,
    "is_deletable": false,
    "_id": "6063119afd3f6f3f18be4462",
    "label": "Email",
    "type": "email",
    "sort_order": 3,
    "key": "email",
    "desc": ""
  }, {
    "is_required": true,
    "is_deletable": false,
    "_id": "6063119afd3f6f3f18be4464",
    "label": "Phone1",
    "type": "phone",
    "sort_order": 4,
    "key": "phone1",
    "desc": ""
  }, {
    "is_required": false,
    "is_deletable": false,
    "_id": "6063119afd3f6f3f18be4465",
    "label": "Phone2",
    "type": "phone",
    "sort_order": 5,
    "key": "phone2",
    "desc": ""
  }, {
    "is_required": false,
    "is_deletable": false,
    "_id": "6063119afd3f6f3f18be4466",
    "label": "Phone3",
    "type": "phone",
    "sort_order": 6,
    "key": "phone3",
    "desc": ""
  }, {
    "is_required": false,
    "is_deletable": false,
    "_id": "6063119afd3f6f3f18be4467",
    "label": "Phone4",
    "type": "phone",
    "sort_order": 7,
    "key": "phone4",
    "desc": ""
  }, {
    "is_required": false,
    "is_deletable": false,
    "_id": "6063119afd3f6f3f18be4468",
    "label": "Phone5",
    "type": "phone",
    "sort_order": 8,
    "key": "phone5",
    "desc": ""
  }, {
    "is_required": false,
    "is_deletable": false,
    "_id": "6063119afd3f6f3f18be4469",
    "label": "Created By",
    "type": "string",
    "sort_order": 9,
    "key": "created_by",
    "desc": ""
  }, {
    "is_required": false,
    "is_deletable": false,
    "_id": "6063119afd3f6f3f18be446a",
    "label": "Updated By",
    "type": "string",
    "sort_order": 10,
    "key": "updated_by",
    "desc": ""
  }, {
    "characters": 100,
    "is_required": false,
    "is_deletable": false,
    "_id": "6063119afd3f6f3f18be446b",
    "label": "Labels",
    "type": "label",
    "sort_order": 9,
    "key": "labels",
    "desc": ""
  }, {
    "characters": 500,
    "createdAt": "2021-03-30T13:31:04.058Z",
    "is_required": false,
    "__v": 0,
    "_id": "606328189b537204d8f57e0e",
    "label": "Lenghty",
    "type": "string",
    "sort_order": 11,
    "key": "lenghty",
    "desc": "",
    "updatedAt": "2021-03-30T13:31:04.058Z"
  }, {
    "characters": 114,
    "createdAt": "2021-03-30T13:32:38.141Z",
    "is_required": false,
    "__v": 0,
    "_id": "606328769b5372789ef57e0f",
    "label": "new textarea",
    "type": "string",
    "sort_order": 12,
    "key": "new_textarea",
    "desc": "",
    "updatedAt": "2021-03-30T13:33:18.352Z"
  }, {
    "characters": 2083,
    "createdAt": "2021-03-30T13:34:18.225Z",
    "is_required": false,
    "__v": 0,
    "_id": "606328da9b5372dbd9f57e11",
    "label": "url",
    "type": "url",
    "sort_order": 13,
    "key": "url",
    "desc": "",
    "updatedAt": "2021-03-30T13:34:18.225Z"
  }, {
    "characters": null,
    "createdAt": "2021-03-30T13:40:53.576Z",
    "is_required": false,
    "__v": 0,
    "_id": "60632a659b5372307ff57e12",
    "label": "date",
    "type": "date",
    "sort_order": 14,
    "key": "date",
    "desc": "",
    "updatedAt": "2021-03-30T13:40:53.576Z"
  }, {
    "characters": null,
    "createdAt": "2021-03-30T13:41:07.466Z",
    "is_required": false,
    "__v": 0,
    "_id": "60632a739b53727ae1f57e13",
    "label": "time",
    "type": "time",
    "sort_order": 15,
    "key": "time",
    "desc": "",
    "updatedAt": "2021-03-30T13:41:07.466Z"
  }, {
    "characters": null,
    "createdAt": "2021-03-30T13:41:18.511Z",
    "is_required": false,
    "__v": 0,
    "_id": "60632a7e9b5372f323f57e14",
    "label": "date time",
    "type": "date_time",
    "sort_order": 16,
    "key": "date_time",
    "desc": "",
    "updatedAt": "2021-03-30T13:41:18.511Z"
  }];
  schema2;
  showDetails: boolean = false;
  divId;
  editableSelectOptions = [{ value: true, text: 'true' },
  { value: false, text: 'false' },];

  constructor(private dialog: MatDialog, public snackBar: MatSnackBar) {

    // this._callService.readConfig().subscribe((a) => {
     // this._callService.baseUrl = location.origin + "/umm";
      // this._callService.baseUrl = a.GAT_URL;
      this.loadSchemas();
    // });
  }

  ngOnInit() {
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  loadSchemas() {
    // this._callService.getContactSchema().subscribe((e) => {


      this.schema1 = this.schema1.sort((a, b) => { return a.sort_order - b.sort_order });
      let n = (this.schema1.length) / 2;

      this.schema2 = this.schema1.splice(0, n);

    // });
  }

  // loadSchemas() {
  //   // this._callService.getContactSchema().subscribe((e) => {
  //   //
  //   this.schema2 = this.schema1;
  //
  //     // this.schema1 = null;
  //     // this.schema2 = null;
  //     // this.schema1 = this.schema2.sort((a, b) => { return a.sort_order - b.sort_order });
  //     let n = (this.schema1.length) / 2;
  //   //
  //      this.schema1.splice(0, n);
  //   //
  //   // });
  // }

  onClick() {

    let finalSchema = [];
    let i = 1;

    this.schema2.filter((e) => {
      finalSchema.push(e);
    })

    this.schema1.filter((e) => {
      finalSchema.push(e);
    })

    finalSchema.filter((e) => {
      e['sort_order'] = i++;
    });

    // this._callService.updateOrderOfAttrs(finalSchema).subscribe((e) => {
    //
    //   if(e.message = "SORT_ORDER_UPDATED_SUCCESSFULLY"){
    //     this._callService.Interceptor("SORT_ORDER_UPDATED_SUCCESSFULLY",'succ');
    //   }
    //
    //   },
    //     (error) => { this._callService.Interceptor(error,'err')
    // });


  }



  openDetails(id) {
    this.showDetails = !this.showDetails;
    this.divId = id;
  }

  saveEditable(event, id, schema) {

    let obj;

    if (schema == 'schema1') {
      obj = this.schema1.find((e) => { return e._id == id });
    }
    if (schema == 'schema2') {
      obj = this.schema2.find((e) => { return e._id == id });
    }

    // this._callService.updateAttribute(id, obj).subscribe((e) => {
    //   this._callService.Interceptor("updated",'succ');
    // }, (error) => { this._callService.Interceptor(error,'err') })

  }

  myHandleError(event, tag) {
    if (tag == 'char') {
      // this.openSnackBar(this._callService.translationsObj.CHAR)
    }

    if (tag == 'desc') {
      // this.openSnackBar(this._callService.translationsObj.DESC)
    }

  }

  delete(e, id) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '490px',
      panelClass: 'confirm-dialog',
      data: { header: 'delete Attribute', message: 'Are you sure you want to delete "'  + e + '" Attribute?'  }

    });
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  openSnackBar(msg) {
    // this.snackBar.openFromComponent(SnackbarMsgsComponent, {
    //   data: msg,
    //   duration: 4500,
    //   verticalPosition:'top'
    // });
  }

  displayMenu(e){
    e.stopPropagation();
  }
  addAttr() {
    const dialogRef = this.dialog.open(CreateAttributeComponent, {
      width: '815px',
      minHeight: '225px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event == 'refresh') {
        this.loadSchemas();
      }
    });
  }

}
