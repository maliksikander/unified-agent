export interface IMessage {

    id: string;
    header: IMessageHeader;
    body: IMessageBody

}

export interface IMessageHeader {

    sender: ITopicParticipant

}

export interface IMessageBody {


}

export interface ITopicParticipant {


}