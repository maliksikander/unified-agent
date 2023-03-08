import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ConfirmationDialogComponent } from "../../new-components/confirmation-dialog/confirmation-dialog.component";
import { httpService } from "../../services/http.service";
import { cacheService } from "../../services/cache.service";
import { ActivatedRoute } from "@angular/router";
import { Subscription, timer } from "rxjs";
import { map, retry } from "rxjs/operators";
import { snackbarService } from "src/app/services/snackbar.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-queue-chats",
  templateUrl: "./queue-chats.component.html",
  styleUrls: ["./queue-chats.component.scss"]
})
export class QueueChatsComponent implements OnInit {
  queuedChatList = [];
  timerSubscription: Subscription;
  queueId: string;
  filteredData = [];
  supervisedTeams:any=[];
  selectedTeam:any="";
  settings = {};
  selectedQueues:any=[];

  constructor(
    private dialog: MatDialog,
    private _translateService: TranslateService,
    private _httpService: httpService,
    private route: ActivatedRoute,
    private _snackBarService: snackbarService,
    private _cacheService:cacheService
  ) {}

  ngOnInit(): void {
    this.settings = {
      text: "All Queues",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      classes: "myclass custom-class",
      enableSearchFilter: false,
      lazyLoading: true,
      badgeShowLimit: 1,
      primaryKey:"queueId"

    };
    this.queueId = this.route.snapshot.queryParamMap.get("queueId");

    this.supervisedTeams=this._cacheService.agent.supervisedTeams;
    if(this.supervisedTeams)
    {
      this.selectedTeam=this.supervisedTeams[0].teamId;
    }
    console.log("superv",this.supervisedTeams)
    this.timerSubscription = timer(0, 10000)
      .pipe(
        map(() => {
          this.getAllQueuedChats(this.selectedTeam);
          console.log("selected quuw",this.selectedQueues);

                }, retry())
      )
      .subscribe();
  }

  getAllQueuedChats(selectedTeamId)
  {
    this._httpService.getAllQueuedChats(selectedTeamId,[]).subscribe(
      (e) => {
        this.queuedChatList = e;
        this.filterData()
      },
      (err) => {
        this._snackBarService.open(this._translateService.instant("snackbar.Error-Getting-Active-Chats-with-Agents"), "err");
      }
    ); 
  }

  closeChat() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: "490px",
      panelClass: "confirm-dialog",
      data: {
        header: this._translateService.instant("snackbar.Close-Topic"),
        message: this._translateService.instant("snackbar.sure-to-close-this-topic")
      }
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }
  changeTeam()
  {
    this.selectedQueues=[];
    this.getAllQueuedChats(this.selectedTeam);
  }
  filterData() {
    this.filteredData=[]
    if(this.selectedQueues.length==0)
    {
      this.filteredData=this.queuedChatList
    }
    else
    {
    this.selectedQueues.forEach((data)=>
    {
      this.queuedChatList.forEach((chat)=>
      {
        if(data.queueId==chat.queueId)
        this.filteredData.push(chat);
      })
      
    })
  }

  }
  reQueue(templateRef): void {
    const dialogRef = this.dialog.open(templateRef, {
      width: "480px"
    });

    dialogRef.afterClosed().subscribe((result) => {
      // console.log("The dialog was closed");
    });
  }

  onItemSelect(item: any) {
    console.log(item.queueName);
    console.log("selected teams",this.selectedQueues);
  }
  OnItemDeSelect(item: any) {
    console.log(item);
    console.log(this.selectedQueues);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  onDeSelectAll(items: any) {
    console.log(items);
  }
  changeData() {
    // this.selectedQueues = [];
  }
  ngOnDestroy(): void {
    if(this.timerSubscription)
    this.timerSubscription.unsubscribe();
  }
}
