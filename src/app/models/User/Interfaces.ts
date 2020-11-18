import { ITenant } from '../Tenant/Interfaces';

export interface ICCUser {
    id: string;
    teams: ITeam[];
    firstName: string;
    lastName: string;
    extention: number;
    roles: [];
    queue: string;
    tenant: ITenant;
    routingAttributes: []

}

interface ITeam {
    id: string;
    name: string;
    tenant: ITenant
}


