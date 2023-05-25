import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-call-controls',
  templateUrl: './call-controls.component.html',
  styleUrls: ['./call-controls.component.scss']
})
export class CallControlsComponent implements OnInit {

  fullView = true;
  constructor(public dialogRef: MatDialogRef<CallControlsComponent>) { }

  ngOnInit() {
  }
  cancel() {
    this.dialogRef.close();
  }
}
