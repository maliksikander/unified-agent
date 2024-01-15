import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { appConfigService } from "./appConfig.service";
import { cacheService } from "./cache.service";

@Injectable({
  providedIn: "root"
})
export class httpService {
  apiEndpoints;
  supervisorId;

  constructor(public _appConfigService: appConfigService, private _httpClient: HttpClient) {
    this.apiEndpoints = {
      login: "/agent/login",
      customerSchema: "/customerSchema",
      schemaTypes: "/attributeTypes",
      customers: "/customers",
      labels: "/label",
      userPreference: "/userPreference",
      pullModeList: "/pull-mode-list",
      fileServer: "/api/downloadFileStream?filename=",
      uploadFile: "/api/uploadFileStream",
      activities: "/customer-topics/customer",
      agentSetting: "/agentSetting",
      forms: "/forms",
      agentInQueueList: "/precision-queues/available-agents",
      queueList: "/precision-queues",
      ccmChannelSession: "/message/receive",
      tasks: "/tasks",
      getAllMRDs: "/media-routing-domains",
      defaultOutboundChannel: "/channels/defaultoutbound",
      announcement: "/announcement",
      announcementSeenBy: "/announcement/seenStatus",
      sendSms: "/message/send",
      saveActivities: "/activities"
    };
  }

  ////////////////////////////  OutBound SMS ////////////////////////////////////////////

  sendOutboundSms(obj): Observable<any> {
    return this._httpClient.post<any>(`${this._appConfigService.config.CCM_URL}${this.apiEndpoints.sendSms}`, obj, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  saveActivies(obj): Observable<any> {
    return this._httpClient.post<any>(`${this._appConfigService.config.CONVERSATION_MANAGER_URL}${this.apiEndpoints.saveActivities}`, obj, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
  ///////////////////////////// Announcements CURD /////////////////////////////////////

  addAnnouncemenent(obj): Observable<any> {
    return this._httpClient.post<any>(`${this._appConfigService.config.TEAM_ANNOUNCEMENT_URL}${this.apiEndpoints.announcement}`, obj, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  updateAnnouncemenentById(id, data): Observable<any> {
    return this._httpClient.put<any>(`${this._appConfigService.config.TEAM_ANNOUNCEMENT_URL}${this.apiEndpoints.announcement}/${id}`, data, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  AnnouncementSeenByUser(id, announcementId): Observable<any> {
    return this._httpClient.put<any>(
      `${this._appConfigService.config.TEAM_ANNOUNCEMENT_URL}${this.apiEndpoints.announcementSeenBy}/${id}`,
      announcementId,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
        })
      }
    );
  }

  getAnnouncementsById(id): Observable<any> {
    return this._httpClient.get<any>(`${this._appConfigService.config.TEAM_ANNOUNCEMENT_URL}${this.apiEndpoints.announcement}/${id}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
  getAnnouncementsByTeamIds(teamIds, status): Observable<any> {
    return this._httpClient.get<any>(
      `${this._appConfigService.config.TEAM_ANNOUNCEMENT_URL}${this.apiEndpoints.announcement}/?teamIds=${teamIds.join(",")}&status=${status}`,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
        })
      }
    );
  }

  getAnnouncements(supervisorIds): Observable<any> {
    return this._httpClient.get<any>(
      `${this._appConfigService.config.TEAM_ANNOUNCEMENT_URL}${
        this.apiEndpoints.announcement
      }?page=${1}&limit=${1000},&supervisorIds=${supervisorIds}`,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
        })
      }
    );
  }

  deleteAnnouncementById(id): Observable<any> {
    return this._httpClient.delete<any>(`${this._appConfigService.config.TEAM_ANNOUNCEMENT_URL}${this.apiEndpoints.announcement}/${id}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  login(user): Observable<any> {
    return this._httpClient.post<any>(this._appConfigService.config.GAT_URL + this.apiEndpoints.login, user, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  ///////////////////////// Customer Schema CRUD /////////////////

  getSchemaTypes(): Observable<any> {
    return this._httpClient.get<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.schemaTypes}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  getCustomerSchema(): Observable<any> {
    return this._httpClient.get<any>(this._appConfigService.config.CIM_CUSTOMER_URL + this.apiEndpoints.customerSchema, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  addCustomerSchema(obj): Observable<any> {
    return this._httpClient.post<any>(this._appConfigService.config.CIM_CUSTOMER_URL + this.apiEndpoints.customerSchema, obj, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  updateCustomerSchema(data, id): Observable<any> {
    return this._httpClient.put<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customerSchema}/${id}`, data, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  deleteCustomerSchema(id): Observable<any> {
    return this._httpClient.delete<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customerSchema}/${id}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  changeCustomerSchemaOrder(schema): Observable<any> {
    return this._httpClient.put<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customerSchema}Order`, schema, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  /////////////////// User Preference ///////////////

  getUserPreference(id): Observable<any> {
    return this._httpClient.get<any>(this._appConfigService.config.CIM_CUSTOMER_URL + this.apiEndpoints.userPreference + "?user_Id=" + id, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  createUserPreference(obj): Observable<any> {
    return this._httpClient.post<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.userPreference}`, obj, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
  getActiveConversationData(conversationId): Observable<any> {
    return this._httpClient.get<any>(
      `${this._appConfigService.config.CONVERSATION_MANAGER_URL}/customer-topics/${conversationId}/conversation-data`,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
        })
      }
    );
  }
  getQueuedChats(queueId): Observable<any> {
    return this._httpClient.get<any>(`https://a25b1bfb-39a5-45af-8ebb-e79a6dad8273.mock.pstmn.io/queued-requests-detail/${queueId}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
  getActiveChatsWithAgents(queueId): Observable<any> {
    return this._httpClient.get<any>(`https://a25b1bfb-39a5-45af-8ebb-e79a6dad8273.mock.pstmn.io/active-chats-detail/${queueId}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
  getActiveChatsWithBots(queueId): Observable<any> {
    return this._httpClient.get<any>(`https://a25b1bfb-39a5-45af-8ebb-e79a6dad8273.mock.pstmn.io/active-chats-with-bot-detail/${queueId}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
  getAllActiveChatsWithAgents(selectedTeam, selectedQueues): Observable<any> {
    return this._httpClient.post<any>(
      `${this._appConfigService.config.CIM_REPORTING_URL}/queue-active-chats/detail`,
      { teamId: selectedTeam, queues: selectedQueues },
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
        })
      }
    );
  }
  getAllActiveAgentsDetails(teamSelected): Observable<any> {
    let body = { teams: teamSelected };
    return this._httpClient.post<any>(`${this._appConfigService.config.CIM_REPORTING_URL}/agent-activity/detail`, body, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
  getAllActiveAgentsDetailsOnQueue(queueId): Observable<any> {
    return this._httpClient.get<any>(`${this._appConfigService.config.CIM_REPORTING_URL}/agent-activity/detail?queueId=${queueId}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
  getAllActiveChatsWithBots(): Observable<any> {
    return this._httpClient.get<any>(`${this._appConfigService.config.CIM_REPORTING_URL}/bot-active-chats/detail`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
  getAllQueuedChats(selectedTeam, selectedQueues): Observable<any> {
    return this._httpClient.post<any>(
      `${this._appConfigService.config.CIM_REPORTING_URL}/queued-chats/detail`,
      { teamId: selectedTeam, queues: selectedQueues },
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
        })
      }
    );
  }

  updateUserPreference(obj, id): Observable<any> {
    return this._httpClient.put<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.userPreference}/${id}`, obj, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  ////////////////// Customer CRUD ////////////////

  getCustomers(limit, offset, sort, query): Observable<any> {
    return this._httpClient.get<any>(
      `${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customers}?limit=${limit}&offset=${offset}&sort=${
        sort.field ? sort.field + ":" + sort.order : ""
      }&paginateQuery=${query.field ? query.field + ":" + query.value : ""}`,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
        })
      }
    );
  }

  createCustomer(customer): Observable<any> {
    return this._httpClient.post<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customers}`, customer, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  getCustomerById(id): Observable<any> {
    return this._httpClient.get<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customers}/${id}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  updateCustomerById(id, obj): Observable<any> {
    return this._httpClient.put<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customers}/${id}`, obj, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  deleteCustomerById(id): Observable<any> {
    return this._httpClient.delete<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customers}/${id}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  ///////////////////////  agentSetting //////////

  updateAgentSettings(data, id): Observable<any> {
    return this._httpClient.put<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.agentSetting}/${id}`, data, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  getAgentSettings(id): Observable<any> {
    return this._httpClient.get<any>(`${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.agentSetting}?user_Id=${id}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  ////////////////////////////////////////////
  updateConversationCustomer(conversationId, customer): Observable<any> {
    return this._httpClient.put<any>(
      this._appConfigService.config.CONVERSATION_MANAGER_URL + "/customer-topics/" + conversationId + "/update-customer",
      customer,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
      }
    );
  }

  updatePastConversationCustomer(object): Observable<any> {
    return this._httpClient.put<any>(`${this._appConfigService.config.CONVERSATION_MANAGER_URL}/customer-topics/update-past-conversations`, object, {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      })
    });
  }

  ///////////////////////// Load Past Activity ////////

  // getPastActivities(id, limit, offset): Observable<any> {
  //   return this._httpClient.get<any>(
  //     `${this._appConfigService.config.CONVERSATION_MANAGER_URL}${this.apiEndpoints.activities}/${id}/past-events?limit=${limit}&offset=${offset}`,
  //     {
  //       headers: new HttpHeaders({
  //         "Content-Type": "application/json"
  //       })
  //     }
  //   );
  // }

  getPastActivities(id, limit, offset): Observable<any> {
    return this._httpClient.get<any>(
      `${this._appConfigService.config.CONVERSATION_MANAGER_URL}${this.apiEndpoints.activities}/${id}/activities?limit=${limit}&offset=${offset}&activity-type=ALL`,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
        })
      }
    );
  }

  ////////////////////////

  getLabels(): Observable<any> {
    return this._httpClient.get<any>(this._appConfigService.config.CIM_CUSTOMER_URL + this.apiEndpoints.labels, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  createLabel(label): Observable<any> {
    return this._httpClient.post<any>(this._appConfigService.config.CIM_CUSTOMER_URL + this.apiEndpoints.labels, label, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  updateLabel(id, label): Observable<any> {
    return this._httpClient.put<any>(this._appConfigService.config.CIM_CUSTOMER_URL + this.apiEndpoints.labels + "?_id=" + id, label, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  deleteLabel(id): Observable<any> {
    return this._httpClient.delete<any>(this._appConfigService.config.CIM_CUSTOMER_URL + this.apiEndpoints.labels + "?_id=" + id, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  getPullModeList(): Observable<any> {
    return this._httpClient.get<any>(this._appConfigService.config.UNIFIED_ADMIN_URL + this.apiEndpoints.pullModeList, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  getChannelLogo(id: string): Observable<Blob> {
    return this._httpClient.get(this._appConfigService.config.FILE_SERVER_URL + this.apiEndpoints.fileServer + id, { responseType: "blob" });
  }

  uploadToFileEngine(data): Observable<any> {
    return this._httpClient.post<any>(`${this._appConfigService.config.FILE_SERVER_URL}${this.apiEndpoints.uploadFile}`, data, {
      headers: new HttpHeaders({})
    });
  }

  ////////////////// Forms Api ////////////////

  getWrapUpForm(): Observable<any> {
    return this._httpClient.get<any>(`${this._appConfigService.config.UNIFIED_ADMIN_URL}${this.apiEndpoints.forms}/62d07f4f0980a50a91210bef`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
  startOutboundConversation(cimMessage): Observable<any> {
    return this._httpClient.post<any>(this._appConfigService.config.CCM_URL + "/message/receive", cimMessage, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
  getSupportedLanguages(): Observable<any> {
    return this._httpClient.get<any>(`${this._appConfigService.config.UNIFIED_ADMIN_URL}/locale-setting`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
  getReasonCodes(): Observable<any> {
    return this._httpClient.get<any>(`${this._appConfigService.config.UNIFIED_ADMIN_URL}/reasons`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
  getConversationSettings(): Observable<any> {
    return this._httpClient.get<any>(`${this._appConfigService.config.UNIFIED_ADMIN_URL}/agent-desk-settings`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  getAgentsInQueue(conversationId): Observable<any> {
    return this._httpClient.get<any>(
      `${this._appConfigService.config.ROUTING_ENGINE_URL}${this.apiEndpoints.agentInQueueList}?conversationId=${conversationId}`,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
        })
      }
    );
  }
  getAllQueues(): Observable<any> {
    return this._httpClient.get<any>(`${this._appConfigService.config.ROUTING_ENGINE_URL}${this.apiEndpoints.queueList}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
  getAllMRDs(): Observable<any> {
    return this._httpClient.get<any>(`${this._appConfigService.config.ROUTING_ENGINE_URL}${this.apiEndpoints.getAllMRDs}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
  getCustomerByChannelTypeAndIdentifier(channelType, customerChannelIdentifier): Observable<any> {
    return this._httpClient.get<any>(
      `${this._appConfigService.config.CIM_CUSTOMER_URL}${this.apiEndpoints.customers}?channelType=${channelType}&customerChannelIdentifier=${customerChannelIdentifier}`,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
        })
      }
    );
  }

  getPostData(postId, serviceIdentifier): Observable<any> {
    //https://expertflow.postman.co/workspace/Expertflow~f8480e26-6001-4a5f-8435-d0adbf5d7f5c/request/8262326-85e2374a-2aab-4ea2-b2da-907101b94f35
    return this._httpClient.get<any>(
      `${this._appConfigService.config.CCM_URL}/social-media-post?postId=${postId}&serviceIdentifier=${serviceIdentifier}&limit=4`,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
        })
      }
    );
  }
  ccmVOICEChannelSession(data): Observable<any> {
    return this._httpClient.post<any>(`${this._appConfigService.config.CCM_URL}${this.apiEndpoints.ccmChannelSession}`, data, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  getRETasksList(agentId): Observable<any> {
    return this._httpClient.get<any>(`${this._appConfigService.config.ROUTING_ENGINE_URL}${this.apiEndpoints.tasks}?agentId=${agentId}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
  getDefaultOutboundChannel(channelTypeId): Observable<any> {
    return this._httpClient.get<any>(
      `${this._appConfigService.config.CCM_URL}${this.apiEndpoints.defaultOutboundChannel}?channelTypeId=${channelTypeId}`,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
        })
      }
    );
  }
}
