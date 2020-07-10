import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { InvitedPeopleData } from '../../providers/invited-people-data';

@Component({
  selector: 'app-session-detail-invited-people',
  templateUrl: './session-detail-invited-people.component.html',
  styleUrls: ['./session-detail-invited-people.component.scss'],
})
export class SessionDetailInvitedPeopleComponent implements OnChanges {

  @Input() sessionId: number;

  invitedPeople: any[]

  constructor(
    private invitedPeopleData: InvitedPeopleData
  ) { }

  ngOnChanges() {

    if(this.sessionId) {
      this.invitedPeopleData.getBehaviourSubject(this.sessionId).subscribe((invitedPeople) => {

        this.invitedPeople = invitedPeople;
      })
    }
  }

  deleteInvitedPerson(personId){

    this.invitedPeopleData.deletePerson(this.sessionId, personId)
  }

}
