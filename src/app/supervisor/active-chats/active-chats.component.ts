import { Component, OnInit } from "@angular/core";
// import { ConfirmationDialogComponent } from "../../new-components/confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material";
import { Router } from "@angular/router";
import { httpService } from "../../services/http.service";
import { cacheService } from "../../services/cache.service";
import { pullModeService } from "src/app/services/pullMode.service";
import { sharedService } from "src/app/services/shared.service";
import { socketService } from "src/app/services/socket.service";

import { ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { Subscription, timer } from "rxjs";
import { map, retry } from "rxjs/operators";

import { snackbarService } from "src/app/services/snackbar.service";
import { TranslateService } from "@ngx-translate/core";
import { TopicParticipant } from "src/app/models/User/Interfaces";

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
  message = "hide";
  ascending: boolean = false;
  sortOrder: "asc" | "desc" = "asc";
  constructor(
    // private dialog: MatDialog,
    private _translateService: TranslateService,
    private _httpService: httpService,
    private route: ActivatedRoute,
    private _snackBarService: snackbarService,
    private _cacheService: cacheService,
    private _sharedService: sharedService,
    private dialog: MatDialog,
    public _pullModeservice: pullModeService,
    private _socketService: socketService,
    private _router: Router
  ) {}

  ngOnInit(): void {

    this.filter = this.route.snapshot.queryParamMap.get("filter") ? this.route.snapshot.queryParamMap.get("filter") : "agents";
    if (this.filter == "agents") {
      this.FilterSelected = "agents";
    } else if (this.filter == "bots") {
      this.FilterSelected = "bots";
    }

    this.supervisedTeams = this._cacheService.agent.supervisedTeams;
    if (this.supervisedTeams && this.supervisedTeams.length > 0) {
      this.selectedTeam = this.supervisedTeams[0].teamId;
      this.settings = {
        text: "All Queues",
        selectAllText: "Select All",
        unSelectAllText: "UnSelect All",
        classes: "myclass custom-class",
        enableSearchFilter: false,
        badgeShowLimit: 1,
        primaryKey: "queueId"
      };
    } else {
      this.FilterSelected = "bots";
    }
    this.startRefreshTimer();
  }

  toggleSorting() {
    // Toggle the sorting order
    this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
  }
  
  SilentMonitor(_channelSession) {
    let obj = {
      topicParticipant: new TopicParticipant("AGENT", this._cacheService.agent, _channelSession.conversationId, "SILENT_MONITOR", "SUBSCRIBED"),
      agentId: this._cacheService.agent.id,
      channelSession: _channelSession
    };
    this._socketService.emit("JoinAsSilentMonitor", obj);
    this._router.navigate(["customers"]);
  }

  startRefreshTimer() {
    try {
      this.timerSubscription = timer(0, 10000)
        .pipe(
          map(() => {
            if (this.FilterSelected == "agents" && this.supervisedTeams && this.supervisedTeams.length > 0)
              this.getAllActiveChatsWithTeam(this.selectedTeam, []);
            else if (this.FilterSelected == "bots") this.getAllActiveChatsWithBots();
          }, retry())
        )
        .subscribe();
    } catch (err) {
      console.error("[startRefeshTimer] Error :", err);
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
        console.error("[getAllActiveChatsWithTeam] Error :", err);
      }
    );
  }

  getAllActiveChatsWithBots() {
    this._httpService.getAllActiveChatsWithBots().subscribe(
      (e) => {
        this.activeChatListWithBots = e;
        for (let data of this.activeChatListWithBots) {
          data.chats.sort((a, b) => {
            if (this.sortOrder === "asc") {
              return a.activeSince - b.activeSince;
            } else {
              return b.activeSince - a.activeSince;
            }
          });
        }
      },
      (err) => {
        this._snackBarService.open(this._translateService.instant("snackbar.Error-Getting-Active-Chats-with-Bots"), "err");
        this.activeChatListWithBots = [];
        console.error("[getAllActiveChatsWithBots] Error :", err);
      }
    );
  }


  filterData() {
    try {
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
      
      // Sort the filteredData array in descending order by activeSince property
      for (let data of this.filteredData) {
        data.chats.sort((a, b) => {
          if (this.sortOrder === "asc") {
            return a.activeSince - b.activeSince;
          } else {
            return b.activeSince - a.activeSince;
          }
        });
      }
    } catch (err) {
      console.error("[filterData] Error :", err);
    }
  }

  // team selection change callback event
  onTeamChange() {
    this.selectedQueues = [];
    this.getAllActiveChatsWithTeam(this.selectedTeam, []);
  }

  // answered by selection change callback event
  onAnsweredByfilterChange(e) {
    try {
      if (e.value == "agents")
        if (this.supervisedTeams && this.supervisedTeams.length > 0) {
          this.getAllActiveChatsWithTeam(this.selectedTeam, []);
        } else if (e.value == "bots") this.getAllActiveChatsWithBots();
    } catch (err) {
      console.error("[onAnsweredByfilterChange] Error :", err);
    }
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) this.timerSubscription.unsubscribe();
  }

  onItemSelect(item: any) {}
  OnItemDeSelect(item: any) {}
  onSelectAll(items: any) {}
  onDeSelectAll(items: any) {}

  // closeChat() {
  //   const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
  //     width: "490px",
  //     panelClass: "confirm-dialog",
  //     data: {
  //       header: this._translateService.instant("snackbar.Close-Topic"),
  //       message: this._translateService.instant("snackbar.sure-to-close-this-topic")
  //     }
  //   });
  //   dialogRef.afterClosed().subscribe((result) => {});
  // }
}
