import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class pullModeService {

    subscribedList: any = [];

    private _subscribedListListener: BehaviorSubject<any> = new BehaviorSubject([]);

    public readonly subscribedListListener: Observable<any> = this._subscribedListListener.asObservable();

    constructor() {

    }

    updateSubscribedList(list) {
        this.subscribedList = list;
        this._subscribedListListener.next(this.subscribedList);
    }

}