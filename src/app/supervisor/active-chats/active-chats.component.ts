import { Component, OnInit } from "@angular/core";
import { ConfirmationDialogComponent } from "../../new-components/confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material";
import { httpService } from "../../services/http.service";
import { ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { Subscription, timer } from "rxjs";
import { map, retry } from "rxjs/operators";

import { snackbarService } from "src/app/services/snackbar.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-active-chats",
  templateUrl: "./active-chats.component.html",
  styleUrls: ["./active-chats.component.scss"]
})
export class ActiveChatsComponent implements OnInit {
  FilterSelected = "agents";
  QueueSelected="all";
  agentSearch = "";
  queuesList=[];
  timerSubscription: Subscription;
  filter: string;
  filteredData = [];
  activeChatListWithAgents: [];
  activeChatListWithBots: [];

  itemList = [];
  selectedItems = [];
  settings = {};

  constructor(
    private dialog: MatDialog,
    private _translateService: TranslateService,
    private _httpService: httpService,
    private route: ActivatedRoute,
    private _snackBarService: snackbarService
  ) {}
  ngOnInit(): void {
    this._httpService.getAllQueues().subscribe((e) => {
      this.queuesList = e;
    }, (err) => {
      this._snackBarService.open(this._translateService.instant('snackbar.Error-Getting-Queues-List'), 'err');
    });

    this.filter = this.route.snapshot.queryParamMap.get("filter") ? this.route.snapshot.queryParamMap.get("filter") : "agents";
    if (this.filter == "agents") {
      this.FilterSelected = "agents";
    } else if (this.filter == "bots") {
      this.FilterSelected = "bots";
    }
    this.settings = {
      text: "Team",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      classes: "myclass custom-class",
      enableSearchFilter: false,
      lazyLoading: true,
      badgeShowLimit: 1

    };
    this.timerSubscription = timer(0, 10000)
      .pipe(
        map(() => {
          this._httpService.getAllActiveChatsWithAgents().subscribe((e) => {
            this.activeChatListWithAgents=e;
            this.filterData();
          },(err)=>
          {
            this.filteredData=[]
            this.activeChatListWithAgents=[];
            this._snackBarService.open(this._translateService.instant('snackbar.Error-Getting-Active-Chats-with-Agents'),'err');
          });
          this._httpService.getAllActiveChatsWithBots().subscribe((e) => {
            this.activeChatListWithBots = e;
          },(err)=>
          {
            this._snackBarService.open(this._translateService.instant('snackbar.Error-Getting-Active-Chats-with-Bots'),'err');
            this.activeChatListWithBots=[];

          });
        }, retry())
      )
      .subscribe();

  }
  filterData() {
    // console.log("Filter Selected for Queued Chats", this.FilterSelected);
    if (this.QueueSelected == "all") {
      this.filteredData = this.activeChatListWithAgents;
    } else {
      this.activeChatListWithAgents.forEach((value:any)=>{
        if(value.queueId==this.QueueSelected)
        {
          this.filteredData=[]

          this.filteredData.push(value);
        }

      });
    }
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
  ngOnDestroy(): void {
    this.timerSubscription.unsubscribe();
  }

  onItemSelect(item: any) {
    console.log(item.name);
    console.log(this.selectedItems);
  }
  OnItemDeSelect(item: any) {
    console.log(item);
    console.log(this.selectedItems);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  onDeSelectAll(items: any) {
    console.log(items);
  }
  changeData() {
    this.selectedItems = [];
  }
}
