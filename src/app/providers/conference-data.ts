import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { from } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { forkJoin } from 'rxjs';
import { Storage } from '@ionic/storage';

import { UserData } from './user-data';

@Injectable({
  providedIn: 'root'
})
export class ConferenceData {
  data: any;
  idCounterSess: number = 0;
  private DATA_KEY = "data-key"

  constructor(
    public http: HttpClient,
    public user: UserData,
    public storage: Storage
    ) {}

  load(): any {

    var remoteData = forkJoin(
      {
        schedule: ajax.getJSON('https://localhost:5001/api/data/schedule'),
        speakers: ajax.getJSON('https://localhost:5001/api/data/speaker'),
        tracks: ajax.getJSON('https://localhost:5001/api/data/track')
      }
    )

    if (this.data) {
      return of(this.data);
    } else {
      return from(this.storage.get(this.DATA_KEY)).pipe(
        flatMap((data) => {
          return (data ? of(data) : remoteData)
            .pipe(map(this.processData, this));
          })
      )
    }
  }

  processData(data: any) {
    
    // just some good 'ol JS fun with objects and arrays
    // build up the data by linking speakers to sessions
    this.data = data;

    // loop through each day in the schedule
    this.data.schedule.forEach((day: any) => {
      // loop through each timeline group in the day
      day.groups.forEach((group: any) => {
        // loop through each session in the timeline group
        group.sessions.forEach((session: any) => {

          this.idCounterSess = (this.idCounterSess < +session.id) ? +session.id : this.idCounterSess;

          session.speakers = [];
          if (session.speakerNames) {
            session.speakerNames.forEach((speakerName: any) => {
              const speaker = this.data.speakers.find(
                (s: any) => s.name === speakerName
              );
              if (speaker) {
                session.speakers.push(speaker);
                speaker.sessions = speaker.sessions || [];
                speaker.sessions.push(session);
              }
            });
          }
        });
      });
    });

    return this.data;
  }

  getTimeline(
    dayIndex: number,
    queryText = '',
    excludeTracks: any[] = [],
    segment = 'all'
  ) {

    return this.load().pipe(
      map((data: any) => {

        const day = data.schedule[dayIndex];
        day.shownSessions = 0;

        queryText = queryText.toLowerCase().replace(/,|\.|-/g, ' ');
        const queryWords = queryText.split(' ').filter(w => !!w.trim().length);

        day.groups.forEach((group: any) => {

          group.hide = true;

          group.sessions.forEach((session: any) => {
            // check if this session should show or not

            this.filterSession(session, queryWords, excludeTracks, segment);

            if (!session.hide) {
              // if this session is not hidden then this group should show
              group.hide = false;
              day.shownSessions++;
            }
          });
        });

        return day;
      })
    );
  }

  compareTimes(time1: String, time2: String): boolean {

    return (this.convertToMinutes(time1) >= this.convertToMinutes(time2));
  }

  convertToMinutes(time: String): number {

    let zone = time.split(' ')[1];
    let hour = +time.split(' ')[0].split(':')[0]
    let minute = +time.split(' ')[0].split(':')[1]

    if(zone.slice(0, 1) == "p") {

      return (hour == 12) ? 60 * hour + minute : 60 * 12 + 60 * hour + minute;
    } else {
      return (hour == 12) ? minute : 60 * hour + minute;
    }
  }

  convertFromMinutes(minute: number): string {

    let hour = Math.floor(minute / 60);
    let min = minute % 60;
    let firstZero = (min < 10 && min > 0) ? '0' : '';
    let secZero = (min == 0) ? '0' : '';

    if(hour == 0) {
      return (hour + 12).toString() + ':' + firstZero + min.toString() + secZero + " am";
    } else if (hour == 12) {
      return hour.toString() + ':' + firstZero + min.toString() + secZero + " pm";
    } else if (hour > 12) {
      return (hour - 12).toString() + ':' + firstZero + min.toString() + secZero + " pm";
    } else {
      return hour.toString() + ':' + firstZero + min.toString() + secZero + " am";
    }
  }

  floorTime(time: string): string {

    let zone = time.split(' ')[1];
    let hour = +time.split(' ')[0].split(':')[0]

    return hour + ':00 ' + zone;
  }

  getFreeIntervals(time1: number | string, time2?: string): any[] {
  
    var eventDuration = (typeof(time1) === 'number') ? time1 : (this.convertToMinutes(time2) - this.convertToMinutes(time1))

    var intervals = [];

    this.data.schedule.forEach((day) => {
  
      let sortedSessionsArr = day.groups.map((group) => {
        return group.sessions
      }).flat().sort((item1, item2) => {
          return this.convertToMinutes(item1.timeStart) - this.convertToMinutes(item2.timeStart)
        })
    
      let startVect = sortedSessionsArr.map((item) => {return this.convertToMinutes(item.timeStart)});
      let endVect = sortedSessionsArr.map((item) => {return this.convertToMinutes(item.timeEnd)});

      let counterInterval = 0;

      for(let i = 0; i <= startVect.length; i++) {

        let startFreeSpace = (i > 0) ? endVect[i - 1] : 0;
        let endFreeSpace = (i < startVect.length) ? startVect[i] : 24 * 60;
        counterInterval = startFreeSpace;

        if(endFreeSpace - startFreeSpace > 0) {

          let numOfIntervals = Math.floor((endFreeSpace - startFreeSpace) / eventDuration);

          for(let j = 0; j < numOfIntervals; j++) {

            let interval = {

              startTime: this.convertFromMinutes(counterInterval), 
              endTime: this.convertFromMinutes(counterInterval + eventDuration)
            }
            counterInterval += eventDuration;

            intervals.push(interval)
          }
        }
      }

    })
    return intervals;
  }

  async addSession(event: any) {

    let session = {

      id: undefined,
      name: event.name,
      location: event.location,
      description: event.description,
      timeStart: event.timeStart,
      timeEnd: event.timeEnd,
      tracks: []
    }

    let sessionsArr = this.data.schedule[0].groups.map((group) => {return group.sessions}).flat()

    if (sessionsArr.every((session) => this.compareTimes(event.timeStart, session.timeEnd)
    || this.compareTimes(session.timeStart, event.timeEnd))) {

      var resp: any = await this.http.post('https://localhost:5001/api/data/session', session).toPromise();
      session.id = resp.id;
      session.tracks.push(resp.track);

      let day = this.data.schedule[0];

      let groupIndex = day.groups.findIndex((group) => this.floorTime(event.timeStart) == group.time);
      if(groupIndex < 0) {

        let group = {
          time: this.floorTime(event.timeStart),
          sessions: [session],
          hide: false
        }
        let toPlace = day.groups.findIndex((group) => this.compareTimes(group.time, event.timeStart));

        if(toPlace < 0) {

          day.groups.push(group);
        } else {
          day.groups.splice(toPlace, 0, group);
        }
      } else {
        let toPlace = day.groups[groupIndex].sessions
          .findIndex((session) => this.compareTimes(session.timeStart, event.timeStart))

        if(toPlace < 0) {
          day.groups[groupIndex].sessions.push(session)
        } else {
          day.groups[groupIndex].sessions.splice(toPlace, 0, session);
        }
      }
      
    } else {

      throw "Another event is already scheduled in this interval!"
    }
  }

  async modifySession(event: any) {

    await this.deleteSession(event);
    await this.addSession(event);
  }

  async deleteSession(event: any) {

    var resp : any = await this.http.delete(`https://localhost:5001/api/data/session/${event.id}`).toPromise();

    var grpIndex;
    this.data.schedule.forEach((day) => {
      day.groups.forEach((group, index) => {

        let sessIndex = group.sessions.findIndex((session) => session.id == event.id)
        if(sessIndex >= 0) {
          grpIndex = index;
          group.sessions.splice(sessIndex, 1);
        }
      })
      if(day.groups[grpIndex].sessions.length == 0) {
        day.groups.splice(grpIndex, 1);
      }
    })
  }

  filterSession(
    session: any,
    queryWords: string[],
    excludeTracks: any[],
    segment: string
  ) {


    let matchesQueryText = false;
    if (queryWords.length) {
      // of any query word is in the session name than it passes the query test
      queryWords.forEach((queryWord: string) => {
        if (session.name.toLowerCase().indexOf(queryWord) > -1) {
          matchesQueryText = true;
        }
      });
    } else {
      // if there are no query words then this session passes the query test
      matchesQueryText = true;
    }


    // if any of the sessions tracks are not in the
    // exclude tracks then this session passes the track test

    let matchesTracks = false;
    session.tracks.forEach((trackName: string) => {
      if (excludeTracks.indexOf(trackName) === -1) {
        matchesTracks = true;
      }
    });


    // if the segment is 'favorites', but session is not a user favorite
    // then this session does not pass the segment test
    let matchesSegment = false;
    if (segment === 'favorites') {
      if (this.user.hasFavorite(session.name)) {
        matchesSegment = true;
      }
    } else {
      matchesSegment = true;
    }


    // all tests must be true if it should not be hidden
    session.hide = !(matchesQueryText && matchesTracks && matchesSegment);
  }

  getInvitedPeople() {
    return ajax.getJSON('https://localhost:5001/api/mail/getaccepted');
  }

  getLocations() {
    return ajax.getJSON('https://localhost:5001/api/data/location');
  }

  getTasks() {
    return ajax.getJSON('https://localhost:5001/api/data/task');
  }

  getSpeakers() {
    return ajax.getJSON('https://localhost:5001/api/data/speaker').pipe(
      map((speakers: any) => {
        return speakers.sort((a: any, b: any) => {
          const aName = a.name.split(' ').pop();
          const bName = b.name.split(' ').pop();
          return aName.localeCompare(bName);
        });
      })
    );
  }

  getTracks() {
    return ajax.getJSON('https://localhost:5001/api/data/track').pipe(
      map((tracks: any) => {
        return tracks.sort();
      })
    );
  }

  getMap() {
    return this.load().pipe(
      map((data: any) => {
        return data.map;
      })
    );
  }
}
