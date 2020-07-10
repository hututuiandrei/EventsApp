import { Component, OnChanges, Input } from '@angular/core';
import { TaskData } from '../../providers/task-data';
import { TaskModel } from '../../interfaces/task-model';

@Component({
  selector: 'app-session-detail-tasks',
  templateUrl: './session-detail-tasks.component.html',
  styleUrls: ['./session-detail-tasks.component.scss'],
})

export class SessionDetailTasksComponent implements OnChanges {

  @Input() sessionId: number;

  private sessionTasks: TaskModel[]

  constructor(
    private taskData: TaskData,
  ) { }

  ngOnChanges() {

    if(this.sessionId) {
      this.taskData.getBehaviourSubjectSessionTasks(this.sessionId)
        .subscribe((sessionTasks) => {
          this.sessionTasks = sessionTasks
      });
    }
  }

  doneTask(task: TaskModel) {

    this.taskData.doneTask(task)
  }
}
