import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: "app-confirmation-dialog",
  templateUrl: "./confirmation-dialog.component.html",
  styleUrls: ["./confirmation-dialog.component.scss"]
})
export class ConfirmationDialogComponent implements OnInit {
  headerText = "Delete";
  messageText = "Are You Sure You want to delete?";

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ConfirmationDialogComponent>) {}

  ngOnInit() {
    this.messageText = this.data.message;
    this.headerText = this.data.header;
  }

  confirm() {
    this.dialogRef.close({ event: "confirm" });
  }

  cancel() {
    this.dialogRef.close();
  }
}
