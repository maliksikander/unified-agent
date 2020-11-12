import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { appConfigService } from './appConfig.service';

@Injectable({
    providedIn: 'root'
})

export class httpService {

    baseUrl;
    constructor(private _appConfigService : appConfigService, private _httpClient: HttpClient) {}


    login(user): Observable<any> {
        return this._httpClient.post<any>(this.baseUrl + "/api/login", user, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        })
    }

}







