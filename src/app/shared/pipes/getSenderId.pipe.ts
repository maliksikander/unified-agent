import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "getSenderId", pure: true })
export class getSenderIdPipe implements PipeTransform {
    transform(sender: any): any {

        let id = " ";

        if (sender.type.toLowerCase() == "customer") {
            id = 'customer';
        } else if (sender.type.toLowerCase() == "agent") {
            id = sender.participant.keycloakUser.id;
        } else if (sender.type.toLowerCase() == "bot") {
            id = "bot";
        }
        return id;
    }
}
