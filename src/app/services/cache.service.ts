import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class cacheService {

    agent = { agentDetails: {}, agentPresence: {} }

    constructor(){
        
    }

}