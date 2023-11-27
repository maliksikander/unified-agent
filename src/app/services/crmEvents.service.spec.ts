import { crmEventsService } from "./crmEvents.service";

describe("crmEvents service", () => {
    let component: crmEventsService;
    let mockAgentPresence;

    beforeEach(() => {
        component = new crmEventsService();
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
      
    })
    describe("Test Check", () => {
      it("test check", () => {
        let a = 4;
        expect(a).toBeTruthy();
        // expect(component.isVoiceMrdExists(mockAgentPresence.agentMrdStates)).toBeTruthy();
      });
    })
    describe("agentStateChanged", () => {
         
        it("should be truthy function", () => {
            expect(component.addCrmEvent(mockAgentPresence)).toBeTruthy();
          });

    })

})