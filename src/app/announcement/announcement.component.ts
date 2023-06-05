import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { CreateCustomerComponent } from "../create-customer/create-customer.component";
import { AnnouncementDialogComponent } from "../supervisor/announcement-dialog/announcement-dialog.component";
import { MatDialog, MatPaginatorModule, MAT_DIALOG_DATA } from "@angular/material";
import { httpService } from "../services/http.service";
import { sharedService } from "../services/shared.service";


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
  allAnnouncements: any;
  obj = {}
  formData: any = {};
  pageSize: Number = 25;
  constructor(

    private dialog: MatDialog,
    private _httpService: httpService,
    private _sharedService: sharedService) {

  }

  ngOnInit() {
    this.getAllAnnouncements();
  }


  onNewAnnouncement() {
    const dialogRef = this.dialog.open(AnnouncementDialogComponent, {
      panelClass: "new-announcement-dialog"
      
    });
    dialogRef.afterClosed().subscribe((result) => { 
      this._httpService.getAnnouncements();
      dialogRef.close() });;

  }

  getAllAnnouncements() {
    this._httpService.getAnnouncements().subscribe((data) => {
      console.log("data", data)
      this.currentItemsToShow = data;
      this.displayAnnouncements = data;
    });
  }

  onPageChange($event) {
    console.log($event)
    this.currentItemsToShow = this.displayAnnouncements.slice($event.pageIndex * $event.pageSize, $event.pageIndex * $event.pageSize + $event.pageSize);
  }

  onUpdateAnnouncement(value, index) {
    console.log("ID clicked", value);
    this.allAnnouncements = this._httpService.getAnnouncementsById(value).subscribe(res => {
      this.formData = res;
      console.log("formData", this.formData)
    });
    console.log("UpdatedformData===>", this.formData)

    const dialogRef = this.dialog.open(AnnouncementDialogComponent, {

      data: {
        value: value,

      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      dialogRef.close()
      this.getAllAnnouncements();
    });;


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
        console.log("deleted Announcement");
        this.getAllAnnouncements();
      },
      error: console.log,
    })
    console.log("id clicked", this.specficId);

  }

}
