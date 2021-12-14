import { CustomerInfoComponent } from "./customer-info.component";
import { sharedService } from "src/app/services/shared.service";
import { socketService } from "src/app/services/socket.service";
import { TestBed } from "@angular/core/testing";
const mockCustomerSchema: any = require('../../mocks/customerSchema.json');
const mockTopicData: any = require('../../mocks/topicData.json');

describe("CustomerInfoComponent", () => {
    let component: CustomerInfoComponent;
    let _socketService: socketService;
    let _shareredService: sharedService;
    let mockSharedService;
    let mockSocketService;
    let routerMock: any;
    let dialogMock: any;

    beforeEach(() => {

        mockSharedService = {
            schema: mockCustomerSchema,
        }

        mockSocketService = {

        }
        TestBed.configureTestingModule({
            providers: [
                { provide: _shareredService, useValue: mockSharedService },
                { provide: _socketService, useValue: mockSocketService },
            ]
        });

        _shareredService = TestBed.get(sharedService);
        _socketService = TestBed.get(socketService);

        component = new CustomerInfoComponent(
            routerMock,
            _shareredService,
            _socketService,
            dialogMock
        );

    });

    afterEach(() => {

        component = null;
        _shareredService = null;
        _socketService = null;
        mockSharedService = null;

    });

    describe("Test: Get media channels", () => {
        it("should extract media channles if customer and customer schema both are valid", () => {

            component.customer = mockTopicData.customer;

            expect(component.getMediaChannels()).toBeTruthy();

        });

        it("should validate the form", () => {

            _socketService.onTopicData(mockTopicData, "12345");

            component.viewAllMatches();

            expect(window.location.pathname).toEqual('/customers/phonebook');
        });
    });
});
