import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()

export class appConfigService {

    configUrl = "../../assets/config.json";
    public GAT_URL: string = "";

    constructor(private _httpClient: HttpClient) { }

    loadConfig() {
        this._httpClient.get(this.configUrl).subscribe((e: any) => { this.GAT_URL = e.GAT_URL })
    }
}





