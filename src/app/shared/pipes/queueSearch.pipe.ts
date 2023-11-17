import { Pipe, PipeTransform } from "@angular/core";
import { fileToArray } from "ngx-doc-viewer";

@Pipe({ name: "queueFilter", pure: true })
export class QueueSearchPipe implements PipeTransform {
  transform(inputData: any, searchTerm?: any): any {
    try {
      if (!inputData) return null;

      searchTerm = searchTerm.toLowerCase();
      searchTerm = searchTerm.replace("/", "");

      const filteredData = inputData.reduce((result, queue) => {
        // Check if the search term matches the queueName
        if (queue.queueName && queue.queueName.toLowerCase().includes(searchTerm)) {
          result.push(queue);
        } else {
          // Check if the search term matches the agent name in any availableAgents
          const matchingAgent = queue.availableAgents.find((agent) => agent.agent.name.toLowerCase().includes(searchTerm));
          if (matchingAgent) {
            result.push({
              ...queue,
              availableAgents: [matchingAgent]
            });
          }
        }
        return result;
      }, []);

      return filteredData;
    } catch (e) {
      console.error("[QueueSearchPipe] Error ==>", e);
    }
  }
}
