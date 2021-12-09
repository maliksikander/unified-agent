import { Injectable } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material";

@Injectable({
  providedIn: "root"
})
export class snackbarService {
  constructor(private snackBar: MatSnackBar) { }

  open(message: string, status: string, duration?) {
    let config: MatSnackBarConfig = new MatSnackBarConfig();
    config.duration = duration ? duration : 3000;
    config.panelClass = status == "err" ? ["err-class"] : ["success-snackbar"];
    config.verticalPosition = "top";
    this.snackBar.open(message + "!", null, config);
  }

  close() {
    this.snackBar.dismiss();
  }
}
