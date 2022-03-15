import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { getMessaging, getToken, deleteToken } from "firebase/messaging";
import { cacheService } from "./cache.service";

@Injectable({
    providedIn: "root"
})
export class fcmService {

    constructor(private _cacheService: cacheService) {

    }

    requestPermission() {
        return new Promise((resolve, reject) => {

            const messaging = getMessaging();
            getToken(messaging,
                { vapidKey: environment.firebaseConfig.vapidKey }).then(
                    (currentToken) => {
                        if (currentToken) {
                            console.log("Hurraaa!!! we got the token.....");
                            console.log(currentToken);
                            this._cacheService.agentFcmkey = currentToken;
                            resolve("ok");
                        } else {
                            console.log('No registration token available. Request permission to generate one.');
                            reject("no permission granted")
                        }
                    }).catch((err) => {
                        console.log('An error occurred while retrieving token. ', err);
                        reject(err);
                    });
        });
    }

    deleteFcmToken() {
        return new Promise((resolve) => {
            // if (this._cacheService.isMobileDevice) {
            //     resolve("ok");
            // } else {
            const messaging = getMessaging();
            deleteToken(messaging).then((res) => {
                console.log("successfully removed fcm key ", res); resolve("ok");
            }).catch((err) => {
                console.log(err);
                resolve("ok");

            });
            //}
        });
    }


}