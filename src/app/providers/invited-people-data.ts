import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { map, flatMap } from 'rxjs/operators';

import { from } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { InvitedPersonModel } from '../interfaces/invited-person-model'

import { ConferenceData } from '../providers/conference-data'
import { of, BehaviorSubject } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class InvitedPeopleData {

    private allInvitedPeople: InvitedPersonModel[];
    private sessionInvitedPeople: BehaviorSubject<InvitedPersonModel[]>;
    private INVITED_KEY = "invited-key";

    constructor(
        public conferenceData: ConferenceData,
        public storage: Storage,
        public http: HttpClient
    ) { }

    getInvitedPeople() {

        if(this.allInvitedPeople) {
            return of(this.allInvitedPeople);
        } else {
            return from(this.storage.get(this.INVITED_KEY)).pipe(
                flatMap((data) => {
                    return (data ? of(data) : this.conferenceData.getInvitedPeople())
                        .pipe(map(this.processInvitedPeople, this));
                })
            )
        } 
    }

    getBehaviourSubject(sessionId: number) {

        this.sessionInvitedPeople = new BehaviorSubject([]);

        this.getInvitedPeople().subscribe((invitedPeople: InvitedPersonModel[]) => {

            this.sessionInvitedPeople.next(invitedPeople
                .filter((invitedPerson: InvitedPersonModel) => invitedPerson.sessionId == sessionId));
        })

        return this.sessionInvitedPeople;
    }

    processInvitedPeople(allInvitedPeople: InvitedPersonModel[]) {

        this.allInvitedPeople = [];

        if(!allInvitedPeople) {
            allInvitedPeople = [];
        }

        allInvitedPeople.forEach((person: any) => {

            let newPerson: InvitedPersonModel = new InvitedPersonModel()

            newPerson.id = person.id;
            newPerson.name = person.name;
            newPerson.sessionId = person.sessionId;
            newPerson.email = person.email;

            this.allInvitedPeople.push(newPerson);
        });

        return this.allInvitedPeople;
    }

    sendEmailsRequest(sessionId: number, emails: string[]) {

        var peopleList = []
        
        emails.forEach((email) => {

            var newPerson = new InvitedPersonModel()
            newPerson.email = email;
            newPerson.sessionId = sessionId;

            peopleList.push(newPerson);
        })

        this.http.post('https://localhost:5001/api/mail/sendmail', peopleList).subscribe(() => {})
    }

    deletePerson(sessionId: number, personId: number) {

        let personIdx = this.allInvitedPeople
            .findIndex((person: InvitedPersonModel) => person.id == personId);

        this.allInvitedPeople.splice(personIdx, 1);

        this.sessionInvitedPeople.next(this.allInvitedPeople
            .filter((invitedPerson) => invitedPerson.sessionId == sessionId))
    }
}