import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SchedulePage } from './schedule';
import { ScheduleFilterPage } from '../schedule-filter/schedule-filter';
import { SchedulePageRoutingModule } from './schedule-routing.module';

import { AddEventPage } from '../schedule-add-event/schedule-add-event';

import { LongPressModule } from 'ionic-long-press';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchedulePageRoutingModule,
    LongPressModule
  ],
  declarations: [
    SchedulePage,
    ScheduleFilterPage,
    AddEventPage
  ],
  entryComponents: [
    ScheduleFilterPage,
    AddEventPage
  ]
})
export class ScheduleModule { }
