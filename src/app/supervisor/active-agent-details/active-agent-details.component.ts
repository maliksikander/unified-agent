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
  MRDsList:Array<any>=[];
  labels: Array<any> = [];
  agentMRD = ['chat', 'voice', 'video', 'email']
  activeAgentsDetails:any={};
  constructor(private _translateService:TranslateService, private _httpService: httpService,private _snackBarService:snackbarService) { }

  ngOnInit() {

    this._httpService.getAllQueues().subscribe((e) => {
      this.queuesList = e;
    },(err)=>
    {
      this._snackBarService.open(this._translateService.instant('snackbar.Error-Getting-Queues-List'),'err');
    });
    this._httpService.getAllMRDs().subscribe((e) => {
      this.MRDsList = e;
    },(err)=>
    {
      this._snackBarService.open(this._translateService.instant('snackbar.Error-Getting-MRDs-List'),'err');
    });

    this.timerSubscription = timer(0, 10000)
    .pipe(
      map(() => {
        if(this.queueSelected=='all')
        {
          this.getAllActiveAgentDetails();
        }
        else
        {
          this.getAllActiveAgentsDetailsOnQueue(this.queueSelected);
        }

  }, retry())
  )
  .subscribe();
  }

  getAllActiveAgentDetails()
  {
    this._httpService.getAllActiveAgentsDetails().subscribe((e) => {
      this.activeAgentsDetails = e;
    },(err)=>
    {
      this._snackBarService.open(this._translateService.instant('snackbar.Error-Getting-Active-Agent-Details'),'err');
      this.activeAgentsDetails ={};
    });
  }
  getAllActiveAgentsDetailsOnQueue(queueId)
  {
    this._httpService.getAllActiveAgentsDetailsOnQueue(queueId).subscribe((e) => {
      this.activeAgentsDetails = e;
    },(err)=>
    {
      this._snackBarService.open(this._translateService.instant('snackbar.Error-Getting-Active-Agent-Details'),'err');
      this.activeAgentsDetails ={};
    });
  }
  filterData() {
    // console.log("Filter Selected for Queued Chats", this.FilterSelected);
    if (this.queueSelected == "all") {
      this.getAllActiveAgentDetails();
    } else {
      this.getAllActiveAgentsDetailsOnQueue(this.queueSelected);
    }
  }

  ngOnDestroy() {
    this.timerSubscription.unsubscribe();
  }
}

