import { Component, OnInit, ViewChild } from "@angular/core";
import { CreateCustomerComponent } from "../create-customer/create-customer.component";
import { AnnouncementDialogComponent } from "../supervisor/announcement-dialog/announcement-dialog.component";
import { MatDialog, MatPaginatorModule } from "@angular/material";
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

  // displayAnnouncements = [
  //   {
  //     message: "Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.",
  //     created_by: "Ev Gayforth",
  //     status: "scheduled",
  //     teams: ["Software", "Marketing", "Product", "Support", "Business", "Sales"],
  //     expiry_time: "12/03/2020 15:25"
  //   },
  //   {
  //     message: "Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.",
  //     created_by: "Ev Gayforth",
  //     status: "scheduled",
  //     teams: ["Software", "Product", "Support", "Business", "Sales"],
  //     expiry_time: "12/03/2020 15:25"
  //   },
  //   {
  //     message: "Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.",
  //     created_by: "Ev Gayforth",
  //     status: "scheduled",
  //     teams: ["Support", "Business", "Sales"],
  //     expiry_time: "12/03/2020 15:25"
  //   },
  //   {
  //     message: "Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.",
  //     created_by: "Ev Gayforth",
  //     status: "scheduled",
  //     teams: ["Marketing", "Product", "Support", "Business", "Sales"],
  //     expiry_time: "12/03/2020 15:25"
  //   },
  //   {
  //     message: "Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.",
  //     created_by: "Ev Gayforth",
  //     status: "Active",
  //     teams: ["Product", "Support", "Business", "Sales"],
  //     expiry_time: "12/03/2020 15:25"
  //   },
  //   {
  //     message: "Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.",
  //     created_by: "Ev Gayforth",
  //     status: "active",
  //     teams: ["Product", "Sales"],
  //     expiry_time: "12/03/2020 15:25"
  //   },
  //   {
  //     message: "Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.",
  //     created_by: "Ev Gayforth",
  //     status: "active",
  //     teams: ["Business", "Sales"],
  //     expiry_time: "12/03/2020 15:25"
  //   },
  //   {
  //     message: "Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.",
  //     created_by: "Ev Gayforth",
  //     status: "active",
  //     teams: ["Product", "Support", "Business", "Sales"],
  //     expiry_time: "12/03/2020 15:25"
  //   },
  //   {
  //     message: "Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.",
  //     created_by: "Ev Gayforth",
  //     status: "expired",
  //     teams: ["Support", "Business", "Sales"],
  //     expiry_time: "12/03/2020 15:25"
  //   },
  //   {
  //     message: "Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.",
  //     created_by: "Ev Gayforth",
  //     status: "expired",
  //     teams: ["Sales"],
  //     expiry_time: "12/03/2020 15:25"
  //   },
  //   {
  //     message: "Hi. Please share the email ID for support team. Also share some number where I can call in emergency situations.",
  //     created_by: "Ev Gayforth",
  //     status: "expired",
  //     teams: ["Software", "Marketing", "Product", "Support", "Business", "Sales"],
  //     expiry_time: "12/03/2020 15:25"
  //   }
  // ];

  constructor(private dialog: MatDialog, private _httpService: httpService, private _sharedService: sharedService) {
    this._httpService.getAnnouncements().subscribe((data) => {
      console.log("data", data)
      this.currentItemsToShow = data;
      this.displayAnnouncements = data;
    });

  }

  ngOnInit() {
    this.currentItemsToShow = this.displayAnnouncements;
    //console.log(this.currentItemsToShow);
    console.log("filter selected", this.FilterSelected);
    this.currentItemsToShow = this.displayAnnouncements;

  }


  onCreateAnnouncement() {
    const dialogRef = this.dialog.open(AnnouncementDialogComponent, {
      panelClass: "new-announcement-dialog"
    });
  }



  onPageChange($event) {
    console.log($event)
    this.currentItemsToShow = this.displayAnnouncements.slice($event.pageIndex * $event.pageSize, $event.pageIndex * $event.pageSize + $event.pageSize);
  }



  onUpdateAnnouncement(value,index) {
    //    data:{};
    //  const allAnnouncements=this._httpService.getAnnouncements().subscribe(
    //   (res) => {
    //     let temp = res.find( c => c.ID === value);

    //   });
    console.log("update Announcement clicked", value);
    console.log("edit specific id",this.displayAnnouncements[index]);
    //console.log("update Announcement clicked",allAnnouncements);
    const dialogRef = this.dialog.open(AnnouncementDialogComponent, {
      panelClass: "Edit-announcement-dialog"
    });
  }



  confirmationDialog(templateRef, data) {
    const result = this.displayAnnouncements.filter((obj) => {
      return obj.status === 'active';
    });
    console.log(result);
    console.log("deleted Announcement")
    this.dialog.closeAll();
    const dialogRef = this.dialog.open(templateRef, {
      width: "490px",
      panelClass: "confirm-dialog"
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }



  // onChangeFilter(event){
  //   //console.log(event);
  //   let result = this.currentItemsToShow .filter((obj) => {
  //     return obj.status === event.value;
  //   });
  //  // console.log(result);

  //   this.currentItemsToShow =result;
  //   console.log(this.currentItemsToShow,"dp");
  //   //this.currentItemsToShow = this.displayAnnouncements;

  // }


}
