import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ConfirmationDialogComponent } from "src/app/new-components/confirmation-dialog/confirmation-dialog.component";
import { CreateLabelComponent } from "src/app/labels/create-label/create-label.component";
import { httpService } from "src/app/services/http.service";
import { sharedService } from "src/app/services/shared.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-labels-list",
  templateUrl: "./labels-list.component.html",
  styleUrls: ["./labels-list.component.scss"]
})
export class LabelsListComponent implements OnInit {
  constructor(
    private _sharedService: sharedService,
     private dialog: MatDialog,
      private _httpService: httpService,
      private _translateService:TranslateService
      ) {}

  showMetaDIv: boolean = false;
  metaDivId;
  labels = [];

  ngOnInit() {
    this.loadLabels();
  }

  loadLabels() {
    this._httpService.getLabels().subscribe(
      (e) => {
        this.labels = e;
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
        console.error("Error loading labaels",error)
      }
    );
  }

  openLabelDialog(label, action) {
    const dialogRef = this.dialog.open(CreateLabelComponent, {
      maxWidth: "568px",
      width: "568px",
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

  onDelete(id) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: "490px",
      panelClass: "confirm-dialog",
      data: { header: this._translateService.instant('snackbar.Delete-Label'), message: this._translateService.instant('snackbar.Are-you-sure-you-want-to-delete-the-label?') }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.event == "confirm") {
        this.deleteLabel(id);
      }
    });
  }
  deleteLabel(id) {
    this._httpService.deleteLabel(id).subscribe(
      (e) => {
        this._sharedService.Interceptor(this._translateService.instant('snackbar.Label-Deleted'), "succ");
        this.loadLabels();
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }
}
