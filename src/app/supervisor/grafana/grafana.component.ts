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
  grafanaUrl: SafeResourceUrl;

  constructor(public sanitizer: DomSanitizer, private _appConfigService: appConfigService, private _cacheService: cacheService) {}

  ngOnInit() {
    let teamsId = this.getTeamsId();
    this.grafanaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      new URL(this._appConfigService.config.GAT_URL).origin +
        `/grafana/d/0GEdiaunk/supervisor_dashboard_cim?orgId=1&refresh=10s&var-teamIds=${teamsId}`
    );
  }

  getTeamsId() {
    try {
      let agent = JSON.parse(JSON.stringify(this._cacheService.agent));
      let supervisorTeams = agent.supervisedTeams ? agent.supervisedTeams : [];
      let teamsId = [];
      supervisorTeams.forEach((item) => {
        teamsId.push(item.teamId);
      });
      return this.convertArrayToString(teamsId);
    } catch (err) {
      console.error("Error [getTeamsId] :", err);
    }
  }

  convertArrayToString(teamsId) {
    try {
      if (teamsId.length > 0) {
        const teamsIdStr: string = teamsId.join(",");
        return teamsIdStr;
      }
      return "";
    } catch (err) {
      console.error("Error [convertArrayToString] :", err);
    }
  }
}
