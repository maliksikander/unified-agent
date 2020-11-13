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
            token:  "/v1/agent/token"
        }
    }

    userAuthentication(user): Observable<any> {

        return this._httpClient.get<any>(this._appConfigService.GAT_URL+this.apiEndpoints.token, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            params: { username: user.username, password: user.password }
        })
    }

}







