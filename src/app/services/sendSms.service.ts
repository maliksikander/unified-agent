import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})

export class smsDialogDataService{
    private dialogData: any;

    storeDialogData(data: any) {
      this.dialogData = data;
    }
  
    getStoredDialogData() {
      return this.dialogData;
    }
  
    clearDialogData() {
      this.dialogData = null;
    }

}