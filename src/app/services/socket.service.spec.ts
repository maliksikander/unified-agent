
import { doesNotThrow } from "assert";
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
    let _sharedService: any
    let _pullModeService: any;
    let _router: any;
    let _soundService: any;
    let ngxService: any;
    let _httpService: any

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
            ngxService,
            _httpService
        );
        component.conversations.push(mockConversation);
    });





    describe("linkCustomerWithTopic", () => {


        it("should be truthy function", () => {

            expect(component.linkCustomerWithTopic(mockTopicData.channelSession.customerSuggestions[0], "12345")).toBeTruthy();

        });

        it("should call updateTopiCustomer when linking is without merging", () => {

            spyOn(component, 'updateTopiCustomer');

            _sharedService.getProfileLinkingConfirmation = jest.fn().mockResolvedValueOnce({ isAttributeMerge: false, decisionIs: true })

            component.linkCustomerWithTopic(mockTopicData.channelSession.customerSuggestions[0], "12345");

            setTimeout(function () {
                expect(component.updateTopiCustomer).toHaveBeenCalled();
            });

        });

        it("should call updateTopiCustomer when linking is with merging", () => {

            spyOn(component, 'updateTopiCustomer');

            _sharedService.getProfileLinkingConfirmation = jest.fn().mockResolvedValueOnce({ isAttributeMerge: true, decisionIs: true })

            component.linkCustomerWithTopic(mockTopicData.channelSession.customerSuggestions[0], "12345");

            setTimeout(function () {
                expect(component.updateTopiCustomer).toHaveBeenCalled();
            });

        });

        it("should also call updateTopiCustomer function when linking is with customer whose limit exceeds but agent want to merge profile", () => {

            spyOn(component, 'updateTopiCustomer');
            _sharedService.getProfileLinkingConfirmation = jest.fn().mockResolvedValueOnce({ isAttributeMerge: true, decisionIs: true })

            component.linkCustomerWithTopic(mockTopicData.channelSession.customerSuggestions[2], "12345");
            setTimeout(function () {
                expect(component.updateTopiCustomer).toHaveBeenCalled();
            });

        });

        it("should not call updateTopiCustomer function when agent dismiss the confirmation dialog without any confirmation", () => {

            spyOn(component, 'updateTopiCustomer');

            _sharedService.getProfileLinkingConfirmation = jest.fn().mockResolvedValueOnce({ isAttributeMerge: false, decisionIs: false })

            component.linkCustomerWithTopic(mockTopicData.channelSession.customerSuggestions[0], "12345");
            setTimeout(function () {
                expect(component.updateTopiCustomer).not.toHaveBeenCalled();
            });

        });

    });

});

