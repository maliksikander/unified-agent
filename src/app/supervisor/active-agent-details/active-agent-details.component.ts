import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-active-agent-details',
  templateUrl: './active-agent-details.component.html',
  styleUrls: ['./active-agent-details.component.scss']
})
export class ActiveAgentDetailsComponent implements OnInit {
  agentSearch = "";
  filterQueue = "all";
  labels: Array<any> = [];
 agentMRD = ['chat', 'voice', 'video', 'email']
  agentList = [{
    agentName: 'Albert King',
    agentState: 'ready',
    agentQueues: ['marketing', 'Sales', 'products'],
    activeConversations: 3,
    agentMrdStates: [{
      mrdState: 'chat',
      status: 'ready'
    },
      {
        mrdState: 'voice',
        status: 'busy'
      },
  {
    mrdState: 'video',
    status: 'not_ready'
  }, {
  mrdState: 'email',
  status: 'active',
}]
}, {
    agentName: 'john miller',
    agentState: 'not_ready',
    agentQueues: ['marketing', 'Sales', 'products'],
    activeConversations: 4,
    agentMrdStates: [ {
      mrdState: 'chat',
      status: 'active'
    },
      {
        mrdState: 'voice',
        status: 'busy'
      },
      {
        mrdState: 'video',
        status: 'not_ready'
      }, {
        mrdState: 'email',
        status: 'busy',
      }]
  },
    {
  agentName: 'Michael John',
    agentState: 'busy',
    agentQueues: ['Sales', 'products'],
    activeConversations: 2,
    agentMrdStates: [{
    mrdState: 'chat',
    status: 'pending_not_ready'
  },
    {
      mrdState: 'voice',
      status: 'busy'
    },
    {
      mrdState: 'video',
      status: 'ready'
    }, {
      mrdState: 'email',
      status: 'pending_not_ready',
    }]
  }, {
    agentName: 'Joey Bing',
    agentState: 'ready',
    agentQueues: ['marketing'],
    activeConversations: 3,
    agentMrdStates: [{
      mrdState: 'chat',
      status: 'pending_not_ready'
    },
      {
        mrdState: 'voice',
        status: 'ready'
      },
      {
        mrdState: 'video',
        status: 'busy'
      }, {
        mrdState: 'email',
        status: 'not_ready ',
      },
    ]
}];
  constructor() { }

  ngOnInit() {
  }
}
