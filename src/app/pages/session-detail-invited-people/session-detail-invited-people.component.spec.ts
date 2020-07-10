import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SessionDetailInvitedPeopleComponent } from './session-detail-invited-people.component';

describe('SessionDetailInvitedPeopleComponent', () => {
  let component: SessionDetailInvitedPeopleComponent;
  let fixture: ComponentFixture<SessionDetailInvitedPeopleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionDetailInvitedPeopleComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionDetailInvitedPeopleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
