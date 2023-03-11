import { Component, Input, OnInit } from "@angular/core";
import { snackbarService } from "src/app/services/snackbar.service";
import { TranslateService } from "@ngx-translate/core";
import { httpService } from "../../services/http.service";
import { cacheService } from "../../services/cache.service";
import { Subscription, timer } from "rxjs";
import { map, retry } from "rxjs/operators";

@Component({
  selector: "app-active-agent-details",
  templateUrl: "./active-agent-details.component.html",
  styleUrls: ["./active-agent-details.component.scss"]
})
export class ActiveAgentDetailsComponent implements OnInit {
  timerSubscription: Subscription;
  agentSearch = "";
  teamSelected = "all";
  queuesList: Array<any> = [];
  MRDsList: Array<any> = [];
  labels: Array<any> = [];
  agentMRD = ["chat", "voice", "video", "email"];
  activeAgentsDetails: any = {};
  supervisedTeams: any = [];
  selectedTeam: any = "";
  teamIds: any = [];

  constructor(
    private _translateService: TranslateService,
    private _httpService: httpService,
    private _snackBarService: snackbarService,
    private _cacheService: cacheService
  ) {}

  ngOnInit() {
    // to set default filter of all teams selected
    this.supervisedTeams = this._cacheService.agent.supervisedTeams;
    if (this.supervisedTeams && this.supervisedTeams.length != 0) {
      this.selectedTeam = this.supervisedTeams[0].teamId;
      this.supervisedTeams.forEach((team) => {
        this.teamIds.push(team.teamId);
      });

      this.getAllMrds();
      this.startRefeshTimer();
    }
  }

  // to get all mrd from RE
  getAllMrds() {
    this._httpService.getAllMRDs().subscribe(
      (e) => {
        this.MRDsList = e;
      },
      (err) => {
        this._snackBarService.open(this._translateService.instant("snackbar.Error-Getting-MRDs-List"), "err");
        console.error("[getAllMrds] Error :", err);
      }
    );
  }

  // to start timer using rxjs `timer`
  startRefeshTimer() {
    try {
      this.timerSubscription = timer(0, 10000)
        .pipe(
          map(() => {
            if (this.teamSelected == "all") {
              this.getAllActiveAgentDetails(this.teamIds);
            } else {
              let teams = [];
              teams.push(this.teamSelected);
              this.getAllActiveAgentDetails(teams);
            }
          }, retry())
        )
        .subscribe();
    } catch (err) {
      console.error("[startRefeshTimer] Error :", err);
    }
  }

  // to get agent activity detail from reporting connector
  getAllActiveAgentDetails(teamSelected) {
    this._httpService.getAllActiveAgentsDetails(teamSelected).subscribe(
      (res) => {
        this.activeAgentsDetails = res;
      },
      (err) => {
        this._snackBarService.open(this._translateService.instant("snackbar.Error-Getting-Active-Agent-Details"), "err");
        this.activeAgentsDetails = {};
        console.error("[getAllActiveAgentDetails] Error :", err);
      }
    );
  }

  // to filter data on the basis of selected teams
  filterData() {
    try {
      if (this.teamSelected == "all") {
        this.getAllActiveAgentDetails(this.teamIds);
      } else {
        let teams = [];
        teams.push(this.teamSelected);
        this.getAllActiveAgentDetails(teams);
      }
    } catch (err) {
      console.error("[filterData] Error :", err);
    }
  }

  ngOnDestroy() {
    if (this.timerSubscription) this.timerSubscription.unsubscribe(); // to unsubscribe from the rxjs timer
  }
}
