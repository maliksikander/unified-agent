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
  obj={}
  formData:any ={};
  pageSize:Number=25;
  length;

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

  constructor(

    private dialog: MatDialog,
    private _httpService: httpService,
    private _sharedService: sharedService) {
    // this._httpService.getAnnouncements().subscribe((data) => {
    //   console.log("data", data)
    //   this.currentItemsToShow = data;
    //   this.displayAnnouncements = data;
    // });
  }

  ngOnInit() {
    // this.currentItemsToShow = this.displayAnnouncements;
    // console.log("filter selected", this.FilterSelected);
    // this.currentItemsToShow = this.displayAnnouncements;
    this.getAllAnnouncements();
    
  }


  onNewAnnouncement() {
    const dialogRef = this.dialog.open(AnnouncementDialogComponent, {
      panelClass: "new-announcement-dialog"
    });
    this.getAllAnnouncements();
  }


  getAllAnnouncements() {
    this._httpService.getAnnouncements().subscribe((data) => {
      console.log("data", data)
      this.currentItemsToShow = data;
      this.displayAnnouncements = data;
    });
  }

  onPageChange($event) {
    // this.pageSize=10;
    // this.length
    console.log($event)
    this.currentItemsToShow = this.displayAnnouncements.slice($event.pageIndex * $event.pageSize, $event.pageIndex * $event.pageSize + $event.pageSize);
  }



  onUpdateAnnouncement(value, index) {

    console.log("ID clicked", value);
     this.allAnnouncements = this._httpService.getAnnouncementsById(value).subscribe(res => {
      this.formData=res;
      console.log("formData",this.formData)
    });
    console.log("UpdatedformData===>",this.formData)
   
    //  this.obj={
    //     "teamIds": this.updateData,
    //      "announcementText": this.updateData.announcementText,
    //      "expiryTime": this.updateData.expiryTime,
    //      "scheduledTime": this.updateData.scheduledTime,
    //      "supervisorId": this.updateData.supervisorId,
    //      "supervisorName": this.updateData.supervisorName
    // }
    // this.updateData=obj;
     //console.log("update Announcement obj", this.obj);
    // console.log("update AnnouncementINDEX  clicked", value);
    // console.log("edit specific id", this.displayAnnouncements[index]);
    // this._httpService.getAnnouncementsById(value).subscribe(data => { this.updateData = data; })
    // console.log("update Announcement clicked", this.updateData);

    const dialogRef = this.dialog.open(AnnouncementDialogComponent, {

      data: {   
        value : value,
      // teamIds: this.updateData,
       //announcementText: this.updateData.announcementText,
      // expiryTime: this.updateData.expiryTime,
      // scheduledTime: this.updateData.scheduledTime,
      // supervisorId: this.updateData.supervisorId,
      // supervisorName: this.updateData.supervisorName

    }
    });

  }



  confirmationDialog(templateRef, id, status) {
    // const result = this.displayAnnouncements.filter((obj) => {
    //   return obj.status === 'active';
    // });
    // console.log(result);
    //&& status === 'active'
    if (id ) {
      // console.log("deleted Announcement")
      this.dialog.closeAll();
      const dialogRef = this.dialog.open(templateRef, {
        width: "490px",
        panelClass: "confirm-dialog"
      });
      dialogRef.afterClosed().subscribe((result) => { dialogRef.close() });;
      
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
