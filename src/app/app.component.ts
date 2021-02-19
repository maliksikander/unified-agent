import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { appConfigService } from './services/appConfig.service';
import { sharedService } from './services/shared.service';
import { socketService } from './services/socket.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'unified-agent-gadget';
  requests = [{name:"farhan",
  channel: 'web'}];

  currentRoute: string;

  constructor(private _router: Router, private _sharedService: sharedService) {

    this._sharedService.serviceCurrentMessage.subscribe((e) => {

      // if (e.msg == 'openRequestHeader') {
      //   this.requests.push(e.data);
      // }
    })

  }

  ngOnInit() {

    this._router.events
      .subscribe((event: any) => {
        if (event.url) {
          this.currentRoute = event.url;
        }
      });
  }

  requestHeaderEvents(topicId) {

    this.removeRequestFromRequestArray(topicId);
  }


  removeRequestFromRequestArray(topicId) {
    let index = this._sharedService.getIndexFromTopicId(topicId, this.requests);
    this._sharedService.spliceArray(index, this.requests);
  }

}

