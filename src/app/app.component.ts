import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'unified-agent-gadget';

  currentRoute: string;

  constructor(private _router: Router) {
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

