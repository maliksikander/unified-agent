import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { SwUpdate } from "@angular/service-worker";
import { finesseService } from "./services/finesse.service";
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

  constructor(private updates: SwUpdate, public _finesseService: finesseService, private _router: Router, private _isLoggedInservice: isLoggedInService, private _sharedService: sharedService) { }

  ngOnInit() {
    this._router.events.subscribe((event: any) => {
      if (event.url) {
        this.currentRoute = event.url;
      }
    });
    let customerSchema: any;
    let channelTypes: any;
    try {
      customerSchema = JSON.parse(localStorage.getItem("customerSchema"));
      channelTypes = JSON.parse(localStorage.getItem("channelTypes"));
    } catch (e) { }
    if (customerSchema) {
      this._sharedService.schema = customerSchema;
    }
    if (channelTypes) {
      this._sharedService.channelTypeList = channelTypes;
    }

    this.checkForAppUpdates();

  }

  // checks for the update of pwa app
  checkForAppUpdates() {
   try{
    this.updates.available.subscribe((event) => {
      if (confirm("An update is available, please refresh the App to fetch updates")) {
        this.updates.activateUpdate().then(() => location.reload());
      }
    });
  }catch(err){}
  }

}
