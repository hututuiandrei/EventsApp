import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { map } from 'rxjs/operators';

import { TaskModel } from '../interfaces/task-model'

import { ConferenceData } from '../providers/conference-data'
import { of, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TaskData {

    private allTasks: TaskModel[];
    private sessionTasks: BehaviorSubject<TaskModel[]>;
    private idCounter: number = 0;
    private TASK_KEY = "task-key";

    constructor(
        public conferenceData: ConferenceData,
        public storage: Storage
    ) { }

    getTasks() {

        if(this.allTasks) {
            return of(this.allTasks);
        } else {
            return this.conferenceData.getTasks()
                .pipe(map(this.processTasks, this));
        }
    }

    getBehaviourSubjectSessionTasks(sessionId: number) {
        this.sessionTasks = new BehaviorSubject([])

        if(this.allTasks) {
            let tasksCopy = this.allTasks.filter((task) => task.sessionId == sessionId)
            this.sessionTasks.next(tasksCopy);
        } else {
            this.storage.get(this.TASK_KEY).then((cachedTasks) => {
                if(cachedTasks) {
                    this.allTasks = cachedTasks;
                    this.sessionTasks.next(cachedTasks.filter((task) => task.sessionId == sessionId));
                } else {
                    this.conferenceData.getTasks()
                        .pipe(map(this.processTasks, this)).subscribe((defaultTasks) => {

                            this.allTasks = defaultTasks;
                            this.sessionTasks.next(defaultTasks.filter((task) => task.sessionId == sessionId));
                        });
                }
            })
        }

        return this.sessionTasks;
    }

    processTasks(allTasks: any) {

        this.allTasks = [];

        allTasks.forEach((task) => {

            let newTask: TaskModel = new TaskModel();

            this.idCounter = (this.idCounter < task.idTask) ? task.idTask : this.idCounter;

            newTask.id = task.idTask;
            newTask.name = task.nameTask;
            newTask.sessionId = task.idSessionTask;
            newTask.done = task.isDoneTask;

            this.allTasks.push(newTask);
        });

        return this.allTasks;
    }

    addTask(sessionId: number, newTask: any) {

        let task: TaskModel = new TaskModel()

        this.idCounter++;

        task.id = this.idCounter;
        task.sessionId = sessionId;
        task.name = newTask.title;
        task.done = false;

        this.allTasks.push(task);

        this.storage.set(this.TASK_KEY, this.allTasks);

        this.sessionTasks.next(this.allTasks.filter((task) => task.sessionId == sessionId));
    }

    doneTask(task: TaskModel) {

        let taskIndex = this.allTasks.findIndex((lookedTask) => lookedTask.id == task.id)
        this.allTasks[taskIndex] = task;
        this.storage.set(this.TASK_KEY, this.allTasks);

    }
}