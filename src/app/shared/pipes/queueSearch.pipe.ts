import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "queueFilter", pure: true })
export class QueueSearchPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (!value) return null;
    if (!args) return value;

    args = args.toLowerCase();
    args = args.replace("/", "");
    return value.filter((item) => this.checkQueueAndAgentName(item, args));
  }

  private checkQueueAndAgentName(data: any, searchValue) {
    if (data && data.queueName.toLowerCase().includes(searchValue.toLowerCase())) {
      return true;
    } else {
      let agentList = data.availableAgents;
      if (Array.isArray(agentList) && agentList.length > 0) {
        for (let i = 0; i <= agentList.length; i++) {
          if (agentList[i] && agentList[i].agent.name.toLowerCase().includes(searchValue.toLowerCase())) {
            return true;
          }
        }
      }
      return false;
    }
  }
}
