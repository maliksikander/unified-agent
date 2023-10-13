import { Pipe, PipeTransform } from "@angular/core";
import { socketService } from "src/app/services/socket.service";

@Pipe({ name: "countAgentPartcipants", pure: true })
export class countAgentPartcipantsPipe implements PipeTransform {
  transform(participants: any, participantRoles: any): any {
    let count = 0;
    console.log("participants are ", participants);

    console.log("participantRoles are ", participantRoles);
    if (participants) {
      participants.forEach((participant) => {
        console.log("participant  d ", participant);

        if (participantRoles.includes(participant.role)) {
          count++;
        }
      });
    }
    console.log("count is",count)
    return count;
  }
}
