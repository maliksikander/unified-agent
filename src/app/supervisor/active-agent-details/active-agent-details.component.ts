import {Component, Input, OnInit} from '@angular/core';
import { snackbarService } from "src/app/services/snackbar.service";
import { TranslateService } from "@ngx-translate/core";
import { httpService } from "../../services/http.service";
import { Subscription, timer } from "rxjs";
import { map, retry } from "rxjs/operators";

@Component({
  selector: 'app-active-agent-details',
  templateUrl: './active-agent-details.component.html',
  styleUrls: ['./active-agent-details.component.scss']
})
export class ActiveAgentDetailsComponent implements OnInit {
  timerSubscription:Subscription
  agentSearch = "";
  queueSelected = "all";
  queuesList:Array<any>=[];
  filteredData = [];
  labels: Array<any> = [];
  agentMRD = ['chat', 'voice', 'video', 'email']
  activeAgentsDetails:Object ={}
  constructor(private _translateService:TranslateService, private _httpService: httpService,private _snackBarService:snackbarService) { }

  ngOnInit() {

    this._httpService.getAllQueues().subscribe((e) => {
      this.queuesList = e;
    },(err)=>
    {
      this._snackBarService.open(this._translateService.instant('snackbar.Error-Getting-Queues-List'),'err');
    });

    this.timerSubscription = timer(0, 50000)
    .pipe(
      map(() => {
        if(this.queueSelected=='all')
        {
          this._httpService.getAllActiveAgentsDetails().subscribe((e) => {
            this.activeAgentsDetails = e;
          },(err)=>
          {
            this._snackBarService.open(this._translateService.instant('snackbar.Error-Getting-Active-Agent-Details'),'err');
          });
        }
        else
        {
          this._httpService.getAllActiveAgentsDetailsOnQueue(this.queueSelected).subscribe((e) => {
            this.activeAgentsDetails = e;
          },(err)=>
          {
            this._snackBarService.open(this._translateService.instant('snackbar.Error-Getting-Active-Agent-Details'),'err');
          });
        }
   
  }, retry())
  )
  .subscribe();
  }
  filterData() {
    // console.log("Filter Selected for Queued Chats", this.FilterSelected);
    if (this.queueSelected == "all") {
      this._httpService.getAllActiveAgentsDetails().subscribe((e) => {
        this.activeAgentsDetails = e;
      },(err)=>
      {
        this._snackBarService.open(this._translateService.instant('snackbar.Error-Getting-Active-Agent-Details'),'err');
      });
    } else {
      this._httpService.getAllActiveAgentsDetailsOnQueue(this.queueSelected).subscribe((e) => {
        this.activeAgentsDetails = e;
      },(err)=>
      {
        this._snackBarService.open(this._translateService.instant('snackbar.Error-Getting-Active-Agent-Details'),'err');
      });
    }
  }

  ngOnDestroy() {
    this.timerSubscription.unsubscribe();
  }
}

