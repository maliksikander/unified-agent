import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "timeDurationFromParticipant"
})
export class timeDurationFromParticipantPipe implements PipeTransform {
  transform(participants: any): any {
    let participant;
    if (Array.isArray(participants.Participant)) {
      participant = participants.Participant[0];
    } else {
      participant = participants.Participant;
    }
    let startTime = new Date(participant.startTime);
    let endTime = new Date(participant.stateChangeTime);
    if (startTime && endTime) {
      const min = Math.abs(startTime.getMinutes() - endTime.getMinutes());
      const hours = Math.abs(startTime.getHours() - endTime.getHours());
      const seconds = Math.abs(startTime.getSeconds() - endTime.getSeconds());

      let result = hours != 0 ? hours + "h " + min + "m " + seconds + "s" : min + "m " + seconds + "s";
      return result;
    } else {
      return "N/A";
    }
  }
}
