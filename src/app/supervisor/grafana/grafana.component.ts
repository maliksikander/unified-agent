import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-grafana',
  templateUrl: './grafana.component.html',
  styleUrls: ['./grafana.component.scss']
})
export class GrafanaComponent implements OnInit {

  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.grafanaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);

  }
  grafanaUrl: SafeResourceUrl;
  url: string = "https://cim.expertflow.com/grafana/d/OAdgP4onz/grafana-supervisor-dash?orgId=1&from=1640493464169&to=1640579864169";

}
