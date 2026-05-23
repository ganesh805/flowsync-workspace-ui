import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';

import { TaskService } from '../../services/task.service';

import { Sidebar } from '../../layout/sidebar/sidebar';

import { Navbar } from '../../layout/navbar/navbar';
import { RouterModule } from '@angular/router';

 

import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  PieController,
  ChartConfiguration,
  ChartType
} from 'chart.js';

Chart.register(
  PieController,
  ArcElement,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Sidebar,
    Navbar,
    RouterModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home
implements OnInit, OnDestroy {

  tasks: any[] = [];

  notifications: any[] = [];

  comments: {
    [key: number]: any[]
  } = {};

  commentInputs: {
    [key: number]: string
  } = {};

  title = '';

  description = '';

  dueDate = '';

  priority = 'HIGH';

  status = 'PENDING';

  searchText = '';

  selectedFilter = 'ALL';

  currentPage = 1;

  itemsPerPage = 6;

  darkMode = false;

  nickname = 'User';

  editingTaskId:
    number | null = null;

  totalTasks = 0;

  completedTasks = 0;

  pendingTasks = 0;

  unreadCount = 0;
  currentPassword = '';

  newPassword = '';

  showNotifications = false;

  refreshInterval: any;
  messages: any[] = [];

  newMessage = '';
  companyName = '';
  selectedTask: any = null;

  public pieChartType: ChartType =
    'pie';

  public pieChartData:
    ChartConfiguration<'pie'>['data'] = {

    labels: [
      'Completed',
      'Pending'
    ],

    datasets: [
      {
        data: [0, 0]
      }
    ]
  };
  

  constructor(

    private taskService:
      TaskService,

    private router:
      Router,

    private http:
      HttpClient

  ) {}

  ngOnInit(): void {

    this.nickname =

      localStorage
        .getItem('nickname')
      || 'User';

    this.loadDashboardData();

    // AUTO REFRESH

    this.refreshInterval =

      setInterval(() => {

        this.loadDashboardData();

      }, 5000);
      this.loadMessages();

setInterval(() => {

  this.loadMessages();

}, 3000);
    this.companyName =

  localStorage.getItem(
    'companyName'
  ) || '';

  }

  ngOnDestroy(): void {

    if(this.refreshInterval) {

      clearInterval(
        this.refreshInterval
      );
    }
  }

  // LOAD EVERYTHING

  loadDashboardData() {

    this.loadTasks();

    this.loadNotifications();
  }

  // TASKS

  loadTasks() {

  this.taskService
    .getTasks()

    .subscribe({

      next: (response: any) => {

        console.log('TASKS:', response);

        this.tasks = Array.isArray(response)
          ? response
          : [];

        this.tasks.forEach(
          (task: any) => {

            this.loadComments(task.id);
          }
        );

        this.calculateStats();
      },

      error: (error: any) => {

        console.error(
          'LOAD TASK ERROR:',
          error
        );

        this.tasks = [];

        alert(
          'Failed To Load Tasks'
        );
      }
    });
}

  // ANALYTICS

  calculateStats() {

    this.totalTasks =
      this.tasks.length;

    this.completedTasks =

      this.tasks.filter(

        task =>
          task.status
          === 'COMPLETED'

      ).length;

    this.pendingTasks =

      this.tasks.filter(

        task =>
          task.status
          !== 'COMPLETED'

      ).length;

    this.pieChartData = {

      labels: [
        'Completed',
        'Pending'
      ],

      datasets: [
        {
          data: [
            this.completedTasks,
            this.pendingTasks
          ]
        }
      ]
    };
  }

  // CREATE TASK

  createTask() {

    const task = {

      title:
        this.title,

      description:
        this.description,

      dueDate:
        this.dueDate,

      priority:
        this.priority,

      status:
        this.status
    };

    this.taskService
      .createTask(task)
      .subscribe({

        next: () => {

          alert(
            'Task Created'
          );

          this.clearForm();

          this.loadTasks();
        },

        error: (error: any) => {

          console.log(error);

          alert(
            'Task Creation Failed'
          );
        }
      });
  }

  // EDIT TASK

  editTask(task: any) {

    this.editingTaskId =
      task.id;

    this.title =
      task.title;

    this.description =
      task.description;

    this.dueDate =
      task.dueDate;

    this.priority =
      task.priority;

    this.status =
      task.status;
  }

  // UPDATE TASK

  updateTask() {

    const task = {

      title:
        this.title,

      description:
        this.description,

      dueDate:
        this.dueDate,

      priority:
        this.priority,

      status:
        this.status
    };

    this.taskService

      .updateTask(

        this.editingTaskId!,

        task

      )

      .subscribe({

        next: () => {

          alert(
            'Task Updated'
          );

          this.editingTaskId =
            null;

          this.clearForm();

          this.loadTasks();
        },

        error: (error: any) => {

          console.log(error);

          alert(
            'Update Failed'
          );
        }
      });
  }

  // DELETE

  deleteTask(id: number) {

    this.taskService
      .deleteTask(id)
      .subscribe({

        next: () => {

          alert(
            'Task Deleted'
          );

          this.loadTasks();
        },

        error: (error: any) => {

          console.log(error);

          alert(
            'Delete Failed'
          );
        }
      });
  }

  // UPDATE STATUS

  updateStatus(taskId: number, status: string) {

  this.http.put(

    `http://localhost:8080/api/tasks/${taskId}/status?status=${status}`,

    {},

    this.getHeaders()

  ).subscribe({

    next: () => {

      alert('Status Updated');

      this.loadTasks();
    },

    error: (err) => {

      console.error(err);

      alert('Status Update Failed');
    }
  });
}

  // COMMENTS

  loadComments(taskId: number) {

    const token =
      localStorage
        .getItem('token');

    this.http.get<any[]>(

      `http://localhost:8080/api/comments/${taskId}`,

      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }

    ).subscribe({

      next: (response) => {

        this.comments[taskId] =
          response;
      },

      error: (error) => {

        console.log(error);
      }
    });
  }

  addComment(taskId: number) {

    const message =

      this.commentInputs[
        taskId
      ];

    if(
      !message
      || message.trim() === ''
    ) {

      return;
    }

    const token =
      localStorage
        .getItem('token');

    this.http.post(

      `http://localhost:8080/api/comments/${taskId}`,

      {
        message: message
      },

      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }

    ).subscribe({

      next: () => {

        this.commentInputs[
          taskId
        ] = '';

        this.loadComments(
          taskId
        );
      },

      error: (error) => {

        console.log(error);

        alert(
          'Failed To Add Comment'
        );
      }
    });
  }

  // NOTIFICATIONS

  loadNotifications() {

    const token =
      localStorage
        .getItem('token');

    this.http.get<any[]>(

      'http://localhost:8080/api/notifications',

      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }

    ).subscribe({

      next: (response) => {

        this.notifications =
          response;

        this.unreadCount =

          response.filter(

            notification =>
              !notification.isRead

          ).length;
      },

      error: (error) => {

        console.log(error);
      }
    });
  }

  // FILTERS

  get filteredTasks() {

    return this.tasks.filter(
      task => {

        const matchesSearch =

          task.title

            .toLowerCase()

            .includes(

              this.searchText
                .toLowerCase()
            );

        const matchesFilter =

          this.selectedFilter
          === 'ALL'

          ||

          task.status
          === this.selectedFilter;

        return (
          matchesSearch
          &&
          matchesFilter
        );
      }
    );
  }

  // PAGINATION

  get paginatedTasks() {

    const start =

      (
        this.currentPage - 1
      )

      * this.itemsPerPage;

    const end =

      start
      + this.itemsPerPage;

    return this.filteredTasks
      .slice(start, end);
  }

  // UTILITIES

  getStatusClass(
    status: string
  ) {

    switch(status) {

      case 'COMPLETED':
        return 'bg-success';

      case 'IN_PROGRESS':
        return 'bg-primary';

      case 'COMPLETION_REQUESTED':
        return 'bg-warning text-dark';

      case 'PENDING':
        return 'bg-secondary';

      default:
        return 'bg-dark';
    }
  }

  isOverdue(
    dueDate: string
  ): boolean {

    const today =
      new Date();

    today.setHours(
      0,0,0,0
    );

    const taskDate =
      new Date(dueDate);

    return taskDate < today;
  }

  toggleDarkMode() {

    this.darkMode =
      !this.darkMode;
  }

  clearForm() {

    this.title = '';

    this.description = '';

    this.dueDate = '';

    this.priority = 'HIGH';

    this.status = 'PENDING';
  }

  logout() {

    localStorage.clear();

    this.router.navigate([
      '/login'
    ]);
  }
  changePassword() {

  const token =
    localStorage.getItem('token');

  this.http.put(

    `http://localhost:8080/api/users/change-password?currentPassword=${this.currentPassword}&newPassword=${this.newPassword}`,

    {},

    {
      headers: {
        Authorization:
          `Bearer ${token}`
      },

      responseType: 'text'
    }

  ).subscribe({

    next: (response) => {

      alert(response);

      this.currentPassword = '';

      this.newPassword = '';
    },

    error: (error) => {

      console.log(error);

      alert(
        'Password Update Failed'
      );
    }
  });
}
loadMessages() {

  const token =
    localStorage.getItem('token');

  this.http.get<any[]>(

    'http://localhost:8080/api/discussions',

    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }

  ).subscribe({

    next: (response) => {

      this.messages = response;
    },

    error: (error) => {

      console.log(error);
    }
  });
}
sendMessage() {

  if(!this.newMessage.trim()) {

    return;
  }

  this.http.post(

    'http://localhost:8080/api/discussions',

    {

      message: this.newMessage

    },

    this.getHeaders()

  ).subscribe({

    next: () => {

      this.newMessage = '';

      this.loadMessages();

    },

    error: (error) => {

      console.log(error);

      alert('Message Failed');

    }

  });

}
requestCompletion(taskId: number) {

  const token =
    localStorage.getItem('token');

  this.http.put(

    `http://localhost:8080/api/tasks/${taskId}/status?status=COMPLETION_REQUESTED`,

    {},

    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }

  ).subscribe({

    next: () => {

      alert(
        'Approval Requested'
      );

      this.loadTasks();

      this.loadNotifications();
    },

    error: (error) => {

      console.log(error);

      alert(
        'Request Failed'
      );
    }
  });
}
getHeaders() {

  const token =
    localStorage.getItem('token');

  return {

    headers: {

      Authorization: `Bearer ${token}`
    }
  };
}
}