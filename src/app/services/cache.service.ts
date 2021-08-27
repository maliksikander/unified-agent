import { Injectable } from "@angular/core";
import { IKeycloakUser, IAgentPresence } from "../models/User/Interfaces";

@Injectable({
  providedIn: "root"
})
export class cacheService {
  agent: IKeycloakUser;
  agentPresence: IAgentPresence;

  constructor() {
    this.resetCache();
  }

  resetCache() {
    this.agent = { id: "", firstName: "", lastName: "", roles: [] };
    this.agentPresence = {
      agent: { id: "", keycloakUser: { id: "", firstName: "", lastName: "", roles: [] } },
      state: { name: null, reasonCode: null },
      stateChangeTime: ""
    };
  }

}
