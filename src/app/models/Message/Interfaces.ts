import { MessageType, participantType, participantRole } from './Enums';
import { ITenant } from '../Tenant/Interfaces';

export interface IMessage {
    id: string;
    header: IMessageHeader;
    body: IMessageBody

}

interface IMessageHeader {
    sender: ITopicParticipant;
    channelData: IChannelData;
    language: ILanguageCode;
    timestamp: string;
    security_info: string;
    stamps: [];
    intent: string;
    entities: [];
    channelSession: IChannelSession
}

interface IMessageBody {
    type: MessageType;
    markdownText: string;

}

interface ITopicParticipant {
    id: string;
    participantType: participantType;
    participantRole: participantRole;
    participant: IParticipant;
    JoiningTime: string;
    token: string;
    topic: ICustomerTopic;
    userCredentials: IUserCredentials;

}


interface IChannelData {
    channelCustomerIdentifier: string
}

export interface IChannelSession {
    id: string;
    channel: IChannel;
    associatedCustomer: ICustomer;
    customerSuggestions: ICustomer[];
    channelData: IChannelData;
    latestIntent: string;
    customerPresence: {};
    isActive: boolean;

}

interface IParticipant {
    id: string;
    displayName: string;
}

interface ICustomerTopic {
    customerTopicId: string;
    participants: ITopicParticipant[];
}


interface IChannel {
    id: string;
    type: IChannelType;
    channelName: string;
    serviceIdentifier: IServiceIdentifier;
    tenant: ITenant;
}

interface IChannelType {
    id: string;
    channelTypeName: string;
    isInteractive: boolean;
}

interface ICustomer {
    id: string;
    firstName: string;
}

interface IUserCredentials {

}

interface IServiceIdentifier {

}

interface ILanguageCode {

}