import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { appConfigService } from 'src/app/services/appConfig.service';

@Component({
  selector: 'app-grafana',
  templateUrl: './grafana.component.html',
  styleUrls: ['./grafana.component.scss']
})
export class GrafanaComponent implements OnInit {

  constructor(public sanitizer: DomSanitizer, private _appConfigService: appConfigService) { }

  ngOnInit() {
    this.grafanaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this._appConfigService.config.GRAFANA_DASHBOARD_URL);

  }
  grafanaUrl: SafeResourceUrl;
  // url: string = "https://cim.expertflow.com/grafana/d/OAdgP4onz/grafana-supervisor-dash?orgId=1&from=1640493464169&to=1640579864169";

}
