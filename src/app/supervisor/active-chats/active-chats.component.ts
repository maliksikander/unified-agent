import { Component, OnInit } from "@angular/core";
import { ConfirmationDialogComponent } from "../../new-components/confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material";
import { httpService } from "../../services/http.service";
import { cacheService } from "../../services/cache.service";

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
  QueueSelected = "all";
  agentSearch = "";
  queuesList = [];
  timerSubscription: Subscription;
  filter: string;
  filteredData = [];
  activeChatListWithAgents: any = [];
  activeChatListWithBots: any = [];
  supervisedTeams: any = [];
  selectedTeam: any = "";
  itemList = [];
  selectedQueues: any = [];
  settings = {};

  constructor(
    private dialog: MatDialog,
    private _translateService: TranslateService,
    private _httpService: httpService,
    private route: ActivatedRoute,
    private _snackBarService: snackbarService,
    private _cacheService: cacheService
  ) {}
  ngOnInit(): void {

    this.filter = this.route.snapshot.queryParamMap.get("filter") ? this.route.snapshot.queryParamMap.get("filter") : "agents";
    if (this.filter == "agents") {
      this.FilterSelected = "agents";
    } else if (this.filter == "bots") {
      this.FilterSelected = "bots";
    }

    this.supervisedTeams = this._cacheService.agent.supervisedTeams;
    if (this.supervisedTeams.length!=0) {
      this.selectedTeam = this.supervisedTeams[0].teamId;
    this.settings = {
      text: "All Queues",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      classes: "myclass custom-class",
      enableSearchFilter: false,
      lazyLoading: true,
      badgeShowLimit: 1,
      primaryKey: "queueId"
    };
    this.timerSubscription = timer(0, 10000)
      .pipe(
        map(() => {
          if (this.FilterSelected == "agents") this.getAllActiveChatsWithTeam(this.selectedTeam, []);
          else if (this.FilterSelected == "bots") this.getAllActiveChatsWithBots();
          console.log("selected queus", this.selectedQueues);
        }, retry())
      )
      .subscribe();
    }
  }
  getAllActiveChatsWithTeam(selectedTeam, selectedQueues) {
    this._httpService.getAllActiveChatsWithAgents(selectedTeam, selectedQueues).subscribe(
      (e) => {
        this.activeChatListWithAgents = e;
        this.filterData();
      },
      (err) => {
        this.activeChatListWithAgents = [];
        this._snackBarService.open(this._translateService.instant("snackbar.Error-Getting-Active-Chats-with-Agents"), "err");
      }
    );
  }
  getAllActiveChatsWithBots() {
    this._httpService.getAllActiveChatsWithBots().subscribe(
      (e) => {
        this.activeChatListWithBots = e;
      },
      (err) => {
        this._snackBarService.open(this._translateService.instant("snackbar.Error-Getting-Active-Chats-with-Bots"), "err");
        this.activeChatListWithBots = [];
      }
    );
  }
  filterData() {
    this.filteredData = [];
    if (this.selectedQueues.length == 0) {
      this.filteredData = this.activeChatListWithAgents;
    } else {
      this.selectedQueues.forEach((data) => {
        this.activeChatListWithAgents.forEach((chat) => {
          if (data.queueId == chat.queueId) this.filteredData.push(chat);
        });
      });
    }
  }
  changeTeam()
  {
    this.selectedQueues=[];
    this.getAllActiveChatsWithTeam(this.selectedTeam,[]);
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
    if(this.timerSubscription)
    this.timerSubscription.unsubscribe();
  }

  onItemSelect(item: any) {
  }
  OnItemDeSelect(item: any) {
  }
  onSelectAll(items: any) {
  }
  onDeSelectAll(items: any) {
    console.log(items);
  }
  changeData() {
    this.selectedQueues = [];
  }
}
