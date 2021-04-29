import {Component, OnInit, Inject} from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatSnackBar, MatDialogRef} from '@angular/material';
import {FormControl, Validators, AbstractControl} from '@angular/forms';

@Component({
  selector: 'app-create-label-diag',
  templateUrl: './create-label-diag.component.html',
  styleUrls: ['./create-label-diag.component.scss']
})
export class CreateLabelDiagComponent implements OnInit {

  constructor(private dialog: MatDialog, public snackBar: MatSnackBar, public dialogRef: MatDialogRef<CreateLabelDiagComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  name = new FormControl('', [Validators.required, Validators.maxLength(100)], this.ValidateNameDuplication.bind(this));
  open: boolean = false;
  nameToBeMatched;
  currentColor = '#a9a9a9';
  labelColorCode = ['#f34f1b', '#f58231', '#bfef45', '#3cb44b', '#42d4f4', '#039be6', '#7c87ce', '#f032e6', '#f6bf26', '#9A6324', '#a9a9a9', '#000000b5'];
  expiry = new FormControl('', [Validators.pattern("^[0-9]*$"), Validators.required, Validators.min(1), Validators.max(99)]);

  ngOnInit() {

    if (this.data.action == 'update') {
      this.currentColor = this.data.label.color_code;
      this.nameToBeMatched = this.data.label.name;
      this.name.patchValue(this.data.label.name);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  makeObject() {

  }

  ValidateNameDuplication(control: AbstractControl) {

  }

}
