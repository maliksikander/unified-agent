import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { snackbarService } from './services/snackbar.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'unified-agent-gadget';

  currentRoute: string;

  constructor(private _router: Router, private _snackbarService : snackbarService ) {
  }

  ngOnInit() {

    this._router.events
      .subscribe((event: any) => {
        if (event.url) {
          this.currentRoute = event.url;
        }
      });

      this._snackbarService.open('hello', 'err')

  }

}

