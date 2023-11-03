import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "getSenderName", pure: true })
export class getSenderNamePipe implements PipeTransform {
  transform(sender: any, associatedCustomer: any, onlyFirstTwoLetters?: boolean): any {
    let name;

    if (sender.type.toLowerCase() == "customer") {
      name = associatedCustomer.firstName;
    } else if (sender.type.toLowerCase() == "agent") {
      name = sender.senderName;
    } else if (sender.type.toLowerCase() == "bot") {
      name = "bot";
    } else if (sender.type.toLowerCase() == "ivr") {
      name = "ivr";
    } else {
      return " ";
    }
    if (onlyFirstTwoLetters) {
      name = name.substring(0, 2).toUpperCase();
    }
    return name;
  }
}
