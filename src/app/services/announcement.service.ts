import { Injectable } from "@angular/core";
import { httpService } from "./http.service";
import { sharedService } from "./shared.service";
import { cacheService } from "./cache.service";
import { Subject } from "rxjs";
@Injectable({
    providedIn: "root"
})
export class announcementService {
    announcementList: any = []; // contains the list which are subscribed by the agent


    constructor(private _sharedService: sharedService, private _httpService: httpService, private _cacheService: cacheService,) {
        
    }
    countUnreadAnnouncementSubject = new Subject();
    countUnreadAnnouncement() {
        this.countUnreadAnnouncementSubject.next(true);
      }
    getAnnouncementList() {
        // const arr1 = [1, 2, 3, 4];
        //  const queryParams = `?teamIds=${arr1.join(',')}`;
        const teamIds = this._cacheService.agent.supervisedTeams.map(item => item.teamId);
        teamIds.push(this._cacheService.agent.userTeam.teamId);
        
        const uniqueTeamIds = Array.from(new Set(teamIds));
          
          // Create a Set to remove duplicates
         // const uniqueTeamIds = [...new Set(teamIds)];
        //let teamIds = this._cacheService.agent.supervisedTeams.concat(this._cacheService.agent.userTeam.teamId);
        console.log("%%%%%% CONCAT %%%%%%%",teamIds);
        this._httpService.getAnnouncementsByTeamIds(uniqueTeamIds,"active").subscribe((data) => {
            console.log("data", data);
            this.announcementList = data.filter((item) => item.superviserId !== this._cacheService.agent.id);
            console.log(" this.announcementList====>>>",  this.announcementList)
            this.countUnreadAnnouncement()


        });
    }


    addCreatedAnnoucement(announcement) {
        if (announcement.superviserId != this._cacheService.agent.id) {
            this.announcementList.push(announcement);
            this.countUnreadAnnouncement()
        }
    }


    removeAnnoucement(announcement) {
        this.announcementList = this.announcementList.filter((item) => item.id !== announcement.id);
        this.countUnreadAnnouncement()

    }
}
