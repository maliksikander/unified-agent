import {Component, Input, OnInit} from '@angular/core';
import {FilePreviewComponent} from '../../file-preview/file-preview.component';
import {appConfigService} from '../../services/appConfig.service';
import {MatDialog} from '@angular/material';
import {snackbarService} from '../../services/snackbar.service';
import {sharedService} from '../../services/shared.service';



@Component({
  selector: 'app-message-type-view',
  templateUrl: './message-type-view.component.html',
  styleUrls: ['./message-type-view.component.scss']
})
export class MessageTypeViewComponent implements OnInit {
  @Input() messageType: any;
  @Input() messageBody: any;
  @Input() messageHeader: any;
  @Input() messageTypeData: any;
  dispayVideoPIP = true;
  conversationSettings: any;

  constructor(public _appConfigService: appConfigService,  private dialog: MatDialog, private _snackbarService: snackbarService, private _sharedService: sharedService
  ) {
  }

  ngOnInit() {
    if (navigator.userAgent.indexOf("Firefox") != -1) {
      this.dispayVideoPIP = false;
    }
    this.conversationSettings = this._sharedService.conversationSettings;

  }

  filePreviewOpener(url, fileName, type) {
    url = this._appConfigService.config.FILE_SERVER_URL + '/api/downloadFileStream' + new URL(url).search;

    const dialogRef = this.dialog.open(FilePreviewComponent, {
      maxHeight: '100vh',
      maxWidth: '100%',
      height: 'auto',
      width: 'auto',
      data: {fileName: fileName, url: url, type: type}
    });
    dialogRef.afterClosed().subscribe((result: any) => {
    });
  }

  videoPIP(id) {
    try {
      const video: any = document.getElementById(id);
      video.requestPictureInPicture().then((pictureInPictureWindow) => {
        pictureInPictureWindow.addEventListener("resize", () => false);
      });
    } catch (err) {
      this._snackbarService.open("PIP not supported in this browser", "succ");
      console.error(err);
    }
  }

}
