import { Component, OnInit } from "@angular/core";
import { moveItemInArray, CdkDragDrop, transferArrayItem } from "@angular/cdk/drag-drop";
import { MatSnackBar, MatDialog } from "@angular/material";
import { httpService } from "src/app/services/http.service";
import { CreateAttributeComponent } from "../create-attribute/create-attribute.component";
import { EditAttributeComponent } from "../edit-attribute/edit-attribute.component";
import { sharedService } from "src/app/services/shared.service";
import { snackbarService } from "src/app/services/snackbar.service";

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

  constructor(private _sharedService: sharedService, private _httpService: httpService, private dialog: MatDialog, public snackBar: snackbarService) {
    this.loadSchemas();
  }

  ngOnInit() {}

  // angular drag & drop method
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  // to get customer schema attribute list
  loadSchemas() {
    this._httpService.getCustomerSchema().subscribe(
      (res) => {
        this.schema1 = res.sort((a, b) => {
          return a.sortOrder - b.sortOrder;
        });
        let n = this.schema1.length / 2;

        this.schema2 = this.schema1.splice(0, n);
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  // to save the updated the attribute schema order
  changeOrder() {
    let finalSchema = [];
    let i = 1;

    this.schema2.forEach((e) => {
      finalSchema.push(e);
    });

    this.schema1.forEach((e) => {
      finalSchema.push(e);
    });

    finalSchema.forEach((item) => {
      item["sortOrder"] = i++;
      delete item._id;
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
      minHeight: "225px",
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

  // to delete attribute, it expects the attribute schema object
  deleteAttribute(item) {
    if (item.isDeletable == false) {
      // to check if attribute is deleteable or not
      this.snackBar.open("CANNOT_DELETE_DEFAULT_ATTRIBUTE", "err");
    } else {
      this._httpService.deleteCustomerSchema(item._id).subscribe(
        (e) => {
          this.loadSchemas();
        },
        (error) => {
          this._sharedService.Interceptor(error.error, "err");
        }
      );
    }
  }

  displayMenu(e) {
    e.stopPropagation();
  }

  addAttr() {
    const dialogRef = this.dialog.open(CreateAttributeComponent, {
      width: "815px",
      minHeight: "225px"
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.event == "refresh") {
        this.loadSchemas();
      }
    });
  }
}
