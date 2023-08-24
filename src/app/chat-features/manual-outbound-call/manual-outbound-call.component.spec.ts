import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualOutboundCallComponent } from './manual-outbound-call.component';

describe('ManualOutboundCallComponent', () => {
  let component: ManualOutboundCallComponent;
  let fixture: ComponentFixture<ManualOutboundCallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualOutboundCallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualOutboundCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
