import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class cacheService {

    agentdetails: any = {};
    agentPresence: any = {};
    
    agent = { details: this.agentdetails, presence: this.agentPresence }

    constructor() {

    }

}