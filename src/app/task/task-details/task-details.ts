import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute
} from '@angular/router';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css'
})
export class TaskDetails
implements OnInit {

  task: any;

  comments: any[] = [];

  newComment = '';

  constructor(

    private route:
      ActivatedRoute,

    private http:
      HttpClient

  ) {}

  ngOnInit(): void {

    const taskId =
      this.route.snapshot.params['id'];

    this.loadTask(taskId);

    this.loadComments(taskId);
  }

  getHeaders() {

    const token =
      localStorage.getItem('token');

    return {
      headers: new HttpHeaders({
        Authorization:
          `Bearer ${token}`
      })
    };
  }

  loadTask(id: number) {

    this.http.get(

      `https://flowsync-workspace-api-2.onrender.com/api/tasks/${id}`,

      this.getHeaders()

    ).subscribe({

      next: (response) => {

        this.task = response;
      },

      error: (error) => {

        console.log(error);

        alert('Failed To Load Task');
      }
    });
  }

  loadComments(taskId: number) {

    this.http.get<any[]>(

      `https://flowsync-workspace-api-2.onrender.com/api/comments/${taskId}`,

      this.getHeaders()

    ).subscribe({

      next: (response) => {

        this.comments = response;
      },

      error: (error) => {

        console.log(error);
      }
    });
  }

  addComment() {

  if(!this.newComment.trim()) {

    return;
  }

  this.http.post(

    `https://flowsync-workspace-api-2.onrender.com/api/comments/${this.task.id}`,

    {
      message: this.newComment
    },

    this.getHeaders()

  ).subscribe({

    next: () => {

      this.newComment = '';

      this.loadComments(
        this.task.id
      );
    },

    error: (error) => {

      console.log(error);

      alert(
        'Comment Failed'
      );
    }
  });
}
}