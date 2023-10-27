import { Pipe, PipeTransform } from "@angular/core";
import { socketService } from "src/app/services/socket.service";

@Pipe({ name: "countAgentPartcipants", pure: true })
export class countAgentPartcipantsPipe implements PipeTransform {
  transform(participants: any, participantRoles: any): any {
    let count = 0;
    if (participants) {
      participants.forEach((participant) => {
        if (participantRoles.includes(participant.role)) {
          count++;
        }
      });
    }
    return count;
  }
}
