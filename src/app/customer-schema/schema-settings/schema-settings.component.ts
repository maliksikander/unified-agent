import { Component, OnInit } from "@angular/core";
import { moveItemInArray, CdkDragDrop, transferArrayItem } from "@angular/cdk/drag-drop";
import { MatSnackBar, MatDialog } from "@angular/material";
import { httpService } from "src/app/services/http.service";
import { CreateAttributeComponent } from "../create-attribute/create-attribute.component";
import { EditAttributeComponent } from "../edit-attribute/edit-attribute.component";
import { sharedService } from "src/app/services/shared.service";

@Component({
  selector: "app-schema-settings",
  templateUrl: "./schema-settings.component.html",
  styleUrls: ["./schema-settings.component.scss"]
})
export class SchemaSettingsComponent implements OnInit {
  schema1;
  schema2;
  showDetails: boolean = false;
  divId;

  constructor(private _sharedService: sharedService, private _httpService: httpService, private dialog: MatDialog, public snackBar: MatSnackBar) {
    this.loadSchemas();
  }

  ngOnInit() {}

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  loadSchemas() {
    this._httpService.getCustomerSchema().subscribe(
      (e) => {
        this.schema1 = e.data.sort((a, b) => {
          return a.sort_order - b.sort_order;
        });
        let n = this.schema1.length / 2;

        this.schema2 = this.schema1.splice(0, n);
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  changeOrder() {
    let finalSchema = [];
    let i = 1;

    this.schema2.filter((e) => {
      finalSchema.push(e);
    });

    this.schema1.filter((e) => {
      finalSchema.push(e);
    });

    finalSchema.filter((e) => {
      e["sort_order"] = i++;
    });

    this._httpService.changeCustomerSchemaOrder(finalSchema).subscribe(
      (e) => {
        this._sharedService.Interceptor("SORT ORDER UPDATED SUCCESSFULLY", "succ");
        this.loadSchemas();
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  edit(attribute) {
    console.log("attr ", attribute);
    const dialogRef = this.dialog.open(EditAttributeComponent, {
      width: "815px",
      height: "325px",
      data: {
        attribute
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.event == "refresh") {
        this.loadSchemas();
      }
    });
  }

  openDetails(id) {
    this.showDetails = !this.showDetails;
    this.divId = id;
  }

  delete(e, id) {
    this._httpService.deleteCustomerSchema(id).subscribe(
      (e) => {
        this.loadSchemas();
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  displayMenu(e) {
    e.stopPropagation();
  }

  addAttr() {
    const dialogRef = this.dialog.open(CreateAttributeComponent, {
      width: '815px',
      minHeight: '225px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.event == "refresh") {
        this.loadSchemas();
      }
    });
  }
}
