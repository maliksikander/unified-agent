import { PipeTransform, Pipe } from "@angular/core";
@Pipe({
    name: "filterAgentParticipants",
    pure: true
})
export class filterAgentParticipantClass implements PipeTransform {
    transform(participants: any, role: string): any[] {
console.log("//..// ",participants);
        const data = participants.filter((participant) => {
            return participant.role.toLowerCase() == role.toLocaleLowerCase();
        });

        return data;

    }
}
