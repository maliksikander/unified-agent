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
  textVar;
  editObj = {}

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
  ) { }

  ngOnInit() {

    if (this.dataID !== null) {
      console.log(this.dataID, "DataID------------->");
      this.currentAnnouncement = this._httpService.getAnnouncementsById(this.dataID.value).subscribe(res => {
        this.formData = res;
        console.log("currentAnnouncement", res)
        this.editObj = {
          "teamIds": this.selectedTeams = res.teamIds,
          //"status": this.formData.status,
          //"seenBy": this.formData.seenBy,
          "announcementText": this.announcementMessage.setValue(this.formData.announcementText),
          "expiryTime": this.expireDate.setValue(this.formData.expiryTime),
          "scheduledTime": this.announceDate.setValue(this.formData.scheduledTime),
          "supervisorId": this.supervisorId,
          "supervisorName": this.supervisor,
          //"createdAt": this.formData.createdAt,
          //"updatedAt": this.formData.updatedAt,
          //"id": this.formData.id
        }
        console.log("this.selected teams", this.selectedTeams);
      });
      console.log("EDIT OBJ===>", this.editObj)
    }
    // console.log(this.dialog);

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
      //this.currentItemsToShow = data;
      this.fetchDataList = data;

    });
  }


  onCreateAnnouncement() {
   let selectedTeamNames = this.selectedTeams.map(d => JSON.stringify(d));
    console.log("TEAM NAME MAP ", selectedTeamNames);
    this.selectedTeams = selectedTeamNames;
    let obj = {
      "teamIds": this.selectedTeams,
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
    this._httpService.updateAnnouncemenentById(this.dataID.value, this.editObj).subscribe({
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

    dialogRef.afterClosed().subscribe((result) => { 
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
