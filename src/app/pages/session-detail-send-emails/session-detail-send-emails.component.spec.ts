import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SessionDetailSendEmailsComponent } from './session-detail-send-emails.component';

describe('SessionDetailSendEmailsComponent', () => {
  let component: SessionDetailSendEmailsComponent;
  let fixture: ComponentFixture<SessionDetailSendEmailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionDetailSendEmailsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionDetailSendEmailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
