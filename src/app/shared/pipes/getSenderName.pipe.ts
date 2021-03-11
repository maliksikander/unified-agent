import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'getSenderName', pure: true })
export class getSenderNamePipe implements PipeTransform {
    transform(sender: any, onlyFirstTwoLetters?: boolean): any {
        let name;

        if (sender.type.toLowerCase() == 'customer') {
            name = sender.participant.linkedCustomer.associatedCustomer.firstName;
        } else if (sender.type.toLowerCase() == 'agent') {
            name = sender.participant.keyCloakUser.username;
        } else if (sender.type.toLowerCase() == 'bot') {
            name = 'bot'
        } else {
            return " "
        }
        if (onlyFirstTwoLetters) {
            name = name.substring(0, 2).toUpperCase();
        }
        return name;
    }
}