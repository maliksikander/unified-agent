import { Injectable } from "@angular/core";
import { snackbarService } from './snackbar.service';

@Injectable({
    providedIn: 'root'
})

export class sharedService {

    constructor(private _snackbarService: snackbarService) { }

    Interceptor(e, res) {

        if (res == 'err') {

            if (e.statusCode == 401) {

                this._snackbarService.open('UNAUTHORIZED USER', 'err');

            } else { this._snackbarService.open('Something went wrong', 'err') }
        }
        if (res == 'succ') {

        }
    }

}