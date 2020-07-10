import { Pipe, PipeTransform } from '@angular/core';

import { TaskModel } from '../../interfaces/task-model'

@Pipe({ 
    name: 'doneTasks',
    pure: false
 })
export class DoneTasksPipe implements PipeTransform {
  transform(allTasks: TaskModel[], isDone: boolean) {

    return allTasks ? allTasks.filter(task => task.done == isDone) : [];
  }
}