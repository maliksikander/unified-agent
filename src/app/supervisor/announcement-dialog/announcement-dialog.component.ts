import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { cacheService } from "../../services/cache.service";
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
  supervisor={};
  supervisorId={};

  

  announceDate = new FormControl(new Date(), [Validators.required]);
  expireDate = new FormControl(new Date(), [Validators.required]);
  teamListdata = new FormControl("", [Validators.required]);
  announcementMessage = new FormControl("", [Validators.required]);
  public formGroup = new FormGroup({
    date: new FormControl(null, [Validators.required])
  });

  subscriptions: Subscription[];
  AnnouncementBTN = "";
  updateAnnouncement: any;
  constructor(
    private dialog: MatDialog,
    private _cacheService: cacheService
  ) { }

  ngOnInit() {
    console.log(this.dialog);
    this.teamList = this._cacheService.agent.supervisedTeams;
    console.log("teams",this.teamList);
    this.teamList = this._cacheService.agent.supervisedTeams;
    this.supervisor=this._cacheService.agent.username;
    this.supervisorId=this._cacheService.agent.id;
    console.log("this-->supervisor ",this.supervisor);
    console.log("teams list+++++++ ",this.teamList);
    //console.log(this.teamListdata);

    this.selectedTeams = [];
    this.settings = {
      text: "",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      primaryKey:"teamId"
    };
  }

  onCreateAnnouncement() {
    let obj = {
      "teamIds": this.selectedTeams,
      "announcementText": this.announcementMessage.value,
      "expiryTime": this.expireDate.value,
      "scheduledTime": this.announceDate.value,
      "supervisorId": this.supervisorId,
      "supervisorName": this.supervisor
    }
    //if(!(this.teamList)){ console.log("teamList.valid?" );}
   
    console.log("btn clicked", obj)

  }

  onSave() {
  
  this.onCreateAnnouncement();
  this.dialog.closeAll();
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
    dialogRef.afterClosed().subscribe((result) => { });
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
