import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()

export class appConfigService {

  // configUrl = "../../../assets/config.json";
  public config = { GAT_URL: "", SOCKET_URL: "" }

  constructor(private _httpClient: HttpClient) { }

  loadConfig() {


  }
}
