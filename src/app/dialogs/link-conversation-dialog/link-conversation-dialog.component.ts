import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: "app-link-conversation-dialog",
  templateUrl: "./link-conversation-dialog.component.html",
  styleUrls: ["./link-conversation-dialog.component.scss"]
})
export class LinkConversationDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<LinkConversationDialogComponent>) {
    dialogRef.disableClose = true;
  }

  isAttributeMerge: boolean = false;
  decisionIs: boolean = false;

  ngOnInit() {}

  sendResponse() {
    this.dialogRef.close({ isAttributeMerge: this.isAttributeMerge, decisionIs: this.decisionIs });
  }
}
