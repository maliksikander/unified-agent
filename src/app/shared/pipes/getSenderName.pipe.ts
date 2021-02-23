import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'getSenderName', pure: true })
export class getSenderNamePipe implements PipeTransform {
    transform(sender: any, args?: any): any {

        if (sender.type.toLowerCase() == 'customer') {
            return sender.participant.linkedCustomer.associatedCustomer.firstName;
        } else if (sender.type.toLowerCase() == 'agent') {
            return sender.participant.keyCloakUser.username;
        } else {
            return " "
        }
    }
}