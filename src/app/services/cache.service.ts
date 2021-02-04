import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class cacheService {

    private agent: any = {};
    private agentPresence: any = {};
    
    agentDetails = { agent: this.agent, presence: this.agentPresence }

    constructor() {

    }

}