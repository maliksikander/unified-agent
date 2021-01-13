import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { appConfigService } from './appConfig.service';

@Injectable({
    providedIn: 'root'
})

export class httpService {

    apiEndpoints;

    constructor(public _appConfigService: appConfigService, private _httpClient: HttpClient) {

        this.apiEndpoints = {
            login: "/api/v1/agent/login"
        }
    }

    login(user): Observable<any> {

        return this._httpClient.post<any>(this._appConfigService.config.GAT_URL + this.apiEndpoints.login, user, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        })
    }

}







