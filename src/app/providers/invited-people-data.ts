import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { map, flatMap } from 'rxjs/operators';

import { from } from 'rxjs';

import { InvitedPersonModel } from '../interfaces/invited-person-model'

import { ConferenceData } from '../providers/conference-data'
import { of, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InvitedPeopleData {

    private allInvitedPeople: InvitedPersonModel[];
    private sessionInvitedPeople: BehaviorSubject<InvitedPersonModel[]>;
    private idCounter: number = 0;
    private INVITED_KEY = "invited-key";

    constructor(
        public conferenceData: ConferenceData,
        public storage: Storage
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
                .filter((invitedPerson: InvitedPersonModel) => invitedPerson.idSessionPerson == sessionId));
        })

        return this.sessionInvitedPeople;
    }

    processInvitedPeople(allInvitedPeople: InvitedPersonModel[]) {

        this.allInvitedPeople = [];

        allInvitedPeople.forEach((person: any) => {

            let newPerson: InvitedPersonModel = new InvitedPersonModel()

            this.idCounter = (this.idCounter < person.idPerson) ? person.idPerson : this.idCounter;

            newPerson.idPerson = person.idPerson;
            newPerson.name = person.name;
            newPerson.idSessionPerson = person.idSessionPerson;
            newPerson.email = person.email;

            this.allInvitedPeople.push(newPerson);
        });

        return this.allInvitedPeople;
    }

    addNewPerson(sessionId: number, newPerson: InvitedPersonModel) {

        this.idCounter++;
        newPerson.idPerson = this.idCounter;
        newPerson.idSessionPerson = +sessionId;

        this.allInvitedPeople.push(newPerson);

        this.storage.set(this.INVITED_KEY, this.allInvitedPeople);

        this.sessionInvitedPeople.next(this.allInvitedPeople
            .filter((invitedPerson) => invitedPerson.idSessionPerson == sessionId))
    }

    deletePerson(sessionId: number, personId: number) {

        let personIdx = this.allInvitedPeople
            .findIndex((person: InvitedPersonModel) => person.idPerson == personId);

        this.allInvitedPeople.splice(personIdx, 1);

        this.storage.set(this.INVITED_KEY, this.allInvitedPeople);

        this.sessionInvitedPeople.next(this.allInvitedPeople
            .filter((invitedPerson) => invitedPerson.idSessionPerson == sessionId))
    }
}