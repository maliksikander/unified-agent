import { Injectable } from "@angular/core";
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { appConfigService } from './appConfig.service';
import { cacheService } from './cache.service';

@Injectable({
    providedIn: 'root'
})

export class socketService {

    socket: any;
    uri: string;

    constructor(private _appConfigService: appConfigService, private _cacheService: cacheService) {
    }


    connectToSocket() {
        this.uri = this._appConfigService.config.SOCKET_URL;

        this.socket = io.connect(this.uri, {
            query: { token: this._cacheService.agent.details.access_token, agentId: this._cacheService.agent.details.username }
        }).on('error', function (err) {
            console.error(err);
        });

        this.listen('agentPresence').subscribe((res: any) => {
            console.log(res);
            this._cacheService.agent.presence = res;
        });

        this.listen('errors').subscribe((res: any) => {
            console.log("socket errors " ,res);
        });
    }

    listen(eventName: string) {

        return new Observable((res) => {
            this.socket.on(eventName, (data) => {
                res.next(data);
            });
        });
    }

    emit(eventName: string, data: any) {
        this.socket.emit(eventName, data);
    }

}