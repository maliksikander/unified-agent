import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { cacheService } from "../../services/cache.service";
import { httpService } from "../../services/http.service";
import { Subscription } from "rxjs";
import { MAT_DIALOG_DATA, MatDialog ,MatDialogRef} from "@angular/material";

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
  teamList :any;
  selectedTeams = [];
  settings = {};
  supervisor = {};
  supervisorId = {};
  postData = {};
  fetchDataList=[];
  currentAnnouncement:any={};
  formData:any=[];
  announcementForm:FormGroup ;
  textVar;

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
    private formBuilder: FormBuilder,
    private _cacheService: cacheService,
    private _httpService: httpService,
    public dialogRef: MatDialogRef<AnnouncementDialogComponent>, @Inject(MAT_DIALOG_DATA) public dataID:any
  ) { }

  ngOnInit() {
    this.getAllAnnouncementList();
    // this.announcementForm = this.formBuilder.group({
    //   announceDate : [new Date(), [Validators.required]],
    //   expireDate : [new Date(), [Validators.required]],
    //   teamListdata : ["", [Validators.required]],
    //   announcementMessage : ["", [Validators.required]],
    // });
    //console.log(this.dataID.value,"------------->");
    //  this.currentAnnouncement = this._httpService.getAnnouncementsById(this.data.value).subscribe(res => {
    //   this.formData=res;
    //   console.log("currentAnnouncement",res)
    //   this.announcementMessage.setValue(this.formData.announcementText);
     
    // this.announceDate.setValue(this.formData.scheduledTime);
    // this.expireDate.setValue(this.formData.expiryTime); 
    // //    //this.teamListdata.setValue(this.formData.teamIds); 
    // //    //console.log("this.formData.ID==>>",this.formData.teamIds)

    //  });
    //console.log("UpdatedformData===>",this.formData)

    //this.announcementForm.get('announcementMessage').setValue(this.formData.announcementText);
    //console.log("this.formData.announcementText",this.formData.announcementText);
    //this.announcementMessage =this.formData.announcementText;
   //console.log(this.currentAnnouncement,"MAt dialog data");

  //  let obj = {
  //   "teamIds": [this.selectedTeams[0].teamId],
  //   "announcementText": this.announcementMessage.value,
  //   "expiryTime": this.expireDate.value,
  //   "scheduledTime": this.announceDate.value,
  //   "supervisorId": this.supervisorId,
  //   "supervisorName": this.supervisor
  // }


   // console.log(this.dialog);
    this.teamList = this._cacheService.agent.supervisedTeams;
    console.log("teams", this.teamList);
    this.teamList = this._cacheService.agent.supervisedTeams;
    this.supervisor = this._cacheService.agent.username;
    this.supervisorId = this._cacheService.agent.id;
    //console.log("this-->supervisor ", this.supervisor);
    //console.log("teams list+++++++ ", this.teamList);
    //console.log(this.teamListdata);
    this.getAllAnnouncementList();
    this.selectedTeams = [];
   // console.log("this.selectedTeams===>>",this.selectedTeams)
    this.settings = {
      text: "",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      primaryKey: "teamId"
    };

  }


  getAllAnnouncementList(){
     this._httpService.getAnnouncements().subscribe((data) => {
       console.log("data", data)
       //this.currentItemsToShow = data;
       this.fetchDataList = data;
     });
  }
  
  onCreateAnnouncement() {
  
    let obj = {
      "teamIds": [this.selectedTeams[0].teamId],
      "announcementText": this.announcementMessage.value,
      "expiryTime": this.expireDate.value,
      "scheduledTime": this.announceDate.value,
      "supervisorId": this.supervisorId,
      "supervisorName": this.supervisor
    }
    //console.log("this.selectedTeams===>>",this.selectedTeams)
    //if(!(this.teamList)){ console.log("teamList.valid?" );}
    console.log("btn clicked", obj);
    this.postData = obj;
    console.log("this.postData", this.postData);
    this._httpService.addAnnouncemenent(this.postData).subscribe({
      next: (val: any) => {
        //this._coreService.openSnackBar('Employee added successfully')
        this.getAllAnnouncementList();
        console.log("added successfully");
       
        
      },
      error: (err: any) => {
        console.error(err);
      },
    });
    this.getAllAnnouncementList();
  }

  onSave() {
    this.onCreateAnnouncement();
    this.dialog.closeAll();
    this.getAllAnnouncementList();
  }


  onClose() {
    this.dialog.closeAll();
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
      panelClass: "confirm-dialog",
      data: this.postData

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
