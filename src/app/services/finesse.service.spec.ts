import { sharedService } from "./shared.service";
import { finesseService } from "./finesse.service";
var jest: any;

describe("Finesse service", () => {
  let component;

  let _snackbarService;
  let _cacheService;
  let _sharedService;
  let _socketService;
  let _appConfigService;
  let _translateService;
  let _httpService;
  let mockAgentPresence;
  _sharedService = sharedService;

  beforeEach(() => {
    mockAgentPresence = {
      agent: {
        participantType: "CCUser",
        id: "78abc779-e5a3-4843-b2d2-9b2d737da96c",
        keycloakUser: {
          id: "78abc779-e5a3-4843-b2d2-9b2d737da96c",
          firstName: "Raza",
          lastName: "Ellahi",
          roles: ["agent"],
          username: "raza",
          permittedResources: null,
          realm: "university"
        },
        associatedRoutingAttributes: [
          {
            routingAttribute: {
              id: "62065945f924a64cbb3aa33e",
              name: "WhatsApp",
              description: "only for whatsapp chat",
              type: "BOOLEAN",
              defaultValue: 1
            },
            value: 1
          },
          {
            routingAttribute: {
              id: "61ef080f1a814b4eaf1e8974",
              name: "english",
              description: null,
              type: "PROFICIENCY_LEVEL",
              defaultValue: 3
            },
            value: 5
          }
        ]
      },
      state: {
        name: "NOT_READY",
        reasonCode: null
      },
      stateChangeTime: 1645535237783,
      agentMrdStates: [
        {
          mrd: {
            id: "61fbd9ee6a69285958659f4d",
            name: "Faizan-MRD",
            description: "Faizan mrd desc",
            interruptible: true,
            maxRequests: 5
          },
          state: "NOT_READY",
          stateChangeTime: 1645535237775,
          lastReadyStateChangeTime: 639057660000
        },
        {
          mrd: {
            id: "62065705f924a64cbb3aa30a",
            name: "WhatsApp",
            description: "for whatsapp chat only",
            interruptible: true,
            maxRequests: 5
          },
          state: "NOT_READY",
          stateChangeTime: 1645535237775,
          lastReadyStateChangeTime: 639057660000
        },
        {
          mrd: {
            id: "620d05baf924a64cbb3aa58d",
            name: "VOICE",
            description: "for cisco finesse",
            interruptible: true,
            maxRequests: 1
          },
          state: "NOT_READY",
          stateChangeTime: 1645535237775,
          lastReadyStateChangeTime: 639057660000
        },
        {
          mrd: {
            id: "61ef07df1a814b4eaf1e8972",
            name: "Chat",
            description: "chat mrd",
            interruptible: true,
            maxRequests: 3
          },
          state: "NOT_READY",
          stateChangeTime: 1645535237775,
          lastReadyStateChangeTime: 639057660000
        }
      ]
    };

    component = new finesseService(
      _snackbarService,
      _appConfigService,
      _sharedService,
      _cacheService,
      _socketService,
      _httpService,
      _translateService
    );
  });

  describe("handlePresence", () => {
    // it("should call subscribeToCiscoEvents when subscription is not already done", () => {
    //   spyOn(component, "subscribeToCiscoEvents");

    //   component.isAlreadysubscribed = false;

    //   component.handlePresence(mockAgentPresence);

    //   expect(component.subscribeToCiscoEvents).toHaveBeenCalled();
    // });

    // it("should not call subscribeToCiscoEvents when subscription is already done", () => {
    //   spyOn(component, "subscribeToCiscoEvents");
    //   spyOn(component, "changeFinesseState");

    //   component.isAlreadysubscribed = true;

    //   component.handlePresence(mockAgentPresence);

    //   expect(component.subscribeToCiscoEvents).not.toHaveBeenCalled();
    // });

    // it("should not call subscribeToCiscoEvents when voice mrd is not configured", () => {
    //   spyOn(component, "subscribeToCiscoEvents");
    //   spyOn(component, "changeFinesseState");

    //   delete mockAgentPresence.agentMrdStates[2];
    //   component.handlePresence(mockAgentPresence);

    //   expect(component.subscribeToCiscoEvents).not.toHaveBeenCalled();
    // });

    // it("should call changeFinesseState when voice mrd is configured and not already subscribed and ignore state also false", () => {
    //   spyOn(component, "subscribeToCiscoEvents");
    //   spyOn(component, "changeFinesseState");

    //   component.isAlreadysubscribed = true;
    //   component.ignoreAgentState = false;

    //   component.handlePresence(mockAgentPresence);

    //   expect(component.changeFinesseState).toHaveBeenCalled();
    // });

    // it("should not call changeFinesseState when voice mrd is configured and not already subscribed but need to ignore the state", () => {
    //   spyOn(component, "subscribeToCiscoEvents");
    //   spyOn(component, "changeFinesseState");

    //   component.isAlreadysubscribed = true;
    //   component.ignoreAgentState = true;

    //   component.handlePresence(mockAgentPresence);

    //   expect(component.changeFinesseState).not.toHaveBeenCalled();
    // });
  });

  describe("isVoiceMrdExists", () => {
    // it("should return true when mrd list contains voice mrd in it", () => {
    //   expect(component.isVoiceMrdExists(mockAgentPresence.agentMrdStates)).toBeTruthy();
    // });

    // it("should return false when mrd list does not contains voice mrd in it", () => {
    //   delete mockAgentPresence.agentMrdStates[2];

    //   expect(component.isVoiceMrdExists(mockAgentPresence.agentMrdStates)).not.toBeTruthy();
    // });
  });
});
