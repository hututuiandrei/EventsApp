import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup , Validators , FormControl } from '@angular/forms';
import { ToastController } from '@ionic/angular'

@Component({
  selector: 'app-session-detail-send-emails',
  templateUrl: './session-detail-send-emails.component.html',
  styleUrls: ['./session-detail-send-emails.component.scss'],
})
export class SessionDetailSendEmailsComponent implements OnInit {

  @Output() returnEmails = new EventEmitter();

  addedEmails : string[];
  invitedPersonForm = new FormGroup({
    email: new FormControl('',[
     Validators.required,
     Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]),
  });

  constructor(
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {

    this.addedEmails = [];
  }

  onAddEmail(): void {

    if(this.invitedPersonForm.get('email').status == "INVALID") {
      this.presentEmailToaster("Invalid email");
    } else {
      let email = this.invitedPersonForm.get('email').value;
      this.addedEmails.push(email);
    }
    this.invitedPersonForm.reset();
  }

  onSendInvitations() {

    this.returnEmails.emit(this.addedEmails);
    this.presentEmailToaster("Invitations sent");
    this.addedEmails = [];
  }

  get email(): any {
    return this.invitedPersonForm.get('email');
  }

  async presentEmailToaster(message: string) {

    const toast = await this.toastCtrl.create({
      header: message,
      duration: 3000,
      buttons: [{
        text: 'Close',
        role: 'cancel'
      }]
    });

    // Present the toast at the bottom of the page
    await toast.present();
  }

}
