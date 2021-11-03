import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ConfirmationDialogComponent } from "src/app/new-components/confirmation-dialog/confirmation-dialog.component";
import { CreateLabelComponent } from "src/app/labels/create-label/create-label.component";
import { httpService } from "src/app/services/http.service";
import { sharedService } from "src/app/services/shared.service";

@Component({
  selector: "app-labels-list",
  templateUrl: "./labels-list.component.html",
  styleUrls: ["./labels-list.component.scss"]
})
export class LabelsListComponent implements OnInit {
  constructor(private _sharedService: sharedService, private dialog: MatDialog, private _httpService: httpService) {}

  showMetaDIv: boolean = false;
  metaDivId;
  labels = [];

  ngOnInit() {
    this.loadLabels();
  }

  loadLabels() {
    this._httpService.getLabels().subscribe(
      (e) => {
        this.labels = e.data;
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  createUpdate(label, action) {
    const dialogRef = this.dialog.open(CreateLabelComponent, {
      maxWidth: '568px',
      width: '568px',
      data: { label: label, action: action }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.event == "refresh") {
        this.loadLabels();
      }
    });
  }

  showMeta(id) {
    this.metaDivId = id;
    this.showMetaDIv = true;
  }

  delete(id) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: "490px",
      panelClass: "confirm-dialog",
      data: { header: "delete Label", message: `Are you sure you want to delete?` }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.event == "confirm") {
        this._httpService.deleteLabel(id).subscribe(
          (e) => {
            this._sharedService.Interceptor("deleted!", "succ");
            this.loadLabels();
          },
          (error) => {
            this._sharedService.Interceptor(error.error, "err");
          }
        );
      }
    });
  }
}
