import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class appConfigService {
  configUrl = "assets/config.json";
  public config = { GAT_URL: "", SOCKET_URL: "", ENV: "", FILE_SERVER_URL: "", CIM_CUSTOMER_URL: "", BOT_FRAMEWORK_URL: "" };

  constructor(private _httpClient: HttpClient) { }

  loadConfig() {
    return this._httpClient
      .get(this.configUrl)
      .toPromise()
      .then((e: any) => {
        this.config.GAT_URL = e.GAT_URL;
        this.config.SOCKET_URL = e.SOCKET_URL;
        this.config.ENV = e.ENV;
        this.config.FILE_SERVER_URL = e.FILE_SERVER_URL;
        this.config.CIM_CUSTOMER_URL = e.CIM_CUSTOMER_URL;
        this.config.BOT_FRAMEWORK_URL = e.BOT_FRAMEWORK_URL;
      });
  }
}
