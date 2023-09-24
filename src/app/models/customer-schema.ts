export interface CustomerSchema {
    channelTypes: string[];
    _id: string;
    key: string;
    defaultValue: string;
    description: string;
    isChannelIdentifier: boolean;
    isDeleteAble: boolean;
    isPii: boolean;
    isRequired: boolean;
    label: string;
    length: number;
    sortOrder: number;
    type: string;
  }