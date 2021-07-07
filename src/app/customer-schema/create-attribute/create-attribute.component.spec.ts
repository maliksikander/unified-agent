import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAttributeComponent } from './create-attribute.component';

describe('CreateAttributeComponent', () => {
  let component: CreateAttributeComponent;
  let fixture: ComponentFixture<CreateAttributeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAttributeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
