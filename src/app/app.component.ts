import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { isLoggedInService } from "./services/isLoggedIn.service";
import { sharedService } from "./services/shared.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  title = "unified-agent-gadget";

  currentRoute: string;

  constructor(private _router: Router, private _isLoggedInservice: isLoggedInService) {}

  ngOnInit() {
    this._router.events.subscribe((event: any) => {
      if (event.url) {
        this.currentRoute = event.url;
      }
    });
  }
}
