import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss']
})
export class FilePreviewComponent implements OnInit {

  constructor(private domSanitizer: DomSanitizer, public dialogRef: MatDialogRef<FilePreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
 
  }

  ngOnInit() {
  }

  close(): void {
    this.dialogRef.close();
  }

}
