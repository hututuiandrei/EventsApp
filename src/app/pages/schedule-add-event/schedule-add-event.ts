import { Component } from '@angular/core';

import { ModalController, NavParams} from '@ionic/angular';

import { ConferenceData } from '../../providers/conference-data';

import { ToastController } from '@ionic/angular';

@Component({
  selector: 'add-event-modal',
  templateUrl: 'schedule-add-event.html'
})
export class AddEventPage {

    locations : [];
    noSpaceError: boolean = false;
    freeIntervalsPick: any[];
    freeIntervalsChoose: any[];
    timeEvent: string;
    choose: boolean = true;
    modifyEvent: boolean = false;

    private event = {

        id: undefined,
        name: '',
        description: '',
        location: '',
        timeStart: '',
        timeEnd: ''
    }

    constructor(
        public confData: ConferenceData,
        public toastController: ToastController,
        public modalController: ModalController,
        private navParams: NavParams
    ) {

        this.timeEvent = "15";
    }

    ionViewWillEnter() {
        this.locations = this.navParams.get('locations');
        this.event.id = this.navParams.get('id');

        if(this.event.id) {

            this.modifyEvent = true;
            this.event.name = this.navParams.get('name');
            this.event.description = this.navParams.get('description');
            this.event.location = this.navParams.get('location');
            this.event.timeStart = this.navParams.get('timeStart');
            this.event.timeEnd = this.navParams.get('timeEnd');
        }

        this.freeIntervalsPick = this.confData.getFreeIntervals(+this.timeEvent)
    }

    onChangeTimeEvent() {

        this.freeIntervalsPick = this.confData.getFreeIntervals(+this.timeEvent)
    }

    onSelectInterval(event: any) {
        
        this.event.timeStart = event.detail.value.split('-')[0];
        this.event.timeEnd = event.detail.value.split('-')[1];
    }

    cancel() {

        this.modalController.dismiss();
    }

    dismiss(event?: any) {

        // using the injected ModalController this page
        // can "dismiss" itself and pass back data

        try {

            if(this.modifyEvent) {
                this.confData.modifySession(event);
            } else {
                this.confData.addSession(event);
            }
            this.modalController.dismiss();

        } catch(error) {

            this.noSpaceError = true;
            this.freeIntervalsChoose = this.confData.getFreeIntervals(event.timeStart, event.timeEnd);
            this.presentToast(error);
        }
    }

    segmentChanged(event) {

        this.choose = (event.detail.value == "choose")
    }

    async presentToast(error: string) {
        const toast = await this.toastController.create({
          message: error,
          duration: 2000
        });
        toast.present();
      }

}