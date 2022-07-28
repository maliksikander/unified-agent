import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, FormControl, Validators } from "@angular/forms";
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from "@angular/material";
import { map } from "rxjs/operators";
import { cacheService } from "src/app/services/cache.service";
import { httpService } from "src/app/services/http.service";
import { sharedService } from "src/app/services/shared.service";

@Component({
  selector: "app-create-label",
  templateUrl: "./create-label.component.html",
  styleUrls: ["./create-label.component.scss"]
})
export class CreateLabelComponent implements OnInit {
  constructor(
    private _httpService: httpService,
    private _cacheService: cacheService,
    private _sharedService: sharedService,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CreateLabelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  name = new FormControl("", [Validators.required, Validators.maxLength(100)], this.ValidateNameDuplication.bind(this));
  open: boolean = false;
  nameToBeMatched;
  formTitle:string='Add Label'
  buttonTitle:string='Create'
  currentColor = "#a9a9a9";
  labelColorCode = [
    "#f34f1b",
    "#f58231",
    "#bfef45",
    "#3cb44b",
    "#42d4f4",
    "#039be6",
    "#7c87ce",
    "#f032e6",
    "#f6bf26",
    "#9A6324",
    "#a9a9a9",
    "#000000b5"
  ];

  ngOnInit() {
    if (this.data.action == "update") {
      this.currentColor = this.data.label.colorCode;
      this.nameToBeMatched = this.data.label.name;
      this.formTitle='Update Label'
      this.buttonTitle='Update'
      this.name.patchValue(this.data.label.name);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveLabel() {
    let obj = {
      name: this.name.value,
      colorCode: this.currentColor
    };

    if (this.data.action == "update") {
      this.updateLabel(obj);

    } else {
      this.createLabel(obj);
    }
  }
  createLabel(obj)
  {
    obj["createdBy"] = this._cacheService.agent.username;
      this._httpService.createLabel(obj).subscribe(
        (e) => {
          this._sharedService.Interceptor("Label Created", "succ");
          this.dialogRef.close({ event: "refresh" });
          this._sharedService.serviceChangeMessage({msg:"update-labels"});
        },
        (error) => {
          this._sharedService.Interceptor(error.error, "err");
        }
      );
  }
  updateLabel(obj)
  {
    obj["updatedBy"] = this._cacheService.agent.username;
    this._httpService.updateLabel(this.data.label._id, obj).subscribe(
      (e) => {
        this._sharedService.Interceptor("Label Updated", "succ");
        this.dialogRef.close({ event: "refresh" });
        this._sharedService.serviceChangeMessage({msg:"update-labels"});
      },
      (error) => {
        this._sharedService.Interceptor(error.error, "err");
      }
    );
  }

  ValidateNameDuplication(control: AbstractControl) {
    return this._httpService.getLabels().pipe(
      map((e) => {
        const labels = e;
        console.log("labels==>",e);
        console.log("control.value==>",control.value);
        console.log("this.data.action",this.data.action);
        if (this.data.action == "new" && labels && labels.find((e) => e.name == control.value)) {
          console.log("true")
          return { validName: true };
        }

        if (this.data.action == "update") {
          const labels2 = labels;

          const attrIndex = labels2.findIndex((e) => e.name == this.nameToBeMatched);
          labels2.splice(attrIndex, 1);

          if (labels2.find((e) => e.name == control.value)) {
            return { validName: true };
          }
        }
      })
    );

    return null;
  }
}
