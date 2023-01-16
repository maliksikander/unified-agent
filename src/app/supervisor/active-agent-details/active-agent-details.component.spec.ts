import { HttpErrorResponse } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { of } from "rxjs";
import { ActiveAgentDetailsComponent } from "./active-agent-details.component";

describe("ActiveAgentDetailsComponent", () => {
  let component: any;
  let _httpService: any;
  let _snackBarService: any;
  let translateService: TranslateService;

  describe("when all APIs gives error", () => {
    beforeEach(async () => {
      _httpService = {
        getAllMRDs: jest.fn(() => {
          return of(() => {
            throw HttpErrorResponse;
          });
        }),
        getAllQueues: jest.fn(() => {
          return of(() => {
            throw HttpErrorResponse;
          });
        }),
        getAllActiveAgentsDetails: jest.fn(() => {
          return of(() => {
            throw HttpErrorResponse;
          });
        }),
        getAllActiveAgentsDetailsOnQueue: jest.fn((queueId) => {
          return of(() => {
            throw HttpErrorResponse;
          });
        })
      };

      component = new ActiveAgentDetailsComponent(translateService, _httpService, _snackBarService);
      component.ngOnInit();

      afterEach(async () => {
        component.ngOnDestroy();
      });
    });
    it("http functions to be called", () => {
      expect(_httpService.getAllMRDs).toHaveBeenCalled();
      expect(_httpService.getAllQueues).toHaveBeenCalled();
      expect(component.queueSelected).toBe("all");
      component.getAllActiveAgentDetails();
      expect(_httpService.getAllActiveAgentsDetails).toHaveBeenCalled();
    });

    it("QueueList and MRDsList should be Empty Array", () => {
      expect(component).toBeTruthy();
      expect(component.queuesList.length).toBe(0);
      expect(component.MRDsList.length).toBe(0);
      expect(component.queueSelected).toBe("all");
    });

    it("activeAgentsDetails should be empty object", () => {
      expect(component).toBeTruthy();
      expect(Object.keys(component.activeAgentsDetails).length).toBe(0);

    });
  });

  describe("when both all apis returns data ", () => {
    beforeEach(async () => {
      _httpService = {
        getAllMRDs: jest.fn(() => {
          return of([1, 2, 3]);
        }),
        getAllQueues: jest.fn(() => {
          return of([1, 2, 3]);
        }),
        getAllActiveAgentsDetails: jest.fn(() => {
          return of({ key: "value" });
        }),
        getAllActiveAgentsDetailsOnQueue: jest.fn((queueId) => {
          return of(() => {
            var obj = { key: "value" };
            return obj;
          });
        })
      };
      component = new ActiveAgentDetailsComponent(translateService, _httpService, _snackBarService);
      component.ngOnInit();
    });

    it("QueueList and MRDsList arrays length should be 3", () => {
      expect(component).toBeTruthy();
      console.log("ist", component.queuesList);
      expect(component.queuesList.length).toBe(3);
      expect(component.MRDsList.length).toBe(3);
      expect(component.queueSelected).toBe("all");
    });

    it("activeAgentsDetails object length should be 1", () => {
      expect(component).toBeTruthy();
      console.log("omponent.activeAgentsDetails", component.activeAgentsDetails);
      component.getAllActiveAgentDetails();
      expect(Object.keys(component.activeAgentsDetails).length).toBe(1);
    });
    it("getAllActiveAgentsDetailsOnQueue function should be called with the 'queueSelected'  ", () => {
      expect(component).toBeTruthy();
      component.queueSelected = 1234;
      component.filterData();
      expect(_httpService.getAllActiveAgentsDetailsOnQueue).toHaveBeenCalledWith(component.queueSelected);
    });
  });
});
