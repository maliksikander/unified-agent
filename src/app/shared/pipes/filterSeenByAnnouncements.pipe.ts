import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "filterSeenByAnnouncements" })
export class filterSeenByAnnouncementsPipe implements PipeTransform {
  transform(announcementList:any, agentId: string) {
    let seenByCount=0;
    if (agentId && announcementList) {
       announcementList.forEach(element => {
        if(element.seenBy.includes(agentId)){
         // seenByCount = seenByCount;
        }else {
          seenByCount = seenByCount + 1;
        }
        
      });
      
    }
    
    

    return seenByCount;
  }
}
