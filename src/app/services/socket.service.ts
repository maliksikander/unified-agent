import { Injectable } from "@angular/core";
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { appConfigService } from './appConfig.service';
import { cacheService } from './cache.service';
import { sharedService } from './shared.service';

@Injectable({
    providedIn: 'root'
})

export class socketService {

    socket: any;
    uri: string;
    conversations: any = [];

    constructor(private _appConfigService: appConfigService, private _cacheService: cacheService, private _sharedService: sharedService) {
        this.connectToSocket();
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
            console.log("socket errors ", res);
        });

        this.listen('taskRequest').subscribe((res: any) => {
            console.log("taskRequest ", res);
            this.triggerNewChatRequest(res);
        });

        this.listen('onMessage').subscribe((res: any) => {
            res.message = JSON.parse(res.message);
            this.onMessageHandler(res);
            console.log("onMessage parse s", res);
        })
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

    triggerNewChatRequest(data) {
        this._sharedService.serviceChangeMessage({ msg: 'openRequestHeader', data: data });
    }


    onMessageHandler(res) {
        let sameTopicIdObj = this.conversations.find((e) => {
            return e.topicId == res.topicId
        });

        if (sameTopicIdObj) {
            sameTopicIdObj.conversation.push(res.message);
        } else {
            this.conversations.push({ topicId: res.topicId, conversation: [res.message] });
        }
    }


}