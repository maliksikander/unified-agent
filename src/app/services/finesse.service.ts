import { Injectable } from "@angular/core";
declare var executeCommands;

@Injectable({
    providedIn: "root"
})


export class finesseService {

    clientCallback = function (event) {
        console.log("raza callback ", event);
    }

    loginCommand() {

        let command = {
            "action": "login",
            "parameter":
            {
                "loginId": "716531162",
                "password": "12345",
                "extension": "1130",
                "clientCallbackFunction": this.clientCallback
            }
        };
        executeCommands(command);
    }

    constructor() {

        this.loginCommand();
    }

} 