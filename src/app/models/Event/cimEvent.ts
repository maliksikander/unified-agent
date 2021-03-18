import { v4 as uuidv4 } from 'uuid';

export class CimEvent {
    id: string;
    name: string;
    type: string;
    timestamp: string;
    data: {};

    constructor(name: string, type: string, data: {}) {

        this.id = uuidv4();
        this.name = name;
        this.type = type;
        this.timestamp = new Date().toISOString();
        this.data = data;

    }
}