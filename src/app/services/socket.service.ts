import { Injectable } from "@angular/core";
import * as io from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { appConfigService } from './appConfig.service';
import { cacheService } from './cache.service';
import { sharedService } from './shared.service';
import { promise } from "protractor";

@Injectable({
    providedIn: 'root'
})

export class socketService {

    socket: any;
    uri: string;
    conversations: any = [];

    private _conversationsListener: BehaviorSubject<any> = new BehaviorSubject([]);

    public readonly conversationsListener: Observable<any> = this._conversationsListener.asObservable();

    constructor(private _appConfigService: appConfigService, private _cacheService: cacheService, private _sharedService: sharedService) {
    }


    connectToSocket() {
        this.uri = this._appConfigService.config.SOCKET_URL;

        console.log("username------ " + this._cacheService.agentDetails.agent.username)

        this.socket = io.connect(this.uri, {
            query: { 
              //  token: this._cacheService.agent.details.access_token, 
                agent: JSON.stringify( this._cacheService.agentDetails.agent)
                
            }
        }).on('error', function (err) {
            console.error(err);
        });

        this.listen('agentPresence').subscribe((res: any) => {
            console.log(res);
            this._cacheService.agentDetails.presence = res;
            this._sharedService.serviceChangeMessage({ msg: 'stateChanged', data: null });
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
            sameTopicIdObj.messages.push(res.message);
            if (res.message.header.sender.type != 'agent') { ++sameTopicIdObj.unReadCount; }
        } else {
            this.conversations.push({ topicId: res.topicId, messages: [res.message], unReadCount: 1 });
        }

        this._sharedService.serviceChangeMessage({ msg: 'onMessage', data: null });
        this._conversationsListener.next(this.conversations);

    }


}