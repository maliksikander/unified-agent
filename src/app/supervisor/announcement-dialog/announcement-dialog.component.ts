import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { MatDialog } from "@angular/material";

@Component({
  selector: "app-announcement-dialog",
  templateUrl: "./announcement-dialog.component.html",
  styleUrls: ["./announcement-dialog.component.scss"]
})
export class AnnouncementDialogComponent implements OnInit {
  announceDateMin = new Date();
  expireDateMin = new Date();
  FilterSelected = "all";
  announcements = [];
  announcementsBackup: any;
  agentDetail: any;
  Teams: string[] = ["handRaise", "title", "agent", "team", "time", "channel"];
  announcementsIndex = 0;
  isLoadMore = true;
  displayAnnouncements = [];
  announcementsFilter = "all";
  announcementTask = "create";
  teamList = [];
  selectedTeams = [];
  settings = {};
  announcementForm: FormGroup;

  announceDate = new FormControl(new Date(), [Validators.required]);
  expireDate = new FormControl(new Date(), [Validators.required]);
  // teamList = new FormControl("", [Validators.required]);
  announcementMessage = new FormControl("", [Validators.required]);
  public formGroup = new FormGroup({
    date: new FormControl(null, [Validators.required])
  });

  subscriptions: Subscription[];
  AnnouncementBTN = "";
  updateAnnouncement: any;
  constructor(private dialog: MatDialog) {}

   ngOnInit() {
    this.announcementForm = new FormGroup({});
     this.teamList = [
       {"id": 1, "teamName": "Software"},
       {"id": 2, "teamName": "Marketing"},
       {"id": 3, "teamName": "Product"},
       {"id": 4, "teamName": "Support"},
       {"id": 5, "teamName": "Business"},
       {"id": 6, "teamName": "Sales"}
     ];

     this.selectedTeams = [];
     this.settings = {
       text: "",
       selectAllText: 'Select All',
       unSelectAllText: 'UnSelect All',
       enableSearchFilter: true,
       classes: "myclass custom-class"
     };
   }

   onCreateAnnouncement(data){
    let obj={
      "teamIds": [
                  "99",
                  "44242"
              ],
              "announcementText": "jwjw",
              "expiryTime": "2023-05-28T00:12:00.000Z",
              "scheduledTime": "2023-05-27T00:00:00.000Z",
              "supervisorId": 233223,
              "supervisorName": "danial dee"
      }
    console.log("btn clicked",obj)

   }

   onSave() {
    let data = this.announcementForm.value;
    console.log("save-data",data);
    // if (data.labels == "") data.labels = [];
    // data = this.fetchTheIdsOfLabels(data);
    // data.isAnonymous = false;
     console.log("save result==>", data);
    
    this.onCreateAnnouncement(data);
  }
  onClose() {
    this.dialog.closeAll();
  }

  getAllTeams() {
    
        console.log("got all Teams");
      
      
        console.error("Error Getting Teams");
     
  }



  onValidateExpiryDate(d) {
    let date = new Date(d);
    date.setMinutes(date.getMinutes() + 5);
    this.expireDateMin = date;
    let _date = new Date(d);
    _date.setMinutes(_date.getMinutes() + 5);
    this.expireDate = new FormControl(_date, [Validators.required]);
  }

  confirmationDialog(templateRef, data) {
    this.dialog.closeAll();
    const dialogRef = this.dialog.open(templateRef, {
      width: "490px",
      panelClass: "confirm-dialog"
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  onItemSelect(item: any) {
    console.log(item);
    console.log(this.selectedTeams);
  }
  OnItemDeSelect(item: any) {
    console.log(item);
    console.log(this.selectedTeams);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  onDeSelectAll(items: any) {
    console.log(items);
  }
  changeData() {
    this.selectedTeams = [];
  }
}
