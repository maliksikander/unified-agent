import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveAgentDetailsComponent } from './active-agent-details.component';

describe('ActiveAgentDetailsComponent', () => {
  let component: ActiveAgentDetailsComponent;
  let fixture: ComponentFixture<ActiveAgentDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveAgentDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveAgentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
