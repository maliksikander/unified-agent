import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerActionsComponent } from './customer-actions.component';

describe('CustomerActionsComponent', () => {
  let component: CustomerActionsComponent;
  let fixture: ComponentFixture<CustomerActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
