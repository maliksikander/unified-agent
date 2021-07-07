import { Component, OnInit } from '@angular/core';
import { moveItemInArray, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatSnackBar, MatDialog } from '@angular/material';
import { httpService } from 'src/app/services/http.service';
import { CreateAttributeComponent } from '../create-attribute/create-attribute.component';
import { EditAttributeComponent } from '../edit-attribute/edit-attribute.component';
// import {CreateAttributeComponent} from '../create-attribute/create-attribute.component';
// import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-schema-settings',
  templateUrl: './schema-settings.component.html',
  styleUrls: ['./schema-settings.component.scss']
})
export class SchemaSettingsComponent implements OnInit {

  schema1;
  schema2;
  showDetails: boolean = false;
  divId;

  constructor(private _httpService: httpService, private dialog: MatDialog, public snackBar: MatSnackBar) {

    this.loadSchemas();
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
    this._httpService.getCustomerSchema().subscribe((e) => {


      this.schema1 = e.data.sort((a, b) => { return a.sort_order - b.sort_order });
      let n = (this.schema1.length) / 2;

      this.schema2 = this.schema1.splice(0, n);

    });
  }


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

    console.log(finalSchema)
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

  delete(a, b) {

  }

  edit(attribute) {
    console.log("attr ", attribute);
    const dialogRef = this.dialog.open(EditAttributeComponent, {
      width: '815px',
      height: '325px',
      data: {
        attribute
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event == 'refresh') {
        this.loadSchemas();
      }
    });
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
      alert("not allowed")
    }

    if (tag == 'desc') {
      alert("not allowed")
    }

  }

  // delete(e, id) {
  //   const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
  //     width: '490px',
  //     panelClass: 'confirm-dialog',
  //     data: { header: 'delete Attribute', message: 'Are you sure you want to delete "'  + e + '" Attribute?'  }

  //   });
  //   dialogRef.afterClosed().subscribe(result => {

  //   });
  // }

  openSnackBar(msg) {
    // this.snackBar.openFromComponent(SnackbarMsgsComponent, {
    //   data: msg,
    //   duration: 4500,
    //   verticalPosition:'top'
    // });
  }

  displayMenu(e) {
    e.stopPropagation();
  }
  addAttr() {
    const dialogRef = this.dialog.open(CreateAttributeComponent, {
      width: '815px',
      height: '325px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event == 'refresh') {
        this.loadSchemas();
      }
    });
  }

}
