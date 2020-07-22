import { Component } from '@angular/core';

import { ConferenceData } from '../../providers/conference-data';
import { ActivatedRoute } from '@angular/router';
import { UserData } from '../../providers/user-data';
import { TaskData } from '../../providers/task-data';
import { InvitedPeopleData } from '../../providers/invited-people-data';

import { InvitedPersonModel } from '../../interfaces/invited-person-model'

import { AddTaskModal } from '../session-detail-add-task/session-detail-add-task'
import { ModalController, IonRouterOutlet, ToastController } from '@ionic/angular';

@Component({
  selector: 'page-session-detail',
  styleUrls: ['./session-detail.scss'],
  templateUrl: 'session-detail.html'
})
export class SessionDetailPage {
  session: any;
  isFavorite = false;
  defaultHref = '';

  constructor(
    private dataProvider: ConferenceData,
    private userProvider: UserData,
    private taskProvider: TaskData,
    private route: ActivatedRoute,
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    private toastCtrl: ToastController,
    private invitedPeopleData: InvitedPeopleData
  ) { }

  ionViewWillEnter() {
    
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.schedule && data.schedule[0] && data.schedule[0].groups) {
        const sessionId = +this.route.snapshot.paramMap.get('sessionId');
        for (const group of data.schedule[0].groups) {
          if (group && group.sessions) {
            for (const session of group.sessions) {

              if (session && session.id === sessionId) {
                this.session = session;

                this.isFavorite = this.userProvider.hasFavorite(
                  this.session.name
                );

                break;
              }
            }
          }
        }
      }
    });
  }

  ionViewDidEnter() {
    this.defaultHref = `/app/tabs/schedule`;
  }

  sessionClick(item: string) {
    console.log('Clicked', item);
  }

  toggleFavorite() {
    if (this.userProvider.hasFavorite(this.session.name)) {
      this.userProvider.removeFavorite(this.session.name);
      this.isFavorite = false;
    } else {
      this.userProvider.addFavorite(this.session.name);
      this.isFavorite = true;
    }
  }

  shareSession() {
    console.log('Clicked share session');
  }

  async presentTaskForm() {

    const modal = await this.modalController.create({
      component: AddTaskModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    await this.taskProvider.addTask(this.session.id, data);
  }

  sendEmails(emails) {
    
    this.invitedPeopleData.sendEmailsRequest(this.session.id, emails);
  }
}
