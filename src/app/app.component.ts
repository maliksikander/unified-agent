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

  currentRoute: string;
  requestHeaderState: boolean = false;
  requestHeaderData;

  constructor(private _router: Router, private _sharedService: sharedService, private _socketService: socketService) {

    this._sharedService.serviceCurrentMessage.subscribe((e) => {

      if (e.msg == 'openRequestHeader') {
        this.requestHeaderState = true;
        this.requestHeaderData = e.data;
      }
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

  requestHeaderEvents(requestHeaderState) {
    this.requestHeaderState = requestHeaderState;
  }

}

