import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { sharedService } from './services/shared.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'unified-agent-gadget';

  currentRoute: string;
  activeRequestHeader: boolean = false;
  requestHeaderData;

  constructor(private _router: Router, private _sharedService: sharedService) {

    this._sharedService.serviceCurrentMessage.subscribe((e) => {

      if (e.msg == 'openRequestHeader') {
        this.activeRequestHeader = true;
        this.requestHeaderData = e.data;
      }
      console.log("i am called " , e)

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

}

