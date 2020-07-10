import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SessionDetailTasksComponent } from './session-detail-tasks.component';

describe('SessionDetailTasksComponent', () => {
  let component: SessionDetailTasksComponent;
  let fixture: ComponentFixture<SessionDetailTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionDetailTasksComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionDetailTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
