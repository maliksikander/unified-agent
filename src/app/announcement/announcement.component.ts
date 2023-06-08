import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { CreateCustomerComponent } from "../create-customer/create-customer.component";
import { AnnouncementDialogComponent } from "../supervisor/announcement-dialog/announcement-dialog.component";
import { MatDialog, MatPaginatorModule, MAT_DIALOG_DATA, MatSnackBar } from "@angular/material";
import { httpService } from "../services/http.service";
import { sharedService } from "../services/shared.service";
import { cacheService } from "../services/cache.service";
import { TranslateService } from "@ngx-translate/core";
import { snackbarService } from "../services/snackbar.service";


@Component({
  selector: "app-announcement",
  templateUrl: "./announcement.component.html",
  styleUrls: ["./announcement.component.scss"]
})

export class AnnouncementComponent implements OnInit {
  FilterSelected = "all";
  currentItemsToShow: any;
  displayAnnouncements = [];
  status = '';
  specficId: String = "";
  updateData: any;
  obj = {}
  pageSize: Number = 25;
  supervisorId
  constructor(

    private dialog: MatDialog,
    private _httpService: httpService,
    private _sharedService: sharedService,
    private _cacheService: cacheService,
    private _snackbarService: snackbarService,
    private _translateService: TranslateService) {

  }

  ngOnInit() {
    this.supervisorId = this._cacheService.agent.id;
    this.getAllAnnouncements();
  }


  onNewAnnouncement() {
    const dialogRef = this.dialog.open(AnnouncementDialogComponent, {
      panelClass: "new-announcement-dialog"
    });
    dialogRef.afterClosed().subscribe((result) => {
      dialogRef.close()
      this.getAllAnnouncements();
    });
  }

  getAllAnnouncements() {
    this._httpService.getAnnouncements(this.supervisorId).subscribe((data) => {
      this.currentItemsToShow = data;
      this.displayAnnouncements = data;
    });
  }

  onPageChange($event) {
    this.currentItemsToShow = this.displayAnnouncements.slice(
      $event.pageIndex * $event.pageSize, $event.pageIndex * $event.pageSize + $event.pageSize);
  }

  onUpdateAnnouncement(value, index) {
     this._httpService.getAnnouncementsById(value).subscribe(res => {
      if (res.status === "scheduled") {
        const dialogRef = this.dialog.open(AnnouncementDialogComponent, {
          data: {
            value: value,
          }
        });
        dialogRef.afterClosed().subscribe((result) => {
          dialogRef.close()
          this.getAllAnnouncements();
        });
      }
      else {
        this._snackbarService.open(this._translateService.instant("snackbar.Unable-to-edit-Active-Announcements"), "err");
      }
    });
  }



  confirmationDialog(templateRef, id, status) {
    if (id) {
      this.dialog.closeAll();
      const dialogRef = this.dialog.open(templateRef, {
        width: "490px",
        panelClass: "confirm-dialog"
      });
      dialogRef.afterClosed().subscribe((result) => { dialogRef.close() });
      this.specficId = id;
    }
  }

  confirmDelete() {
    this._httpService.deleteAnnouncementById(this.specficId).subscribe({
      next: (res) => {
        this._snackbarService.open(this._translateService.instant("snackbar.Announcement-Deleted"), "succ");
        this.getAllAnnouncements();
      },
      error: (err: any) => {
        console.error(err);
        this._snackbarService.open(this._translateService.instant("snackbar.Unable-to-Delete-Announcement"), "err");
       
      
      },
      
    })


  }

}
