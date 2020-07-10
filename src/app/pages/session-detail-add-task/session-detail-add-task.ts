import { Component } from '@angular/core';

import { Config, ModalController } from '@ionic/angular';

@Component({
  selector: 'add-task-modal',
  templateUrl: 'session-detail-add-task.html'
})
export class AddTaskModal {

  private task = {
    
    title: ''
  }

  constructor(
    private config: Config,
    public modalController: ModalController,
  ) {}

  cancel() {

    this.modalController.dismiss();
  }

  dismiss(task?: any) {

    // using the injected ModalController this page
    // can "dismiss" itself and pass back data
    this.modalController.dismiss(task);
  }

}