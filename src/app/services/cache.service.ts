import { Injectable } from "@angular/core";
import { IKeycloakUser, IAgentPresence } from "../models/User/Interfaces";
import { httpService } from "./http.service";
import { pullModeService } from "./pullMode.service";
import { sharedService } from "./shared.service";

@Injectable({
  providedIn: "root"
})
export class cacheService {
  agent: IKeycloakUser;
  agentPresence: IAgentPresence;
  agentFcmkey = null;
  isMobileDevice : boolean = false;

  constructor(private _httpService: httpService, private _pullModeService: pullModeService, private _sharedService: sharedService) {
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

  cacheCustomerSchema() {
    this._httpService.getCustomerSchema().subscribe((res) => {
      // let temp = res.filter((item) => item.key != "isAnonymous");
      const schema = res.sort((a, b) => {
        return a.sortOrder - b.sortOrder;
      });
      this._sharedService.schema = schema;
      try{
      localStorage.setItem("customerSchema", JSON.stringify(schema));
      }
      catch(e){}
    });
  }

  loadPullModeList() {
    this._pullModeService.getPullModeList();
  }

}
