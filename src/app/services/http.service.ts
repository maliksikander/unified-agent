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
      login: "/agent/login",
      customerSchema: "/cim/customerSchema",
      schemaTypes: "/cim/attributeTypes",
      customers: "/cim/customers",
      labels: "/agent/labels",
      userPreference: "/agent/userPreference",
      pullModeList: "/agent/pull-mode-list",
      fileServer: "/file-engine/api/downloadFileStream?filename=",
      uploadFile: "/file-engine/api/uploadFileStream"
    };
  }

  login(user): Observable<any> {
    return this._httpClient.post<any>(this._appConfigService.config.GAT_URL + this.apiEndpoints.login, user, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  ///////////////////////// Customer Schema CRUD /////////////////

  getSchemaTypes(): Observable<any> {
    return this._httpClient.get<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.schemaTypes}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  getCustomerSchema(): Observable<any> {
    return this._httpClient.get<any>(this._appConfigService.config.CIM_CUSTOMER_URL + this.apiEndpoints.customerSchema, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  addCustomerSchema(obj): Observable<any> {
    return this._httpClient.post<any>(this._appConfigService.config.CIM_CUSTOMER_URL + this.apiEndpoints.customerSchema, obj, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  updateCustomerSchema(data, id): Observable<any> {
    return this._httpClient.put<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customerSchema}/${id}`, data, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  deleteCustomerSchema(id): Observable<any> {
    return this._httpClient.delete<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customerSchema}/${id}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  changeCustomerSchemaOrder(schema): Observable<any> {
    return this._httpClient.put<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customerSchema}Order`, schema, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  ////////////////// Customer CRUD ////////////////

  getCustomers(limit, offset, sort, query): Observable<any> {
    return this._httpClient.get<any>(
      `${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customers}?limit=${limit}&offset=${offset}&sort=${
        sort.field ? sort.field + ":" + sort.order : ""
      }&query=${query.field ? query.field + ":" + query.value : ""}`,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
        })
      }
    );
  }

  createCustomer(customer): Observable<any> {
    return this._httpClient.post<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customers}`, customer, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  getCustomerById(id): Observable<any> {
    return this._httpClient.get<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customers}/${id}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  updateCustomerById(id, obj): Observable<any> {
    return this._httpClient.put<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customers}/${id}`, obj, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  deleteCustomerById(id): Observable<any> {
    return this._httpClient.delete<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customers}/${id}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  ///////////////////////////

  getUserPreference(id): Observable<any> {
    return this._httpClient.get<any>(this._appConfigService.config.GAT_URL + this.apiEndpoints.userPreference + "?user_Id=" + id, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  changeUserPreference(obj): Observable<any> {
    return this._httpClient.post<any>(this._appConfigService.config.GAT_URL + this.apiEndpoints.userPreference, obj, {
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

  createLabel(label): Observable<any> {
    return this._httpClient.post<any>(this._appConfigService.config.GAT_URL + this.apiEndpoints.labels, label, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  updateLabel(id, label): Observable<any> {
    return this._httpClient.put<any>(this._appConfigService.config.GAT_URL + this.apiEndpoints.labels + "?id=" + id, label, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  deleteLabel(id): Observable<any> {
    return this._httpClient.delete<any>(this._appConfigService.config.GAT_URL + this.apiEndpoints.labels + "?id=" + id, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  getPullModeList(): Observable<any> {
    return this._httpClient.get<any>(this._appConfigService.config.GAT_URL + this.apiEndpoints.pullModeList, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  getChannelLogo(id: string): Observable<Blob> {
    return this._httpClient.get(this._appConfigService.config.FILE_SERVER_URL + this.apiEndpoints.fileServer + id, { responseType: "blob" });
  }

  uploadToFileEngine(data): Observable<any> {
    return this._httpClient.post<any>(`${this._appConfigService.config.FILE_SERVER_URL}${this.apiEndpoints.uploadFile}`, data, {
      headers: new HttpHeaders({})
    });
  }
}
