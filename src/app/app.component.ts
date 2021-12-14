import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { httpService } from "./services/http.service";
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

  constructor(
    private _router: Router,
    private _isLoggedInservice: isLoggedInService,
    private _sharedService: sharedService,
    private _httpService: httpService
  ) {}

  ngOnInit() {
    this._router.events.subscribe((event: any) => {
      if (event.url) {
        this.currentRoute = event.url;
      }
    });
    this.loadCustomerSchema();
  }

  loadCustomerSchema() {
    this._httpService.getCustomerSchema().subscribe((res) => {
      let temp = res.filter((item) => item.key != "isAnonymous");
      this._sharedService.schema = temp.sort((a, b) => {
        return a.sortOrder - b.sortOrder;
      });
    });
  }
}
