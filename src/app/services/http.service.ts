import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { appConfigService } from "./appConfig.service";

@Injectable({
  providedIn: "root"
})
export class httpService {
  apiEndpoints;

  constructor(public _appConfigService: appConfigService, private _httpClient: HttpClient) {
    this.apiEndpoints = {
      login: "/api/v1/agent/login",
      customerSchema: "/api/v1/agent/customer-schema",
      customers: "/api/v1/agent/customer",
      labels: "/api/v1/agent/labels",
    };
  }

  login(user): Observable<any> {
    return this._httpClient.post<any>(this._appConfigService.config.GAT_URL + this.apiEndpoints.login, user, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  getCustomerSchema(): Observable<any> {
    return this._httpClient.get<any>(this._appConfigService.config.GAT_URL + this.apiEndpoints.customerSchema, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  getCustomer(): Observable<any> {
    return this._httpClient.get<any>(this._appConfigService.config.GAT_URL + this.apiEndpoints.customers, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  getLabels(): Observable<any> {
    return this._httpClient.get<any>(this._appConfigService.config.GAT_URL + this.apiEndpoints.labels, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  getCustomerById(): Observable<any> {
    return this._httpClient.get<any>(this._appConfigService.config.GAT_URL + this.apiEndpoints.customers+'?id=s60d5239c48f4c2323b04df42', {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

}
