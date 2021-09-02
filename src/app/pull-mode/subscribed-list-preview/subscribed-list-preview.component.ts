import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material";
import { pullModeService } from "src/app/services/pullMode.service";
import { ConfirmationDialogComponent } from "../../new-components/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: "app-subscribed-list-preview",
  templateUrl: "./subscribed-list-preview.component.html",
  styleUrls: ["./subscribed-list-preview.component.scss"]
})
export class SubscribedListPreviewComponent implements OnInit {
  @Output() expandCustomerInfo = new EventEmitter<any>();
  @Input() filterListId: any;

  listPreview = true;
  filterStatus = "all";

  constructor(private dialog: MatDialog, public _pullModeservice: pullModeService) {}

  ngOnInit() {}
  listPreviewToggle() {
    this.expandCustomerInfo.emit((this.listPreview = false));
  }

  closeChat() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: "490px",
      panelClass: "confirm-dialog",
      data: { header: "Close Chat", message: `Are you sure you want to close this Chat?` }
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }
}
