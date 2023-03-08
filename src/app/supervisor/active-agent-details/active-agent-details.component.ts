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
  teamIds:any=[];
  constructor(
    private _translateService: TranslateService,
    private _httpService: httpService,
    private _snackBarService: snackbarService,
    private _cacheService: cacheService
  ) {}

  ngOnInit() {
    // this._httpService.getAllQueues().subscribe((e) => {
    //   this.queuesList = e;
    // },(err)=>
    // {
    //   this._snackBarService.open(this._translateService.instant('snackbar.Error-Getting-Queues-List'),'err');
    // });
    this.supervisedTeams = this._cacheService.agent.supervisedTeams;
    if (this.supervisedTeams.length != 0) {
      this.selectedTeam = this.supervisedTeams[0].teamId;
      this.supervisedTeams.forEach((team)=>
      {
        this.teamIds.push(team.teamId);
      })

      this._httpService.getAllMRDs().subscribe(
        (e) => {
          this.MRDsList = e;
        },
        (err) => {
          this._snackBarService.open(this._translateService.instant("snackbar.Error-Getting-MRDs-List"), "err");
        }
      );
      console.log("inserted",this.teamSelected)

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
    }
  }

  getAllActiveAgentDetails(teamSelected) {
    this._httpService.getAllActiveAgentsDetails(teamSelected).subscribe(
      (e) => {
        this.activeAgentsDetails = e;
      },
      (err) => {
        this._snackBarService.open(this._translateService.instant("snackbar.Error-Getting-Active-Agent-Details"), "err");
        this.activeAgentsDetails = {};
      }
    );
  }
  // getAllActiveAgentsDetailsOnQueue(queueId)
  // {
  //   this._httpService.getAllActiveAgentsDetailsOnQueue(queueId).subscribe((e) => {
  //     this.activeAgentsDetails = e;
  //   },(err)=>
  //   {
  //     this._snackBarService.open(this._translateService.instant('snackbar.Error-Getting-Active-Agent-Details'),'err');
  //     this.activeAgentsDetails ={};
  //   });
  // }
  filterData() {
    // console.log("Filter Selected for Queued Chats", this.FilterSelected);
    if (this.teamSelected == "all") {
      this.getAllActiveAgentDetails(this.teamIds);
    } else {
      let teams = [];
      teams.push(this.teamSelected);
      this.getAllActiveAgentDetails(teams);
    }
  }

  ngOnDestroy() {
    this.timerSubscription.unsubscribe();
  }
}
