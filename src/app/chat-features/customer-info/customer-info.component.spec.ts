import { CustomerInfoComponent } from "./customer-info.component";
import { sharedService } from "src/app/services/shared.service";
import { TranslateService } from "@ngx-translate/core";
const mockCustomerSchema: any = require("../../mocks/customerSchema.json");
const mockTopicData: any = require("../../mocks/topicData.json");

describe("CustomerInfoComponent", () => {
  let component: CustomerInfoComponent;
  let _socketService: any;
  let _shareredService: any;
  let routerMock: any;
  let dialogMock: any;
  let _httpService: any;
  let _finneseService: any;
  let _cacheService: any;
  let _snackBarService: any;
  let _translateService: TranslateService;
  let _sipService: any;

  beforeEach(() => {
    _shareredService = sharedService;
    _shareredService.schema = mockCustomerSchema;

    component = new CustomerInfoComponent(
      routerMock,
      _shareredService,
      _socketService,
      dialogMock,
      _httpService,
      _finneseService,
      _sipService,
      _cacheService,
      _snackBarService,
      _translateService
    );
  });

  describe("Test: Get media channels", () => {
    it("should extract media channles if customer and customer schema both are valid", () => {
      component.customer = mockTopicData.customer;

      expect(component.getMediaChannels()).toBeTruthy();
    });
  });

  describe("Convert customer object to form data object", () => {
    it("should extract fields from customer object", () => {
      let obj = component.getProfileFormData(mockTopicData.customer);

      expect(obj).toBeTruthy();
    });

    it("should not extract extra fields from customer object", () => {
      let obj = component.getProfileFormData(mockTopicData.customer);

      expect(obj).not.toContain(jasmine.objectContaining({ key: "_id" }));
    });

    it("should not includes empty values in it", () => {
      let obj = component.getProfileFormData(mockTopicData.customer);

      expect(obj).not.toContain(jasmine.objectContaining({ value: "" }));
    });
  });
});
