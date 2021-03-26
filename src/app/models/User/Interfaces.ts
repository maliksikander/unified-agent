import { ITenant } from "../Tenant/Interfaces";

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
  id?: string;
  participantType?: "CCUser",
  keycloakUser: IKeycloakUser;
  associatedRoutingAttributes?: [];
}

export interface IAgentPresence {
  agent: ICCUser;
  state: string;
  statusMessage?: string;
  agentMRDState?: [];
  stateChangeTime: string;
  topics?: [];
}
