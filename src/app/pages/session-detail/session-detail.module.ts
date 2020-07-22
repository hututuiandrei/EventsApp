import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule} from '@angular/forms'

import { SessionDetailPage } from './session-detail';
import { SessionDetailPageRoutingModule } from './session-detail-routing.module';
import { IonicModule } from '@ionic/angular';

import {DoneTasksPipe} from '../session-detail-tasks/done-tasks-pipe'

import {SessionDetailTasksComponent} from '../session-detail-tasks/session-detail-tasks.component'
import {AddTaskModal} from '../session-detail-add-task/session-detail-add-task'

import {SessionDetailInvitedPeopleComponent} from '../session-detail-invited-people/session-detail-invited-people.component'
import {SessionDetailSendEmailsComponent} from '../session-detail-send-emails/session-detail-send-emails.component'

import {ReactiveFormsModule} from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    SessionDetailPageRoutingModule
  ],
  declarations: [
    SessionDetailPage,
    DoneTasksPipe,
    SessionDetailTasksComponent,
    SessionDetailInvitedPeopleComponent,
    SessionDetailSendEmailsComponent,
    AddTaskModal
  ],
  entryComponents: [
    AddTaskModal
  ]
})
export class SessionDetailModule { }
