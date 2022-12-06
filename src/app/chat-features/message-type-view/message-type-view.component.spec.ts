import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageTypeViewComponent } from './message-type-view.component';

describe('MessageTypeViewComponent', () => {
  let component: MessageTypeViewComponent;
  let fixture: ComponentFixture<MessageTypeViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageTypeViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageTypeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
