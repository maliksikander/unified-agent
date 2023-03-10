import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { appConfigService } from "src/app/services/appConfig.service";
import { cacheService } from "src/app/services/cache.service";

@Component({
  selector: "app-grafana",
  templateUrl: "./grafana.component.html",
  styleUrls: ["./grafana.component.scss"]
})
export class GrafanaComponent implements OnInit {
  constructor(public sanitizer: DomSanitizer, private _appConfigService: appConfigService, private _cacheService: cacheService) {}
  grafanaUrl: SafeResourceUrl;
  ngOnInit() {
    let userId = this.getUserId();
    this.grafanaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      new URL(this._appConfigService.config.GAT_URL).origin +
        `/grafana/d/0GEdiaunk/supervisor_dashboard_cim?orgId=1&refresh=10s&var-userLoggedInId=${userId}`
    );
  }

  getUserId() {
    let agent = JSON.parse(JSON.stringify(this._cacheService.agent));
    return agent.id;
  }
}
