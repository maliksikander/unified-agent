import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
declare var config, callTypes, sipConfig;

@Injectable()
export class appConfigService {
  configUrl = "assets/config.json";
  public config = {
    GAT_URL: "",
    SOCKET_URL: "",
    ENV: "",
    FILE_SERVER_URL: "",
    CIM_CUSTOMER_URL: "",
    CONVERSATION_MANAGER_URL: "",
    TEAM_ANNOUNCEMENT_URL: "",
    Rona_State_On_Cisco: "",
    ROUTING_ENGINE_URL: "",
    CIM_REPORTING_URL: "",
    UNIFIED_ADMIN_URL: "",
    CCM_URL: "",
    isCiscoEnabled: false,
    isCxVoiceEnabled: false,
    CISCO_CC_MRD: "",
    CX_VOICE_MRD: ""
  };
  // public sipConfig = {
  //   wss: "",
  //   uri: "",
  //   agentStaticPassword: 1234,
  //   enable_sip_log: false,
  // }
  finesseConfig: any;
  cxSipConfig: any;

  constructor(private _httpClient: HttpClient) {}

  loadConfig() {
    return this._httpClient
      .get(this.configUrl)
      .toPromise()
      .then((e: any) => {
        this.config.GAT_URL = e.GAT_URL;
        this.config.SOCKET_URL = e.SOCKET_URL;
        this.config.ENV = e.ENV;
        this.config.FILE_SERVER_URL = e.FILE_SERVER_URL;
        this.config.CIM_CUSTOMER_URL = e.CIM_CUSTOMER_URL;
        this.config.CONVERSATION_MANAGER_URL = e.CONVERSATION_MANAGER_URL;
        this.config.Rona_State_On_Cisco = e.ronaStateOnCisco;
        this.config.ROUTING_ENGINE_URL = e.ROUTING_ENGINE_URL;
        this.config.CIM_REPORTING_URL = e.CIM_REPORTING_URL;
        this.config.UNIFIED_ADMIN_URL = e.UNIFIED_ADMIN_URL;
        this.config.CCM_URL = e.CCM_URL;
        (this.config.isCiscoEnabled = e.isCiscoEnabled),
          (this.config.isCxVoiceEnabled = e.isCxVoiceEnabled),
          (this.config.CX_VOICE_MRD = e.CX_VOICE_MRD),
          (this.config.CISCO_CC_MRD = e.CISCO_CC_MRD),
          (this.config.TEAM_ANNOUNCEMENT_URL = e.TEAM_ANNOUNCEMENT_URL);
        config = {
          domain: e.domain,
          subDomain: e.subDomain,
          boshUrl: e.boshUrl,
          subBoshUrl: e.subBoshUrl,
          finesseFlavor: e.finesseFlavor,
          callVariable: e.callVariable,
          getQueuesDelay: e.getQueuesDelay,
          ssoBackendUrl: e.ssoBackendUrl,
          isGadget: e.isGadget,
          adminUsername: e.adminUsername,
          adminPassword: e.adminPassword
        };
        this.finesseConfig = config;

        callTypes = {
          inboundTypeCCE: e.inboundTypeCCE,
          inboundTypeCCX: e.inboundTypeCCX,
          directType: e.directType,
          outboundType: e.outboundType,
          outboundType2: e.outboundType2,
          outboundCampaignType: e.outboundCampaignType,
          outboundPreviewCampaignTypeCCX: e.outboundPreviewCampaignTypeCCX,
          outboundPreviewCampaignTypeCCE: e.outboundPreviewCampaignTypeCCE,
          directTransferTypeCCE: e.directTransferTypeCCE,
          directTransferTypeCCX: e.directTransferTypeCCX,
          consultType: e.consultType,
          consultTransferTypeCCE: e.consultTransferTypeCCE,
          consultTransferTypeCCX: e.consultTransferTypeCCX,
          conferenceType: e.conferenceType,
          silentMonitorType: e.silentMonitorType,
          bargeInType: e.bargeInType
        };
        sipConfig = {
          wss: e.SIP_SOCKET_URL,
          uri: e.SIP_URI,
          agentStaticPassword: e.EXT_STATIC_PASSWORD,
          enable_sip_log: e.ENABLE_SIP_LOGS,
          staticQueueTransferDn: e.STATIC_QUEUE_TRANSFER_DN,
          autoCallAnswer: e.AUTO_CALL_ANSWER_TIMER
        };
        this.cxSipConfig = sipConfig;
        // this.sipConfig = sipConfig;
      });
  }
}
