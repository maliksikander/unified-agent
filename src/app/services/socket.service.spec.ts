import { TestBed } from "@angular/core/testing";
import { promise } from "protractor";
import { of } from "rxjs";
import { sharedService } from "./shared.service";
import { socketService } from "./socket.service";
var jest: any
const mockCustomerSchema: any = require('../mocks/customerSchema.json');
const mockTopicData: any = require('../mocks/topicData.json');


describe("Socket service", () => {

    let component: socketService;

    let _snackbarService: any;
    let _appConfigService: any;
    let _cacheService: any;
    let _sharedService: any;
    let _pullModeService: any;
    let _router: any;
    let _soundService: any;
    let ngxService: any;

    const mockConversation = {
        topicId: "12345",
        messages: [],
        activeChannelSessions: [],
        unReadCount: undefined,
        index: 1,
        state: "ACTIVE",
        customer: mockTopicData.customer,
        customerSuggestions: mockTopicData.channelSession.customerSuggestions,
        topicParticipant: null,
        firstChannelSession: mockTopicData.channelSession
    }

    beforeEach(() => {

        _sharedService = sharedService;
        _sharedService.schema = mockCustomerSchema;
        
        component = new socketService(
            _snackbarService,
            _appConfigService,
            _cacheService,
            _sharedService,
            _pullModeService,
            _router,
            _soundService,
            ngxService
        );

        component.conversations.push(mockConversation);

    });

    afterEach(() => {

        component = null;
        _sharedService = null;
    });

    describe("linkCustomerWithTopic", () => {


        it("should be truthy function", () => {

            expect(component.linkCustomerWithTopic(mockTopicData.channelSession.customerSuggestions[0], "12345")).toBeTruthy();

        });

        it("should call updateTopiCustomer function when linking is succesfully done and without merging", () => {

            spyOn(component, 'updateTopiCustomer');
            component.linkCustomerWithTopic(mockTopicData.channelSession.customerSuggestions[0], "12345");
            expect(component.updateTopiCustomer).toHaveBeenCalled()

        });

        it("should not call updateTopiCustomer function when linking is with customer whose limit exceeds but agent want to merge profile", () => {

            spyOn(component, 'updateTopiCustomer');
            const mock = jest.fn().mockResolvedValueOnce(true)
            _sharedService.getConfirmation = mock
            component.linkCustomerWithTopic(mockTopicData.channelSession.customerSuggestions[2], "12345");
            expect(component.updateTopiCustomer).not.toHaveBeenCalled()

        });

        it("should call updateTopiCustomer function when linking is with customer whose limit exceeds but agent do not want to merge profile", () => {

            spyOn(component, 'updateTopiCustomer');
            const mock = jest.fn().mockResolvedValueOnce(false)
            _sharedService.getConfirmation = mock
            component.linkCustomerWithTopic(mockTopicData.channelSession.customerSuggestions[2], "12345");
            expect(component.updateTopiCustomer).toHaveBeenCalled()

        });

        it("should not call updateCustomerProfile function when linking is done without mergeing", () => {


            spyOn(component, 'updateCustomerProfile');

            component.linkCustomerWithTopic(mockTopicData.channelSession.customerSuggestions[0], "12345");
            expect(component.updateCustomerProfile).not.toHaveBeenCalled();

        });

    });

});
