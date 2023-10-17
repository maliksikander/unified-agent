import { HttpErrorResponse } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { of, throwError } from "rxjs";
import { InteractionsComponent } from "./interactions.component";

describe("InteractionsComponent", () => {
  let component: any;
  let _socketService: any;
  let _shareredService: any;
  let dialogMock: any;
  let _httpService: any;
  let _finneseService: any;
  let _cacheService: any;
  let _snackBarService: any;
  let _appConfigService: any;
  let snackBar: any;
  let translateService: TranslateService;
  let _sipService: any
  let channelSession = {
    channel: {
      channelConnector: {
        channelProviderConfigs: [
          { key: "FACEBOOK-API-KEY", value: "qq" },
          { key: "FACEBOOK-HOST-URL", value: "qq" }
        ]
      }
    }
  };
  let serviceIdentifier

  describe("when only post data api returns data ", () => {
    beforeEach(async () => {
      const errorResponse = new HttpErrorResponse({
        error: "test 404 error",
        status: 404
      });

      _httpService = {
        getPostData: jest.fn((postId,serviceIdentifier) => {
          return throwError(() => errorResponse);
        }),
      };

      component = new InteractionsComponent(
        _shareredService,
        _cacheService,
        _socketService,
        dialogMock,
        _snackBarService,
        _appConfigService,
        _httpService,
        _finneseService,
        snackBar,
        _sipService,
        translateService,

      );
    });

    it("postComments should be null", () => {
      expect(component).toBeTruthy();
      let postId = 1;
      let selectedCommentId = 2;
      component.fullPostViewData(serviceIdentifier, postId, selectedCommentId);
      expect(component.postData).toBeDefined();
    });

    it("fullPostView should be truthy", () => {
      let postId = 9;
      let selectedCommentId = 10;
      component.fullPostViewData(serviceIdentifier, postId, selectedCommentId);
      expect(component.fullPostView).toBeFalsy();
    });
  });

  describe("when post data api returns data ", () => {
    beforeEach(async () => {
      _httpService = {
        getPostData: jest.fn(() => {
          return of([{ data: "comments" }]);
        }),
      };
      component = new InteractionsComponent(
        _shareredService,
        _cacheService,
        _socketService,
        dialogMock,
        _snackBarService,
        _appConfigService,
        _httpService,
        _finneseService,
        snackBar,
        _sipService,
        translateService,

      );
    });

    it("postData and postComments should be defined", () => {
      expect(component).toBeTruthy();
      let postId = 1;
      let selectedCommentId = 2;
      component.fullPostViewData(serviceIdentifier, postId, selectedCommentId);
      expect(component.postData).toBeDefined();
    });

    it("fullPostView should be falsy", () => {
      let postId = 9;
      let selectedCommentId = 10;
      component.fullPostViewData(serviceIdentifier, postId, selectedCommentId);
      expect(component.fullPostView).toBeFalsy();
    });
  });

  describe("when postViewApi returns error", () => {
    beforeEach(async () => {
      const errorResponse = new HttpErrorResponse({
        error: "test 404 error",
        status: 404
      });
      _httpService = {
        getPostData: jest.fn((postId,serviceIdentifier) => {
          return throwError(() => errorResponse);
        })
      };
      component = new InteractionsComponent(
        _shareredService,
        _cacheService,
        _socketService,
        dialogMock,
        _snackBarService,
        _appConfigService,
        _httpService,
        _finneseService,
        snackBar,
        _sipService,
        translateService
      );
    });

    it("Both postData and postComments should be null", () => {
      expect(component).toBeTruthy();
      let postId = 1;
      let selectedCommentId = 2;
      component.fullPostViewData(serviceIdentifier, postId, selectedCommentId);
      expect(component.selectedCommentId).toBe(null);
      expect(component.postData).toBe(null);
    });

    it("fullPostView should be falsy", () => {
      let postId = 9;
      let selectedCommentId = 10;
      component.fullPostViewData(serviceIdentifier, postId, selectedCommentId);
      expect(component.fullPostView).toBeFalsy();
    });
  });

  describe("Quoted Reply", () => {
    beforeEach(async () => {
      component = new InteractionsComponent(
        _shareredService,
        _cacheService,
        _socketService,
        dialogMock,
        _snackBarService,
        _appConfigService,
        _httpService,
        _finneseService,
        snackBar,
        _sipService,
        translateService
      );
    });

    it("originalMessageId should be defined", () => {
      let message = {
        id: "123"
      };
      component.onQuotedReply(message);
      expect(component.originalMessageId).toEqual(message.id);
    });
    it("quoted message should be defined", () => {
      let message = {
        id: "123"
      };
      component.onQuotedReply(message);
      expect(component.quotedMessage).toEqual(message);
    });
  });
});
