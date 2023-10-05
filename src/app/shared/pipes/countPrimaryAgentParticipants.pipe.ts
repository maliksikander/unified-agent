import { Pipe, PipeTransform } from "@angular/core";
import { socketService } from "src/app/services/socket.service";

@Pipe({ name: "countPrimaryAgentPartcipants", pure: true })
export class countPrimaryAgentPartcipantsPipe implements PipeTransform {
  transform(participants: any): any {
    let bool = false;
       participants.forEach((participant) => {
        console.log("participant  d ",participant)

      if(participant.role == 'PRIMARY')
      {
        console.log("primary founfd  d ")
        bool=true;
        return 
      }
    });
    return bool
  }
}