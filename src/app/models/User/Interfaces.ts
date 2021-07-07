import { ITenant } from "../Tenant/Interfaces";
import { v4 as uuidv4 } from "uuid";

export interface IKeycloakUser {
  id: string;
  username?: string;
  firstName: string;
  lastName: string;
  extention?: number;
  roles: [];
  queue?: string;
  tenant?: ITenant;
  teams?: ITeam[];
  routingAttributes?: [];
  permittedResources?: [];
}

interface ITeam {
  id: string;
  name: string;
  tenant: ITenant;
}

export interface ICCUser {
  id: string;
  participantType?: "CCUser";
  keycloakUser: IKeycloakUser;
  associatedRoutingAttributes?: [];
}

export interface IAgentPresence {
  agent: ICCUser;
  state: { name: string; reasonCode?: { id: string; name: string; type: string } };
  statusMessage?: string;
  agentMrdStates?: [];
  stateChangeTime: string;
  topics?: [];
}

export class TopicParticipant {
  id: string;
  type: string;
  participant: ICCUser;
  // stateChangedOn: string;
  token: string;
  topicId: string;
  role: string;
  // state: string;
  userCredentials: string;
  state: string;

  constructor(type: string, agent: IKeycloakUser, topicId: string, role: string, state: string) {
    this.id = uuidv4();
    this.type = type;
    this.participant = { id: agent.id, participantType: "CCUser", keycloakUser: agent, associatedRoutingAttributes: [] };
    // this.stateChangedOn = null;
    this.token = null;
    this.topicId = topicId;
    this.role = role;
    // this.state = null;
    this.userCredentials = null;
    this.state = state;
  }
}
