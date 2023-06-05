import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { cacheService } from "../../services/cache.service";
import { httpService } from "../../services/http.service";
import { Subscription } from "rxjs";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material";
import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";

@Component({
  selector: "app-announcement-dialog",
  templateUrl: "./announcement-dialog.component.html",
  styleUrls: ["./announcement-dialog.component.scss"]
})
export class AnnouncementDialogComponent implements OnInit {
  announceDateMin = new Date();
  maxdateaVar=this.announceDateMin;
  

   someDate = this.announceDateMin.getDate();
   //numberOfDaysToAdd = 5;
   //result = this.someDate.setDate(this.someDate + this.numberOfDaysToAdd);
  maxDateVal;
  expireDateMin = new Date();
  FilterSelected = "all";
  announcements = [];
  announcementsBackup: any;
  agentDetail: any;
  announcementsIndex = 0;
  isLoadMore = true;
  displayAnnouncements = [];
  announcementsFilter = "all";
  announcementTask = "create";
  teamList: any;
  selectedTeams: any ;
  settings = {};
  supervisor = {};
  supervisorId = {};
  postData = {};
  fetchDataList = [];
  currentAnnouncement: any = {};
  formData: any = [];
  announcementForm: FormGroup;
  editObj2={};
  editObj={};

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
    private _cacheService: cacheService,
    private _httpService: httpService,
    public dialogRef: MatDialogRef<AnnouncementDialogComponent>, @Inject(MAT_DIALOG_DATA) public dataID: any
  ) {//this.maxDateVal= new Date( 2023, 6, 15);

   }

  ngOnInit() {
    //this.maxDate= this.maxdateaVar.setHours(120);

    if (this.dataID !== null) {
      
      this.currentAnnouncement = this._httpService.getAnnouncementsById(this.dataID.value).subscribe(res => {
        this.formData = res;
        this.editObj = {
          "teams": this.selectedTeams = res.teams,
          "announcementText": this.announcementMessage.setValue(res.announcementText),
          "expiryTime": this.expireDate.setValue(res.expiryTime),
          "scheduledTime": this.announceDate.setValue(res.scheduledTime),
          "supervisorId": this.supervisorId,
          "supervisorName": this.supervisor,
        }
      });
  
    }
    
    this.teamList = this._cacheService.agent.supervisedTeams;
    console.log("teams", this.teamList);
    this.teamList = this._cacheService.agent.supervisedTeams;
    this.supervisor = this._cacheService.agent.username;
    this.supervisorId = this._cacheService.agent.id;
    this.getAllAnnouncementList();
    this.selectedTeams = [];
    this.settings = {
      text: "",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      primaryKey: "teamId"
    };
    console.log(this.selectedTeams)

  }

  getAllAnnouncementList() {
    this._httpService.getAnnouncements().subscribe((data) => {
      console.log("data", data)
      this.fetchDataList = data;

    });
  }


  onCreateAnnouncement() {
   let selectedTeamNames = this.selectedTeams.map(d => d);
    console.log("TEAM NAME MAP ", selectedTeamNames);
    this.selectedTeams = selectedTeamNames;
    let obj = {
      "teams": this.selectedTeams,
      "announcementText": this.announcementMessage.value,
      "expiryTime": this.expireDate.value,
      "scheduledTime": this.announceDate.value,
      "supervisorId": this.supervisorId,
      "supervisorName": this.supervisor
    }
    console.log("btn clicked", obj);
    this.postData = obj;
    console.log("this.postData", this.postData);
    this._httpService.addAnnouncemenent(this.postData).subscribe({
      next: (val: any) => {
        this.getAllAnnouncementList();
        console.log("added successfully");

      },
      error: (err: any) => {
        console.error(err);
      },
    });

  }

  onSave() {
    this.onCreateAnnouncement();
    this.dialog.closeAll();

  }
  update() {
    console.log("update dataaid.value", this.dataID.value);
    this.editObj2 = {
      "teams": this.selectedTeams,
      "announcementText": this.announcementMessage.value,
      //setValue(this.formData.expiryTime)
      "expiryTime": this.expireDate.value,
      "scheduledTime": this.announceDate.setValue(this.announceDate.value),
      "supervisorId": this.supervisorId,
      "supervisorName": this.supervisor,
    }
    this._httpService.updateAnnouncemenentById(this.dataID.value, this.editObj2).subscribe({
      next: (val: any) => {
        this.getAllAnnouncementList();
        console.log("updated successfully");
        this.dialog.closeAll();
      },
      error: (err: any) => {
        console.error(err);
        this.dialog.closeAll();
      },
    });
    this.dialog.closeAll();

  }

  onClose() {
    this.dialog.closeAll();
  }

  onValidateExpiryDate(d) {
    let date = new Date(d);
    date.setMinutes(date.getMinutes() + 10);
    this.expireDateMin = date;
    let _date = new Date(d);
    _date.setMinutes(_date.getMinutes() + 10);
    this.expireDate = new FormControl(_date, [Validators.required]);
  }

  confirmationDialog(templateRef, data) {
    //this.dialog.closeAll();
    const dialogRef = this.dialog.open(templateRef, {
      width: "490px",
      panelClass: "confirm-dialog",
      data: this.postData

    });

    templateRef.afterClosed().subscribe((result) => { 
      this._httpService.getAnnouncements();
      dialogRef.close() });;
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
