import { Injectable } from "@angular/core";
import { httpService } from "./http.service";
import { sharedService } from "./shared.service";
import { cacheService } from "./cache.service";
import { Subject } from "rxjs";
@Injectable({
    providedIn: "root"
})
export class announcementService {
    announcementList: any = [];
    announcementNotificationList: any = [];
    timer: any = null;


    constructor(
        private _sharedService: sharedService,
        private _httpService: httpService,
        private _cacheService: cacheService,
    ) { }

    countUnreadAnnouncementSubject = new Subject();

    countUnreadAnnouncement() {
        this.countUnreadAnnouncementSubject.next(true);
    }

    getAnnouncementList() {
        const teamIds = this._cacheService.agent.supervisedTeams.map(item => item.teamId);
        teamIds.push(this._cacheService.agent.userTeam.teamId);
        const uniqueTeamIds = Array.from(new Set(teamIds));
        // Create a Set to remove duplicates
        // const uniqueTeamIds = [...new Set(teamIds)];
        //let teamIds = this._cacheService.agent.supervisedTeams.concat(this._cacheService.agent.userTeam.teamId);
        this._httpService.getAnnouncementsByTeamIds(uniqueTeamIds, "active").subscribe((data) => {

            //console.log(data, "#####DATAW###")
            this.announcementList = data.filter((item) => item.supervisorId!== this._cacheService.agent.id);
            // this.announcementList = data.filter((item) => {
            //     if (!(item.superviserId === this._cacheService.agent.id)) { item }
            //    // else { item }
            // });
           // this.announcementList = this.announcementList.filter((item) => item.id !== announcement.id);
            console.log(this.announcementList, "===========>>>")
            this.countUnreadAnnouncement()
        });
    }

    addCreatedAnnoucement(announcement) {
        if (announcement.supervisorId != this._cacheService.agent.id) {
            this.announcementList.push(announcement);
            this.countUnreadAnnouncement();
            this.announcementNotificationList.push(announcement);
            if (!this.timer)
                this.timer = setTimeout(() => {
                    this.announcementNotificationList = []
                    this.timer = null;
                }, 60000);
        }
    }

    removeAnnoucement(announcement) {
        this.announcementList = this.announcementList.filter((item) => item.id !== announcement.id);
        this.announcementNotificationList = this.announcementNotificationList.filter((item) => item.id !== announcement.id);
        this.countUnreadAnnouncement();

    }

    removeAnnoucementFromNotificationList(announcement) {
        this.announcementNotificationList = this.announcementNotificationList.filter((item) => item.id !== announcement.id);
        // console.log("announcement",announcement);
        // console.log("this.announcementNotificationList",this.announcementNotificationList)
    }
}
