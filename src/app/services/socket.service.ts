import { Injectable } from "@angular/core";
import { io } from "socket.io-client";
import { BehaviorSubject, Observable } from "rxjs";
import { Router } from "@angular/router";
import { appConfigService } from "./appConfig.service";
import { cacheService } from "./cache.service";
import { sharedService } from "./shared.service";
import { CimEvent } from "../models/Event/cimEvent";
import { snackbarService } from "./snackbar.service";
import { error } from "console";
import { pullModeService } from "./pullMode.service";

@Injectable({
  providedIn: "root"
})
export class socketService {
  socket: any;
  uri: string;
  conversations: any = [];
  conversationIndex = -1;
topicData = {
  "id": "15584d31-df86-4052-818f-d2bfdba5b92b",
  "customer": {
    "_id": "67b01aa5-9450-46fa-8b39-fde1bb6f7e68",
    "firstName": "John",
    "lastName": null,
    "email": null,
    "phone1": null,
    "phone2": null,
    "viberId": null,
    "facebookId": null,
    "webId": null,
    "createdBy": null,
    "updatedBy": null,
    "createdAt": null,
    "updatedAt": null,
    "isAnonymous": false,
    "__v": 0
  },
  "participants": [
    {
      "type": "BOT",
      "role": "PRIMARY",
      "participant": {
        "participantType": "TopicMonitor",
        "id": "2d8e6049-ee1b-482a-8013-4c758f893d60",
        "displayName": "Topic Monitor: 2d8e6049-ee1b-482a-8013-4c758f893d60"
      },
      "id": "cdbaa990-8172-43f5-af66-7ee71a5b3cd6",
      "joiningTime": "2021-11-08T08:37:25.775+00:00",
      "token": null,
      "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
      "isActive": true,
      "userCredentials": {},
      "state": "SUBSCRIBED",
      "stateChangedOn": "2021-11-08T08:37:25.775+00:00"
    },
    {
      "type": "CUSTOMER",
      "role": "CUSTOMER",
      "participant": {
        "participantType": "ChannelSession",
        "id": "94974af3-a6a6-4f03-b8d6-0e8c8e3b6497",
        "channel": {
          "id": "6185267a7ffc8449d4c3c1ce",
          "name": "web",
          "serviceIdentifier": "+921218",
          "tenant": {
            "id": "30f0726d-ef48-4013-8eeb-74bc2c35625f",
            "name": null
          },
          "channelConfig": {
            "id": "348b6c36-5dbf-47df-8ba4-8625f00a1785",
            "channelMode": "HYBRID",
            "conversationBot": "",
            "responseSla": 20,
            "customerActivityTimeout": 20,
            "customerIdentificationCriteria": {
              "value": null
            },
            "routingPolicy": {
              "agentSelectionPolicy": "LONGEST_AVAILABLE",
              "routeToLastAgent": true,
              "routingMode": "PUSH",
              "routingObjectId": "6172426726c3762d4f5f68fe",
              "agentRequestTtl": 20
            },
            "botId": "8b43ef12-f30b-48ce-aa03-c60d450fc042"
          },
          "channelConnector": {
            "id": "6178062f39b2a10f979a9499",
            "name": "web connector",
            "channelProviderInterface": {
              "id": "61769ad86959682449337620",
              "name": "Web Provider",
              "supportedChannelTypes": [
                {
                  "id": "6176bfde6e67cc29d93be907",
                  "name": "Web",
                  "channelLogo": "84458_4485687.png",
                  "isInteractive": true,
                  "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
                }
              ],
              "providerWebhook": "http://192.168.50.25:7000/message/receive",
              "channelProviderConfigSchema": []
            },
            "channelProviderConfigs": [],
            "tenant": {
              "id": "8773b513-6441-42bf-99d4-e243afbb3a07",
              "name": null
            }
          },
          "channelType": {
            "id": "6176bfde6e67cc29d93be907",
            "name": "Web",
            "channelLogo": "84458_4485687.png",
            "isInteractive": true,
            "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
          }
        },
        "customer": {
          "_id": "67b01aa5-9450-46fa-8b39-fde1bb6f7e68",
          "firstName": "John",
          "lastName": null,
          "email": null,
          "phone1": null,
          "phone2": null,
          "viberId": null,
          "facebookId": null,
          "webId": null,
          "createdBy": null,
          "updatedBy": null,
          "createdAt": null,
          "updatedAt": null,
          "isAnonymous": false,
          "__v": 0
        },
        "customerSuggestions": [],
        "channelData": {
          "channelCustomerIdentifier": "97962945",
          "serviceIdentifier": "+921218",
          "requestPriority": 0,
          "channelTypeCode": "webChannel",
          "additionalAttributes": []
        },
        "latestIntent": null,
        "customerPresence": {
          "value": null
        },
        "isActive": true,
        "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
        "state": "STARTED",
        "active": true
      },
      "id": "61cf275e-f736-48c9-bc56-d5f46a9dcf86",
      "joiningTime": "2021-11-08T08:37:26.203+00:00",
      "token": null,
      "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
      "isActive": true,
      "userCredentials": {},
      "state": null,
      "stateChangedOn": null
    }
  ],
  "state": "CREATED",
  "topicEvents": [
    {
      "id": "941e40c8-a318-4b04-bb51-d901759217b2",
      "name": "CHANNEL_SESSION_STARTED",
      "type": "NOTIFICATION",
      "timestamp": "2021-11-08T08:37:26.521+00:00",
      "data": {
        "participantType": "ChannelSession",
        "id": "94974af3-a6a6-4f03-b8d6-0e8c8e3b6497",
        "channel": {
          "id": "6185267a7ffc8449d4c3c1ce",
          "name": "web",
          "serviceIdentifier": "+921218",
          "tenant": {
            "id": "30f0726d-ef48-4013-8eeb-74bc2c35625f",
            "name": null
          },
          "channelConfig": {
            "id": "348b6c36-5dbf-47df-8ba4-8625f00a1785",
            "channelMode": "HYBRID",
            "conversationBot": "",
            "responseSla": 20,
            "customerActivityTimeout": 20,
            "customerIdentificationCriteria": {
              "value": null
            },
            "routingPolicy": {
              "agentSelectionPolicy": "LONGEST_AVAILABLE",
              "routeToLastAgent": true,
              "routingMode": "PUSH",
              "routingObjectId": "6172426726c3762d4f5f68fe",
              "agentRequestTtl": 20
            },
            "botId": "8b43ef12-f30b-48ce-aa03-c60d450fc042"
          },
          "channelConnector": {
            "id": "6178062f39b2a10f979a9499",
            "name": "web connector",
            "channelProviderInterface": {
              "id": "61769ad86959682449337620",
              "name": "Web Provider",
              "supportedChannelTypes": [
                {
                  "id": "6176bfde6e67cc29d93be907",
                  "name": "Web",
                  "channelLogo": "84458_4485687.png",
                  "isInteractive": true,
                  "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
                }
              ],
              "providerWebhook": "http://192.168.50.25:7000/message/receive",
              "channelProviderConfigSchema": []
            },
            "channelProviderConfigs": [],
            "tenant": {
              "id": "8773b513-6441-42bf-99d4-e243afbb3a07",
              "name": null
            }
          },
          "channelType": {
            "id": "6176bfde6e67cc29d93be907",
            "name": "Web",
            "channelLogo": "84458_4485687.png",
            "isInteractive": true,
            "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
          }
        },
        "customer": {
          "_id": "67b01aa5-9450-46fa-8b39-fde1bb6f7e68",
          "firstName": "John",
          "lastName": null,
          "email": null,
          "phone1": null,
          "phone2": null,
          "viberId": null,
          "facebookId": null,
          "webId": null,
          "createdBy": null,
          "updatedBy": null,
          "createdAt": null,
          "updatedAt": null,
          "isAnonymous": false,
          "__v": 0
        },
        "customerSuggestions": [],
        "channelData": {
          "channelCustomerIdentifier": "97962945",
          "serviceIdentifier": "+921218",
          "requestPriority": 0,
          "channelTypeCode": "webChannel",
          "additionalAttributes": []
        },
        "latestIntent": null,
        "customerPresence": {
          "value": null
        },
        "isActive": true,
        "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
        "state": "STARTED",
        "active": true
      }
    },
    {
      "id": "23a43ff2-b674-463d-9d66-01f4c73201c3",
      "name": "BOT_MESSAGE",
      "type": "MESSAGE",
      "timestamp": "2021-11-08T08:37:27.013+00:00",
      "data": {
        "id": "7a1120f8-3235-4191-9502-8884f8558ae0",
        "header": {
          "sender": {
            "type": "BOT",
            "role": "PRIMARY",
            "participant": {
              "participantType": "TopicMonitor",
              "id": "2d8e6049-ee1b-482a-8013-4c758f893d60",
              "displayName": "Topic Monitor: 2d8e6049-ee1b-482a-8013-4c758f893d60"
            },
            "id": "cdbaa990-8172-43f5-af66-7ee71a5b3cd6",
            "joiningTime": 1636360645775,
            "token": null,
            "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
            "isActive": true,
            "userCredentials": {},
            "state": "SUBSCRIBED",
            "stateChangedOn": 1636360645775
          },
          "channelData": null,
          "language": null,
          "timestamp": 1636360646969,
          "securityInfo": null,
          "stamps": null,
          "intent": null,
          "entities": null,
          "channelSession": {
            "participantType": "ChannelSession",
            "id": "94974af3-a6a6-4f03-b8d6-0e8c8e3b6497",
            "channel": {
              "id": "6185267a7ffc8449d4c3c1ce",
              "name": "web",
              "serviceIdentifier": "+921218",
              "tenant": {
                "id": "30f0726d-ef48-4013-8eeb-74bc2c35625f",
                "name": null
              },
              "channelConfig": {
                "id": "348b6c36-5dbf-47df-8ba4-8625f00a1785",
                "channelMode": "HYBRID",
                "conversationBot": "",
                "responseSla": 20,
                "customerActivityTimeout": 20,
                "customerIdentificationCriteria": {
                  "value": null
                },
                "routingPolicy": {
                  "agentSelectionPolicy": "LONGEST_AVAILABLE",
                  "routeToLastAgent": true,
                  "routingMode": "PUSH",
                  "routingObjectId": "6172426726c3762d4f5f68fe",
                  "agentRequestTtl": 20
                },
                "botId": "8b43ef12-f30b-48ce-aa03-c60d450fc042"
              },
              "channelConnector": {
                "id": "6178062f39b2a10f979a9499",
                "name": "web connector",
                "channelProviderInterface": {
                  "id": "61769ad86959682449337620",
                  "name": "Web Provider",
                  "supportedChannelTypes": [
                    {
                      "id": "6176bfde6e67cc29d93be907",
                      "name": "Web",
                      "channelLogo": "84458_4485687.png",
                      "isInteractive": true,
                      "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
                    }
                  ],
                  "providerWebhook": "http://192.168.50.25:7000/message/receive",
                  "channelProviderConfigSchema": []
                },
                "channelProviderConfigs": [],
                "tenant": {
                  "id": "8773b513-6441-42bf-99d4-e243afbb3a07",
                  "name": null
                }
              },
              "channelType": {
                "id": "6176bfde6e67cc29d93be907",
                "name": "Web",
                "channelLogo": "84458_4485687.png",
                "isInteractive": true,
                "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
              }
            },
            "customer": {
              "_id": "67b01aa5-9450-46fa-8b39-fde1bb6f7e68",
              "firstName": "John",
              "lastName": null,
              "email": null,
              "phone1": null,
              "phone2": null,
              "viberId": null,
              "facebookId": null,
              "webId": null,
              "createdBy": null,
              "updatedBy": null,
              "createdAt": null,
              "updatedAt": null,
              "isAnonymous": false,
              "__v": 0
            },
            "customerSuggestions": [],
            "channelData": {
              "channelCustomerIdentifier": "97962945",
              "serviceIdentifier": "+921218",
              "requestPriority": 0,
              "channelTypeCode": "webChannel",
              "additionalAttributes": []
            },
            "latestIntent": null,
            "customerPresence": {
              "value": null
            },
            "isActive": true,
            "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
            "state": "STARTED",
            "active": true
          }
        },
        "body": {
          "type": "PLAIN",
          "markdownText": "Welcome to Expertflow Hybrid Chat solution"
        }
      }
    },
    {
      "id": "068d2ca0-bff6-4318-a617-adcb7288ddd8",
      "name": "CUSTOMER_MESSAGE",
      "type": "MESSAGE",
      "timestamp": "2021-11-08T08:37:30.572+00:00",
      "data": {
        "id": "4515b200-406f-11ec-b464-a55184008c6c",
        "header": {
          "sender": {
            "type": "CUSTOMER",
            "role": "CUSTOMER",
            "participant": {
              "participantType": "ChannelSession",
              "id": "94974af3-a6a6-4f03-b8d6-0e8c8e3b6497",
              "channel": {
                "id": "6185267a7ffc8449d4c3c1ce",
                "name": "web",
                "serviceIdentifier": "+921218",
                "tenant": {
                  "id": "30f0726d-ef48-4013-8eeb-74bc2c35625f",
                  "name": null
                },
                "channelConfig": {
                  "id": "348b6c36-5dbf-47df-8ba4-8625f00a1785",
                  "channelMode": "HYBRID",
                  "conversationBot": "",
                  "responseSla": 20,
                  "customerActivityTimeout": 20,
                  "customerIdentificationCriteria": {
                    "value": null
                  },
                  "routingPolicy": {
                    "agentSelectionPolicy": "LONGEST_AVAILABLE",
                    "routeToLastAgent": true,
                    "routingMode": "PUSH",
                    "routingObjectId": "6172426726c3762d4f5f68fe",
                    "agentRequestTtl": 20
                  },
                  "botId": "8b43ef12-f30b-48ce-aa03-c60d450fc042"
                },
                "channelConnector": {
                  "id": "6178062f39b2a10f979a9499",
                  "name": "web connector",
                  "channelProviderInterface": {
                    "id": "61769ad86959682449337620",
                    "name": "Web Provider",
                    "supportedChannelTypes": [
                      {
                        "id": "6176bfde6e67cc29d93be907",
                        "name": "Web",
                        "channelLogo": "84458_4485687.png",
                        "isInteractive": true,
                        "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
                      }
                    ],
                    "providerWebhook": "http://192.168.50.25:7000/message/receive",
                    "channelProviderConfigSchema": []
                  },
                  "channelProviderConfigs": [],
                  "tenant": {
                    "id": "8773b513-6441-42bf-99d4-e243afbb3a07",
                    "name": null
                  }
                },
                "channelType": {
                  "id": "6176bfde6e67cc29d93be907",
                  "name": "Web",
                  "channelLogo": "84458_4485687.png",
                  "isInteractive": true,
                  "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
                }
              },
              "customer": {
                "_id": "67b01aa5-9450-46fa-8b39-fde1bb6f7e68",
                "firstName": "John",
                "lastName": null,
                "email": null,
                "phone1": null,
                "phone2": null,
                "viberId": null,
                "facebookId": null,
                "webId": null,
                "createdBy": null,
                "updatedBy": null,
                "createdAt": null,
                "updatedAt": null,
                "isAnonymous": false,
                "__v": 0
              },
              "customerSuggestions": [],
              "channelData": {
                "channelCustomerIdentifier": "97962945",
                "serviceIdentifier": "+921218",
                "requestPriority": 0,
                "channelTypeCode": "webChannel",
                "additionalAttributes": []
              },
              "latestIntent": null,
              "customerPresence": {
                "value": null
              },
              "isActive": true,
              "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
              "state": "STARTED",
              "active": true
            },
            "id": "61cf275e-f736-48c9-bc56-d5f46a9dcf86",
            "joiningTime": 1636360646203,
            "token": null,
            "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
            "isActive": true,
            "userCredentials": {},
            "state": "SUBSCRIBED",
            "stateChangedOn": null
          },
          "channelData": {
            "channelCustomerIdentifier": "97962945",
            "serviceIdentifier": "+921218",
            "requestPriority": 0,
            "channelTypeCode": "webChannel",
            "additionalAttributes": []
          },
          "language": {},
          "timestamp": 1636360718624,
          "securityInfo": {},
          "stamps": [],
          "intent": null,
          "entities": {},
          "channelSession": {
            "participantType": "ChannelSession",
            "id": "94974af3-a6a6-4f03-b8d6-0e8c8e3b6497",
            "channel": {
              "id": "6185267a7ffc8449d4c3c1ce",
              "name": "web",
              "serviceIdentifier": "+921218",
              "tenant": {
                "id": "30f0726d-ef48-4013-8eeb-74bc2c35625f",
                "name": null
              },
              "channelConfig": {
                "id": "348b6c36-5dbf-47df-8ba4-8625f00a1785",
                "channelMode": "HYBRID",
                "conversationBot": "",
                "responseSla": 20,
                "customerActivityTimeout": 20,
                "customerIdentificationCriteria": {
                  "value": null
                },
                "routingPolicy": {
                  "agentSelectionPolicy": "LONGEST_AVAILABLE",
                  "routeToLastAgent": true,
                  "routingMode": "PUSH",
                  "routingObjectId": "6172426726c3762d4f5f68fe",
                  "agentRequestTtl": 20
                },
                "botId": "8b43ef12-f30b-48ce-aa03-c60d450fc042"
              },
              "channelConnector": {
                "id": "6178062f39b2a10f979a9499",
                "name": "web connector",
                "channelProviderInterface": {
                  "id": "61769ad86959682449337620",
                  "name": "Web Provider",
                  "supportedChannelTypes": [
                    {
                      "id": "6176bfde6e67cc29d93be907",
                      "name": "Web",
                      "channelLogo": "84458_4485687.png",
                      "isInteractive": true,
                      "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
                    }
                  ],
                  "providerWebhook": "http://192.168.50.25:7000/message/receive",
                  "channelProviderConfigSchema": []
                },
                "channelProviderConfigs": [],
                "tenant": {
                  "id": "8773b513-6441-42bf-99d4-e243afbb3a07",
                  "name": null
                }
              },
              "channelType": {
                "id": "6176bfde6e67cc29d93be907",
                "name": "Web",
                "channelLogo": "84458_4485687.png",
                "isInteractive": true,
                "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
              }
            },
            "customer": {
              "_id": "67b01aa5-9450-46fa-8b39-fde1bb6f7e68",
              "firstName": "John",
              "lastName": null,
              "email": null,
              "phone1": null,
              "phone2": null,
              "viberId": null,
              "facebookId": null,
              "webId": null,
              "createdBy": null,
              "updatedBy": null,
              "createdAt": null,
              "updatedAt": null,
              "isAnonymous": false,
              "__v": 0
            },
            "customerSuggestions": [],
            "channelData": {
              "channelCustomerIdentifier": "97962945",
              "serviceIdentifier": "+921218",
              "requestPriority": 0,
              "channelTypeCode": "webChannel",
              "additionalAttributes": []
            },
            "latestIntent": null,
            "customerPresence": {
              "value": null
            },
            "isActive": true,
            "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
            "state": "STARTED",
            "active": true
          }
        },
        "body": {
          "type": "PLAIN",
          "markdownText": "hello"
        }
      }
    },
    {
      "id": "429e2d26-7a38-4459-8096-23f8f9ef282f",
      "name": "BOT_MESSAGE",
      "type": "MESSAGE",
      "timestamp": "2021-11-08T08:37:31.334+00:00",
      "data": {
        "id": "888336aa-f021-4103-bbfd-01bf913e941f",
        "header": {
          "sender": {
            "type": "BOT",
            "role": "PRIMARY",
            "participant": {
              "participantType": "TopicMonitor",
              "id": "2d8e6049-ee1b-482a-8013-4c758f893d60",
              "displayName": "Topic Monitor: 2d8e6049-ee1b-482a-8013-4c758f893d60"
            },
            "id": "cdbaa990-8172-43f5-af66-7ee71a5b3cd6",
            "joiningTime": 1636360645775,
            "token": null,
            "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
            "isActive": true,
            "userCredentials": {},
            "state": "SUBSCRIBED",
            "stateChangedOn": 1636360645775
          },
          "channelData": {
            "channelCustomerIdentifier": "97962945",
            "serviceIdentifier": "+921218",
            "requestPriority": 0,
            "channelTypeCode": "webChannel",
            "additionalAttributes": []
          },
          "language": {},
          "timestamp": 1636360718624,
          "securityInfo": {},
          "stamps": [],
          "intent": null,
          "entities": {},
          "channelSession": {
            "participantType": "ChannelSession",
            "id": "94974af3-a6a6-4f03-b8d6-0e8c8e3b6497",
            "channel": {
              "id": "6185267a7ffc8449d4c3c1ce",
              "name": "web",
              "serviceIdentifier": "+921218",
              "tenant": {
                "id": "30f0726d-ef48-4013-8eeb-74bc2c35625f",
                "name": null
              },
              "channelConfig": {
                "id": "348b6c36-5dbf-47df-8ba4-8625f00a1785",
                "channelMode": "HYBRID",
                "conversationBot": "",
                "responseSla": 20,
                "customerActivityTimeout": 20,
                "customerIdentificationCriteria": {
                  "value": null
                },
                "routingPolicy": {
                  "agentSelectionPolicy": "LONGEST_AVAILABLE",
                  "routeToLastAgent": true,
                  "routingMode": "PUSH",
                  "routingObjectId": "6172426726c3762d4f5f68fe",
                  "agentRequestTtl": 20
                },
                "botId": "8b43ef12-f30b-48ce-aa03-c60d450fc042"
              },
              "channelConnector": {
                "id": "6178062f39b2a10f979a9499",
                "name": "web connector",
                "channelProviderInterface": {
                  "id": "61769ad86959682449337620",
                  "name": "Web Provider",
                  "supportedChannelTypes": [
                    {
                      "id": "6176bfde6e67cc29d93be907",
                      "name": "Web",
                      "channelLogo": "84458_4485687.png",
                      "isInteractive": true,
                      "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
                    }
                  ],
                  "providerWebhook": "http://192.168.50.25:7000/message/receive",
                  "channelProviderConfigSchema": []
                },
                "channelProviderConfigs": [],
                "tenant": {
                  "id": "8773b513-6441-42bf-99d4-e243afbb3a07",
                  "name": null
                }
              },
              "channelType": {
                "id": "6176bfde6e67cc29d93be907",
                "name": "Web",
                "channelLogo": "84458_4485687.png",
                "isInteractive": true,
                "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
              }
            },
            "customer": {
              "_id": "67b01aa5-9450-46fa-8b39-fde1bb6f7e68",
              "firstName": "John",
              "lastName": null,
              "email": null,
              "phone1": null,
              "phone2": null,
              "viberId": null,
              "facebookId": null,
              "webId": null,
              "createdBy": null,
              "updatedBy": null,
              "createdAt": null,
              "updatedAt": null,
              "isAnonymous": false,
              "__v": 0
            },
            "customerSuggestions": [],
            "channelData": {
              "channelCustomerIdentifier": "97962945",
              "serviceIdentifier": "+921218",
              "requestPriority": 0,
              "channelTypeCode": "webChannel",
              "additionalAttributes": []
            },
            "latestIntent": null,
            "customerPresence": {
              "value": null
            },
            "isActive": true,
            "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
            "state": "STARTED",
            "active": true
          }
        },
        "body": {
          "type": "PLAIN",
          "markdownText": "Reply Y if you are ok to answer 6 questions, reply N if you want to chat with Expertflow representative. If you don't reply within 20 seconds, your chat will be automatically handed over to the Expertflow representative."
        }
      }
    },
    {
      "id": "1ed1c1af-4f8f-417c-be0a-5e3d804b518f",
      "name": "CUSTOMER_MESSAGE",
      "type": "MESSAGE",
      "timestamp": "2021-11-08T08:37:33.219+00:00",
      "data": {
        "id": "46a26c80-406f-11ec-b464-a55184008c6c",
        "header": {
          "sender": {
            "type": "CUSTOMER",
            "role": "CUSTOMER",
            "participant": {
              "participantType": "ChannelSession",
              "id": "94974af3-a6a6-4f03-b8d6-0e8c8e3b6497",
              "channel": {
                "id": "6185267a7ffc8449d4c3c1ce",
                "name": "web",
                "serviceIdentifier": "+921218",
                "tenant": {
                  "id": "30f0726d-ef48-4013-8eeb-74bc2c35625f",
                  "name": null
                },
                "channelConfig": {
                  "id": "348b6c36-5dbf-47df-8ba4-8625f00a1785",
                  "channelMode": "HYBRID",
                  "conversationBot": "",
                  "responseSla": 20,
                  "customerActivityTimeout": 20,
                  "customerIdentificationCriteria": {
                    "value": null
                  },
                  "routingPolicy": {
                    "agentSelectionPolicy": "LONGEST_AVAILABLE",
                    "routeToLastAgent": true,
                    "routingMode": "PUSH",
                    "routingObjectId": "6172426726c3762d4f5f68fe",
                    "agentRequestTtl": 20
                  },
                  "botId": "8b43ef12-f30b-48ce-aa03-c60d450fc042"
                },
                "channelConnector": {
                  "id": "6178062f39b2a10f979a9499",
                  "name": "web connector",
                  "channelProviderInterface": {
                    "id": "61769ad86959682449337620",
                    "name": "Web Provider",
                    "supportedChannelTypes": [
                      {
                        "id": "6176bfde6e67cc29d93be907",
                        "name": "Web",
                        "channelLogo": "84458_4485687.png",
                        "isInteractive": true,
                        "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
                      }
                    ],
                    "providerWebhook": "http://192.168.50.25:7000/message/receive",
                    "channelProviderConfigSchema": []
                  },
                  "channelProviderConfigs": [],
                  "tenant": {
                    "id": "8773b513-6441-42bf-99d4-e243afbb3a07",
                    "name": null
                  }
                },
                "channelType": {
                  "id": "6176bfde6e67cc29d93be907",
                  "name": "Web",
                  "channelLogo": "84458_4485687.png",
                  "isInteractive": true,
                  "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
                }
              },
              "customer": {
                "_id": "67b01aa5-9450-46fa-8b39-fde1bb6f7e68",
                "firstName": "John",
                "lastName": null,
                "email": null,
                "phone1": null,
                "phone2": null,
                "viberId": null,
                "facebookId": null,
                "webId": null,
                "createdBy": null,
                "updatedBy": null,
                "createdAt": null,
                "updatedAt": null,
                "isAnonymous": false,
                "__v": 0
              },
              "customerSuggestions": [],
              "channelData": {
                "channelCustomerIdentifier": "97962945",
                "serviceIdentifier": "+921218",
                "requestPriority": 0,
                "channelTypeCode": "webChannel",
                "additionalAttributes": []
              },
              "latestIntent": null,
              "customerPresence": {
                "value": null
              },
              "isActive": true,
              "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
              "state": "STARTED",
              "active": true
            },
            "id": "61cf275e-f736-48c9-bc56-d5f46a9dcf86",
            "joiningTime": 1636360646203,
            "token": null,
            "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
            "isActive": true,
            "userCredentials": {},
            "state": "SUBSCRIBED",
            "stateChangedOn": null
          },
          "channelData": {
            "channelCustomerIdentifier": "97962945",
            "serviceIdentifier": "+921218",
            "requestPriority": 0,
            "channelTypeCode": "webChannel",
            "additionalAttributes": []
          },
          "language": {},
          "timestamp": 1636360721224,
          "securityInfo": {},
          "stamps": [],
          "intent": null,
          "entities": {},
          "channelSession": {
            "participantType": "ChannelSession",
            "id": "94974af3-a6a6-4f03-b8d6-0e8c8e3b6497",
            "channel": {
              "id": "6185267a7ffc8449d4c3c1ce",
              "name": "web",
              "serviceIdentifier": "+921218",
              "tenant": {
                "id": "30f0726d-ef48-4013-8eeb-74bc2c35625f",
                "name": null
              },
              "channelConfig": {
                "id": "348b6c36-5dbf-47df-8ba4-8625f00a1785",
                "channelMode": "HYBRID",
                "conversationBot": "",
                "responseSla": 20,
                "customerActivityTimeout": 20,
                "customerIdentificationCriteria": {
                  "value": null
                },
                "routingPolicy": {
                  "agentSelectionPolicy": "LONGEST_AVAILABLE",
                  "routeToLastAgent": true,
                  "routingMode": "PUSH",
                  "routingObjectId": "6172426726c3762d4f5f68fe",
                  "agentRequestTtl": 20
                },
                "botId": "8b43ef12-f30b-48ce-aa03-c60d450fc042"
              },
              "channelConnector": {
                "id": "6178062f39b2a10f979a9499",
                "name": "web connector",
                "channelProviderInterface": {
                  "id": "61769ad86959682449337620",
                  "name": "Web Provider",
                  "supportedChannelTypes": [
                    {
                      "id": "6176bfde6e67cc29d93be907",
                      "name": "Web",
                      "channelLogo": "84458_4485687.png",
                      "isInteractive": true,
                      "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
                    }
                  ],
                  "providerWebhook": "http://192.168.50.25:7000/message/receive",
                  "channelProviderConfigSchema": []
                },
                "channelProviderConfigs": [],
                "tenant": {
                  "id": "8773b513-6441-42bf-99d4-e243afbb3a07",
                  "name": null
                }
              },
              "channelType": {
                "id": "6176bfde6e67cc29d93be907",
                "name": "Web",
                "channelLogo": "84458_4485687.png",
                "isInteractive": true,
                "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
              }
            },
            "customer": {
              "_id": "67b01aa5-9450-46fa-8b39-fde1bb6f7e68",
              "firstName": "John",
              "lastName": null,
              "email": null,
              "phone1": null,
              "phone2": null,
              "viberId": null,
              "facebookId": null,
              "webId": null,
              "createdBy": null,
              "updatedBy": null,
              "createdAt": null,
              "updatedAt": null,
              "isAnonymous": false,
              "__v": 0
            },
            "customerSuggestions": [],
            "channelData": {
              "channelCustomerIdentifier": "97962945",
              "serviceIdentifier": "+921218",
              "requestPriority": 0,
              "channelTypeCode": "webChannel",
              "additionalAttributes": []
            },
            "latestIntent": null,
            "customerPresence": {
              "value": null
            },
            "isActive": true,
            "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
            "state": "STARTED",
            "active": true
          }
        },
        "body": {
          "type": "PLAIN",
          "markdownText": "no"
        }
      }
    },
    {
      "id": "bb0d85fe-fb70-4803-86f1-87369e9726df",
      "name": "BOT_MESSAGE",
      "type": "MESSAGE",
      "timestamp": "2021-11-08T08:37:33.740+00:00",
      "data": {
        "id": "06e8cea0-8b06-4a12-9b93-89ebc36f009b",
        "header": {
          "sender": {
            "type": "BOT",
            "role": "PRIMARY",
            "participant": {
              "participantType": "TopicMonitor",
              "id": "2d8e6049-ee1b-482a-8013-4c758f893d60",
              "displayName": "Topic Monitor: 2d8e6049-ee1b-482a-8013-4c758f893d60"
            },
            "id": "cdbaa990-8172-43f5-af66-7ee71a5b3cd6",
            "joiningTime": 1636360645775,
            "token": null,
            "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
            "isActive": true,
            "userCredentials": {},
            "state": "SUBSCRIBED",
            "stateChangedOn": 1636360645775
          },
          "channelData": {
            "channelCustomerIdentifier": "97962945",
            "serviceIdentifier": "+921218",
            "requestPriority": 0,
            "channelTypeCode": "webChannel",
            "additionalAttributes": []
          },
          "language": {},
          "timestamp": 1636360721224,
          "securityInfo": {},
          "stamps": [],
          "intent": null,
          "entities": {},
          "channelSession": {
            "participantType": "ChannelSession",
            "id": "94974af3-a6a6-4f03-b8d6-0e8c8e3b6497",
            "channel": {
              "id": "6185267a7ffc8449d4c3c1ce",
              "name": "web",
              "serviceIdentifier": "+921218",
              "tenant": {
                "id": "30f0726d-ef48-4013-8eeb-74bc2c35625f",
                "name": null
              },
              "channelConfig": {
                "id": "348b6c36-5dbf-47df-8ba4-8625f00a1785",
                "channelMode": "HYBRID",
                "conversationBot": "",
                "responseSla": 20,
                "customerActivityTimeout": 20,
                "customerIdentificationCriteria": {
                  "value": null
                },
                "routingPolicy": {
                  "agentSelectionPolicy": "LONGEST_AVAILABLE",
                  "routeToLastAgent": true,
                  "routingMode": "PUSH",
                  "routingObjectId": "6172426726c3762d4f5f68fe",
                  "agentRequestTtl": 20
                },
                "botId": "8b43ef12-f30b-48ce-aa03-c60d450fc042"
              },
              "channelConnector": {
                "id": "6178062f39b2a10f979a9499",
                "name": "web connector",
                "channelProviderInterface": {
                  "id": "61769ad86959682449337620",
                  "name": "Web Provider",
                  "supportedChannelTypes": [
                    {
                      "id": "6176bfde6e67cc29d93be907",
                      "name": "Web",
                      "channelLogo": "84458_4485687.png",
                      "isInteractive": true,
                      "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
                    }
                  ],
                  "providerWebhook": "http://192.168.50.25:7000/message/receive",
                  "channelProviderConfigSchema": []
                },
                "channelProviderConfigs": [],
                "tenant": {
                  "id": "8773b513-6441-42bf-99d4-e243afbb3a07",
                  "name": null
                }
              },
              "channelType": {
                "id": "6176bfde6e67cc29d93be907",
                "name": "Web",
                "channelLogo": "84458_4485687.png",
                "isInteractive": true,
                "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
              }
            },
            "customer": {
              "_id": "67b01aa5-9450-46fa-8b39-fde1bb6f7e68",
              "firstName": "John",
              "lastName": null,
              "email": null,
              "phone1": null,
              "phone2": null,
              "viberId": null,
              "facebookId": null,
              "webId": null,
              "createdBy": null,
              "updatedBy": null,
              "createdAt": null,
              "updatedAt": null,
              "isAnonymous": false,
              "__v": 0
            },
            "customerSuggestions": [],
            "channelData": {
              "channelCustomerIdentifier": "97962945",
              "serviceIdentifier": "+921218",
              "requestPriority": 0,
              "channelTypeCode": "webChannel",
              "additionalAttributes": []
            },
            "latestIntent": null,
            "customerPresence": {
              "value": null
            },
            "isActive": true,
            "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
            "state": "STARTED",
            "active": true
          }
        },
        "body": {
          "type": "PLAIN",
          "markdownText": "Thank you a Crisis Supporter will be with you shortly."
        }
      }
    },
    {
      "id": "c478ff39-5049-4800-97ab-e1f86a32e373",
      "name": "TASK_STATE_CHANGED",
      "type": "NOTIFICATION",
      "timestamp": "2021-11-08T08:37:34.078+00:00",
      "data": {
        "id": "2cb9dc30-1017-4095-869f-2a4e3e291d39",
        "channelSession": {
          "participantType": "ChannelSession",
          "id": "94974af3-a6a6-4f03-b8d6-0e8c8e3b6497",
          "channel": {
            "id": "6185267a7ffc8449d4c3c1ce",
            "name": "web",
            "serviceIdentifier": "+921218",
            "tenant": {
              "id": "30f0726d-ef48-4013-8eeb-74bc2c35625f",
              "name": null
            },
            "channelConfig": {
              "id": "348b6c36-5dbf-47df-8ba4-8625f00a1785",
              "channelMode": "HYBRID",
              "conversationBot": "",
              "responseSla": 20,
              "customerActivityTimeout": 20,
              "customerIdentificationCriteria": {
                "value": null
              },
              "routingPolicy": {
                "agentSelectionPolicy": "LONGEST_AVAILABLE",
                "routeToLastAgent": true,
                "routingMode": "PUSH",
                "routingObjectId": "6172426726c3762d4f5f68fe",
                "agentRequestTtl": 20
              },
              "botId": "8b43ef12-f30b-48ce-aa03-c60d450fc042"
            },
            "channelConnector": {
              "id": "6178062f39b2a10f979a9499",
              "name": "web connector",
              "channelProviderInterface": {
                "id": "61769ad86959682449337620",
                "name": "Web Provider",
                "supportedChannelTypes": [
                  {
                    "id": "6176bfde6e67cc29d93be907",
                    "name": "Web",
                    "channelLogo": "84458_4485687.png",
                    "isInteractive": true,
                    "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
                  }
                ],
                "providerWebhook": "http://192.168.50.25:7000/message/receive",
                "channelProviderConfigSchema": []
              },
              "channelProviderConfigs": [],
              "tenant": {
                "id": "8773b513-6441-42bf-99d4-e243afbb3a07",
                "name": null
              }
            },
            "channelType": {
              "id": "6176bfde6e67cc29d93be907",
              "name": "Web",
              "channelLogo": "84458_4485687.png",
              "isInteractive": true,
              "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
            }
          },
          "customer": {
            "_id": "67b01aa5-9450-46fa-8b39-fde1bb6f7e68",
            "firstName": "John",
            "lastName": null,
            "email": null,
            "phone1": null,
            "phone2": null,
            "viberId": null,
            "facebookId": null,
            "webId": null,
            "createdBy": null,
            "updatedBy": null,
            "createdAt": null,
            "updatedAt": null,
            "isAnonymous": false,
            "__v": 0
          },
          "customerSuggestions": [],
          "channelData": {
            "channelCustomerIdentifier": "97962945",
            "serviceIdentifier": "+921218",
            "requestPriority": 0,
            "channelTypeCode": "webChannel",
            "additionalAttributes": []
          },
          "latestIntent": null,
          "customerPresence": {
            "value": null
          },
          "isActive": true,
          "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
          "state": "STARTED",
          "active": true
        },
        "mrd": {
          "id": "6172421126c3762d4f5f68fc",
          "name": "chat-mrd",
          "description": "handles all chat requests",
          "interruptible": true,
          "maxRequests": 5
        },
        "queue": "6172426726c3762d4f5f68fe",
        "priority": 1,
        "state": {
          "name": "QUEUED",
          "reasonCode": null
        },
        "assignedTo": null,
        "enqueueTime": 1636360654050
      }
    },
    {
      "id": "112b92b8-1230-45d8-97f4-d89f2691ac07",
      "name": "TASK_STATE_CHANGED",
      "type": "NOTIFICATION",
      "timestamp": "2021-11-08T08:37:34.692+00:00",
      "data": {
        "id": "2cb9dc30-1017-4095-869f-2a4e3e291d39",
        "channelSession": {
          "participantType": "ChannelSession",
          "id": "94974af3-a6a6-4f03-b8d6-0e8c8e3b6497",
          "channel": {
            "id": "6185267a7ffc8449d4c3c1ce",
            "name": "web",
            "serviceIdentifier": "+921218",
            "tenant": {
              "id": "30f0726d-ef48-4013-8eeb-74bc2c35625f",
              "name": null
            },
            "channelConfig": {
              "id": "348b6c36-5dbf-47df-8ba4-8625f00a1785",
              "channelMode": "HYBRID",
              "conversationBot": "",
              "responseSla": 20,
              "customerActivityTimeout": 20,
              "customerIdentificationCriteria": {
                "value": null
              },
              "routingPolicy": {
                "agentSelectionPolicy": "LONGEST_AVAILABLE",
                "routeToLastAgent": true,
                "routingMode": "PUSH",
                "routingObjectId": "6172426726c3762d4f5f68fe",
                "agentRequestTtl": 20
              },
              "botId": "8b43ef12-f30b-48ce-aa03-c60d450fc042"
            },
            "channelConnector": {
              "id": "6178062f39b2a10f979a9499",
              "name": "web connector",
              "channelProviderInterface": {
                "id": "61769ad86959682449337620",
                "name": "Web Provider",
                "supportedChannelTypes": [
                  {
                    "id": "6176bfde6e67cc29d93be907",
                    "name": "Web",
                    "channelLogo": "84458_4485687.png",
                    "isInteractive": true,
                    "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
                  }
                ],
                "providerWebhook": "http://192.168.50.25:7000/message/receive",
                "channelProviderConfigSchema": []
              },
              "channelProviderConfigs": [],
              "tenant": {
                "id": "8773b513-6441-42bf-99d4-e243afbb3a07",
                "name": null
              }
            },
            "channelType": {
              "id": "6176bfde6e67cc29d93be907",
              "name": "Web",
              "channelLogo": "84458_4485687.png",
              "isInteractive": true,
              "mediaRoutingDomain": "6172421126c3762d4f5f68fc"
            }
          },
          "customer": {
            "_id": "67b01aa5-9450-46fa-8b39-fde1bb6f7e68",
            "firstName": "John",
            "lastName": null,
            "email": null,
            "phone1": null,
            "phone2": null,
            "viberId": null,
            "facebookId": null,
            "webId": null,
            "createdBy": null,
            "updatedBy": null,
            "createdAt": null,
            "updatedAt": null,
            "isAnonymous": false,
            "__v": 0
          },
          "customerSuggestions": [],
          "channelData": {
            "channelCustomerIdentifier": "97962945",
            "serviceIdentifier": "+921218",
            "requestPriority": 0,
            "channelTypeCode": "webChannel",
            "additionalAttributes": []
          },
          "latestIntent": null,
          "customerPresence": {
            "value": null
          },
          "isActive": true,
          "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
          "state": "STARTED",
          "active": true
        },
        "mrd": {
          "id": "6172421126c3762d4f5f68fc",
          "name": "chat-mrd",
          "description": "handles all chat requests",
          "interruptible": true,
          "maxRequests": 5
        },
        "queue": "6172426726c3762d4f5f68fe",
        "priority": 1,
        "state": {
          "name": "RESERVED",
          "reasonCode": null
        },
        "assignedTo": "4b1395a9-2d47-409f-982c-d99c06a13125",
        "enqueueTime": 1636360654050
      }
    }
  ],
  "customerSuggestions": [],
  "topicParticipant": {
    "id": "4882e15c-fc90-458a-8545-689e4b1ab66d",
    "type": "AGENT",
    "participant": {
      "id": "4b1395a9-2d47-409f-982c-d99c06a13125",
      "participantType": "CCUser",
      "keycloakUser": {
        "id": "4b1395a9-2d47-409f-982c-d99c06a13125",
        "firstName": "Bashir",
        "lastName": "Joya",
        "username": "bashir",
        "permittedResources": {
          "Resources": [
            {
              "rsid": "e6c56b53-e53e-41b1-8d85-1101172f3029",
              "rsname": "Default Resource"
            }
          ]
        },
        "roles": [
          "agent",
          "offline_access",
          "uma_authorization"
        ],
        "realm": "university"
      },
      "associatedRoutingAttributes": []
    },
    "token": null,
    "topicId": "15584d31-df86-4052-818f-d2bfdba5b92b",
    "role": "PRIMARY",
    "userCredentials": null,
    "state": "SUBSCRIBED"
  }
};
  private _conversationsListener: BehaviorSubject<any> = new BehaviorSubject([]);

  public readonly conversationsListener: Observable<any> = this._conversationsListener.asObservable();

  constructor(
    private _snackbarService: snackbarService,
    private _appConfigService: appConfigService,
    private _cacheService: cacheService,
    private _sharedService: sharedService,
    private _pullModeService: pullModeService,
    private _router: Router
  ) {
    this.onTopicData(this.topicData, "15584d31-df86-4052-818f-d2bfdba5b92b")
  }

  connectToSocket() {
    this.uri = this._appConfigService.config.SOCKET_URL;
    let origin = new URL(this.uri).origin;
    let path = new URL(this.uri).pathname;
    console.log("username------ " + this._cacheService.agent.username);

    this.socket = io(origin, {
      path: path == "/" ? "" : path + "/socket.io",
      auth: {
        //  token: this._cacheService.agent.details.access_token,
        agent: JSON.stringify(this._cacheService.agent)
        //agent: ""
      }
    });

    this.socket.on("connect_error", (err) => {
      console.error("socket connect_error " + err);
      this._snackbarService.open("Socket connection error", "err");
    });

    this.socket.on("connect", (e) => {
      console.log("socket connect " + e);
    });

    this.socket.on("disconnect", (e) => {
      console.error("socket disconnect " + e);
    });

    this.listen("agentPresence").subscribe((res: any) => {
      console.log(res);
      this._sharedService.serviceChangeMessage({ msg: "stateChanged", data: res });
    });

    this.listen("errors").subscribe((res: any) => {
      console.log("socket errors ", res);
      this.onSocketErrors(res);
    });

    this.listen("taskRequest").subscribe((res: any) => {
      console.log("taskRequest ", res);
      this.triggerNewChatRequest(res);
    });

    this.listen("revokeTask").subscribe((res: any) => {
      console.log("revokeTask ", res);
      this.revokeChatRequest(res);
    });

    this.listen("onCimEvent").subscribe((res: any) => {
      try {
        this.onCimEventHandler(JSON.parse(res.cimEvent), res.topicId);
      } catch (err) {
        console.error("error on onCimEvent ", err);
      }
    });

    this.listen("onTopicData").subscribe((res: any) => {
      console.log("onTopicData", res);
      this.onTopicData(res.topicData, res.topicId);
    });

    this.listen("topicUnsubscription").subscribe((res: any) => {
      console.log("topicUnsubscription", res);
      this.removeConversation(res.topicId);
    });

    this.listen("topicClosed").subscribe((res: any) => {
      console.log("topicClosed", res);
      this.changeTopicStateToClose(res.topicId);
    });

    this.listen("socketSessionRemoved").subscribe((res: any) => {
      console.log("socketSessionRemoved", res);
      this.onSocketSessionRemoved();
    });

    this.listen("onPullModeSubscribedList").subscribe((res: any) => {
      console.log("onPullModeSubscribedList", res);
      this._pullModeService.updateSubscribedList(res);
    });

    this.listen("onPullModeSubscribedListRequest").subscribe((res: any) => {
      try {
        console.log("onPullModeSubscribedListRequest", res);
        this._pullModeService.updateSubscribedListRequests(JSON.parse(res.pullModeEvent), res.type);
      } catch (err) {
        console.error(err);
      }
    });

    this.listen("pullModeSubscribedListRequests").subscribe((res: any) => {
      console.log("pullModeSubscribedListRequests", res);
      this._pullModeService.initializedSubscribedListRequests(res);
    });

    this.listen("addPullModeSubscribedListRequests").subscribe((res: any) => {
      console.log("addPullModeSubscribedListRequests", res);
      this._pullModeService.addPullModeSubscribedListRequests(res);
    });

    this.listen("removePullModeSubscribedListRequests").subscribe((res: any) => {
      console.log("removePullModeSubscribedListRequests", res);
      this._pullModeService.removePullModeSubscribedListRequests(res);
    });

    this.listen("onChannels").subscribe((res: any) => {
      console.log("onChannels", res);
      this._sharedService.setChannelIcons(res);
    });
  }

  disConnectSocket() {
    try {
      this.socket.disconnect();
    } catch (err) {}
  }

  listen(eventName: string) {
    return new Observable((res) => {
      this.socket.on(eventName, (data) => {
        res.next(data);
      });
    });
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  triggerNewChatRequest(data) {
    this._sharedService.serviceChangeMessage({ msg: "openPushModeRequestHeader", data: data });
  }

  revokeChatRequest(data) {
    this._sharedService.serviceChangeMessage({ msg: "closePushModeRequestHeader", data: data });
  }

  onCimEventHandler(cimEvent, topicId) {
    console.log("cim event ", cimEvent);
    let sameTopicConversation = this.conversations.find((e) => {
      return e.topicId == topicId;
    });

    if (
      cimEvent.name.toLowerCase() == "agent_message" ||
      cimEvent.name.toLowerCase() == "bot_message" ||
      cimEvent.name.toLowerCase() == "customer_message"
    ) {
      if (sameTopicConversation) {
        if (cimEvent.data.header.sender.type.toLowerCase() == "customer") {
          this.processActiveChannelSessions(sameTopicConversation, cimEvent.data.header.channelSession);
          ++sameTopicConversation.unReadCount;
        }
        sameTopicConversation.messages.push(cimEvent.data);
        sameTopicConversation.unReadCount ? undefined : (sameTopicConversation.unReadCount = 0);
      } else {
        this.conversations.push({
          topicId: topicId,
          messages: [cimEvent.data],
          activeChannelSessions: [cimEvent.data.header.channelSession],
          unReadCount: undefined,
          index: ++this.conversationIndex,
          state: "ACTIVE"
        });
      }
      this._conversationsListener.next(this.conversations);
    } else if (cimEvent.type.toLowerCase() == "suggestion") {
      this.mergeBotSuggestions(sameTopicConversation, cimEvent.data);
    } else if (cimEvent.name.toLowerCase() == "channel_session_started") {
      this.addChannelSession(cimEvent, topicId);
    } else if (cimEvent.name.toLowerCase() == "channel_session_ended") {
      this.removeChannelSession(cimEvent, topicId);
    } else if (cimEvent.name.toLowerCase() == "associated_customer_changed") {
      this.changeTopicCustomer(cimEvent, topicId);
    }
  }

  onSocketSessionRemoved() {
    this._snackbarService.open("you are logged In from another session", "err");
    localStorage.clear();
    sessionStorage.clear();
    this.socket.disconnect();
    alert("you are logged In from another session");
    this._router.navigate(["login"]).then(() => {
      window.location.reload();
    });
  }

  onTopicData(topicData, topicId) {
    let conversation = {
      topicId: topicId,
      messages: [],
      activeChannelSessions: [],
      unReadCount: undefined,
      index: ++this.conversationIndex,
      state: "ACTIVE",
      customer: topicData.customer,
      customerSuggestions: topicData.customerSuggestions,
      topicParticipant: topicData.topicParticipant
    };

    // feed the conversation with type "messages"
    topicData.topicEvents.forEach((event, i) => {
      if (
        event.name.toLowerCase() == "agent_message" ||
        event.name.toLowerCase() == "bot_message" ||
        event.name.toLowerCase() == "customer_message"
      ) {
        conversation.messages.push(event.data);
      }
    });

    // feed the active channel sessions
    topicData.participants.forEach((e) => {
      if (e.type.toLowerCase() == "customer") {
        conversation.activeChannelSessions.push(e.participant);
      }
    });

    this.conversations.push(conversation);
    this._conversationsListener.next(this.conversations);
  }

  // getActiveChannelSessions(messages) {
  //   let lookup = {};
  //   let activeChannelSessions = [];

  //   for (let message, i = 0; (message = messages[i++]);) {
  //     if (message.header.sender.type.toLowerCase() == "customer") {
  //       let id = message.header.channelSession.id;

  //       if (!(id in lookup)) {
  //         lookup[id] = 1;
  //         activeChannelSessions.push(message.header.channelSession);
  //       }
  //     }
  //   }
  //   return activeChannelSessions;
  // }

  processActiveChannelSessions(conversation, incomingChannelSession) {
    let matched: boolean = false;
    let index = null;

    conversation.activeChannelSessions.forEach((activeChannelSession, i) => {
      if (activeChannelSession.id === incomingChannelSession.id) {
        matched = true;
        index = i;
        return;
      }
    });

    if (matched && conversation.activeChannelSessions.length - 1 != index) {
      // if matched and session is not at the last of the array then push that channel session to the last in array
      // thats why first removing it from the array for removing duplicate entry
      conversation.activeChannelSessions.splice(index, 1);

      // pusing the incoming channel to the last in array
      conversation.activeChannelSessions.push(incomingChannelSession);
    }
  }

  changeTopicCustomer(cimEvent, topicId) {
    let conversation = this.conversations.find((e) => {
      return e.topicId == topicId;
    });

    conversation.customer = cimEvent.data;
  }

  removeConversation(topicId) {
    // fetching the whole conversation which needs to be removed
    const removedConversation = this.conversations.find((conversation) => {
      return conversation.topicId == topicId;
    });

    // remove the conversation from array
    this.conversations = this.conversations.filter((conversation) => {
      return conversation.topicId != topicId;
    });

    --this.conversationIndex;

    // alter the rest of the conversation's indexes whose indexes are greater than the index of removed conversation
    // in order to remap the conversation indexex along with the indexes of the map tabs
    this.conversations.map((conversation) => {
      if (conversation.index > removedConversation.index) {
        conversation.index = --conversation.index;
      }
    });

    this._conversationsListener.next(this.conversations);
  }

  mergeBotSuggestions(conversation, suggestionMessage) {
    let message = conversation.messages.find((e) => {
      if (e.header.sender.type.toLowerCase() == "customer") {
        return e.id == suggestionMessage.requestedMessage.id;
      }
    });

    if (message) {
      message["botSuggestions"] = suggestionMessage.suggestions;
      message["showBotSuggestions"] = false;
      console.log("bot suggestion founded ", message);
      this._conversationsListener.next(this.conversations);
    }
  }

  linkCustomerWithInteraction(customerId, topicId) {
    this.emit("publishCimEvent", {
      cimEvent: new CimEvent("ASSOCIATED_CUSTOMER_CHANGED", "NOTIFICATION", { Id: customerId }),
      agentId: this._cacheService.agent.id,
      topicId: topicId
    });
    this._snackbarService.open("CUSTOMER LINKED SUCCESSFULLY", "succ");
  }

  removeChannelSession(cimEvent, topicId) {
    let conversation = this.conversations.find((e) => {
      return e.topicId == topicId;
    });

    let index = conversation.activeChannelSessions.findIndex((channelSession) => {
      return channelSession.id === cimEvent.data.id;
    });

    if (index != -1) {
      conversation.activeChannelSessions.splice(index, 1);
      console.log("channel session removed");
    } else {
      console.log("channelSessionId not found");
    }
  }

  addChannelSession(cimEvent, topicId) {
    let conversation = this.conversations.find((e) => {
      return e.topicId == topicId;
    });

    conversation.activeChannelSessions.push(cimEvent.data);
  }

  changeTopicStateToClose(topicId) {
    // // find the conversation
    // let conversation = this.conversations.find((e) => {
    //   return e.topicId == topicId;
    // });
    // // change the conversation state to "CLOSED"
    // conversation.state = "CLOSED";
    this._snackbarService.open("A conversation is removed", "err");
    this.removeConversation(topicId);

    // // in case of pull mode request, the topicId is the id of that request
    // this._pullModeService.deleteRequestByRequestId(topicId);
  }

  onSocketErrors(res) {
    this._snackbarService.open("on " + res.task + " " + res.msg, "err");
  }
}
