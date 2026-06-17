import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  PieController,
  ChartConfiguration,

  ChartType
} from 'chart.js';

import { FormsModule } from '@angular/forms';

Chart.register(
  PieController,
  ArcElement,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-admin-dashboard',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],

  templateUrl: './admin-dashboard.html',

  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {

  users: any[] = [];

  tasks: any[] = [];
  employeePerformance: any[] = [];
  activityLogs: any[] = [];
  notifications: any[] = [];

searchText = '';

filteredUsers: any[] = [];

showNotifications = false;

unreadCount = 0;

  totalUsers = 0;

  totalTasks = 0;

  completedTasks = 0;

  pendingTasks = 0;

  taskTitle = '';

taskDescription = '';

taskDueDate = '';

taskPriority = 'MEDIUM';

assignedUserId = '';

employeeName = '';

employeeUsername = '';

employeeEmail = '';

employeeDesignation = '';

employeePassword = '';
companyName = '';
messages: any[] = [];

newMessage = '';
nickname = '';
adminName = '';
currentUser: any;
isChatMinimized = false;

assignTask() {

  const body = {

    title: this.taskTitle,

    description: this.taskDescription,

    dueDate: this.taskDueDate,

    priority: this.taskPriority,

    assignedToId: this.assignedUserId
  };

  this.http.post(

    'https://flowsync-workspace-api-2.onrender.com/api/tasks',

    body,

    this.getHeaders()

  ).subscribe({

    next: () => {

      alert('Task Assigned');

      this.loadTasks();

      this.taskTitle = '';

      this.taskDescription = '';

      this.taskDueDate = '';

      this.taskPriority = 'MEDIUM';

      this.assignedUserId = '';
    },

    error: (error) => {

      console.log(error);

      alert('Failed To Assign Task');
    }
  });
}

  public pieChartType: ChartType = 'pie';

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

  API = 'https://flowsync-workspace-api-2.onrender.com/api/admin';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {

  this.loadUsers();

  this.loadTasks();
  setTimeout(() => {

  this.loadTasks();

}, 500);

  this.loadEmployeePerformance();

  this.loadActivityLogs();

  this.loadNotifications();

  setInterval(() => {

    this.loadTasks();

    this.loadEmployeePerformance();

    this.loadActivityLogs();

    this.loadNotifications();
    

  }, 5000);

  this.companyName =
  localStorage.getItem(
    'companyName'
  ) || '';
  this.loadMessages();

  this.nickname =
  localStorage.getItem(
    'nickname'
  ) || 'Admin';
const userData =
localStorage.getItem('user');

if(userData){

  this.currentUser =
  JSON.parse(userData);
console.log(this.currentUser);
}

this.adminName =
localStorage.getItem('nickname')
|| 'Admin';

setInterval(() => {

  this.loadMessages();

}, 3000);
  
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

  makeAdmin(id: number) {

    this.http.put(

      `${this.API}/users/${id}/promote`,

      {},

      this.getHeaders()

    ).subscribe({

      next: () => {

        alert('Role Changed To ADMIN');

        this.loadUsers();
      },

      error: (error) => {

        console.log(error);

        alert('Failed To Change Role');
      }
    });
  }
  promoteUser(id: number) {

  this.makeAdmin(id);
}

  makeMember(id: number) {

    this.http.put(

      `${this.API}/users/${id}/demote`,

      {},

      this.getHeaders()

    ).subscribe({

      next: () => {

        alert('Role Changed To MEMBER');

        this.loadUsers();
      },

      error: (error) => {

        console.log(error);

        alert('Failed To Change Role');
      }
    });
  }

  changeDesignation(user: any) {

  const designation = prompt(

    'Enter New Designation',

    user.designation
  );

  if(
    !designation
    || designation.trim() === ''
  ) {

    return;
  }

  const body = {

    name:
      user.name,

    username:
      user.username,

    email:
      user.email,

    designation:
      designation
  };

  this.http.put(

    `${this.API}/users/${user.id}`,

    body,

    this.getHeaders()

  ).subscribe({

    next: () => {

      alert(
        'Designation Updated'
      );

      this.loadUsers();
    },

    error: (error) => {

      console.log(error);

      alert(
        'Failed To Update Designation'
      );
    }
  });
}

  deleteUser(id: number) {

    const confirmDelete =
      confirm('Delete This User?');

    if (!confirmDelete) return;

    this.http.delete(

      `${this.API}/users/${id}`,

      this.getHeaders()

    ).subscribe({

      next: () => {

        alert('User Deleted');

        this.loadUsers();
      },

      error: (error) => {

        console.log(error);

        alert('Delete Failed');
      }
    });
  }

  loadUsers() {

  this.http.get<any[]>(

    `${this.API}/users`,

    this.getHeaders()

  ).subscribe({

    next: (response) => {

      this.users = response;

      this.filteredUsers = response;

      this.totalUsers =
        response.length;
    },

    error: (error) => {

      console.log(error);

      alert('Failed To Load Users');
    }
  });
}
filterUsers() {

  this.filteredUsers =

    this.users.filter((user: any) =>

      user.name
        .toLowerCase()

        .includes(

          this.searchText
            .toLowerCase()
        )
    );
}

  loadTasks() {

  this.http.get<any[]>(

    `${this.API}/tasks`,

    this.getHeaders()

  ).subscribe({

    next: (response: any[]) => {

      console.log('ADMIN TASKS:', response);

      this.tasks = Array.isArray(response)
        ? response
        : [];

      this.totalTasks =
        this.tasks.length;

      this.completedTasks =
        this.tasks.filter(
          task => task.status === 'COMPLETED'
        ).length;

      this.pendingTasks =
        this.tasks.filter(
          task => task.status !== 'COMPLETED'
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
    },

    error: (error) => {

      console.error(
        'ADMIN LOAD TASK ERROR:',
        error
      );

      this.tasks = [];

      alert('Failed To Load Tasks');
    }
  });
}
  loadEmployeePerformance() {

  this.http.get<any[]>(

    `${this.API}/performance`,

    this.getHeaders()

  ).subscribe({

    next: (response) => {

      this.employeePerformance =
        response;
    },

    error: (error) => {

      console.log(error);
    }
  });
}
loadActivityLogs(){

  this.http.get<any[]>(

    'https://flowsync-workspace-api-2.onrender.com/api/activity'

  ).subscribe({

    next:(response)=>{

      console.log(response);

      this.activityLogs = response;

      this.unreadCount =
      response.length;

    },

    error:(err)=>{

      console.log(err);

    }

  });

}
approveTask(id: number) {

  const token =
    localStorage.getItem('token');

  this.http.put(

    `https://flowsync-workspace-api-2.onrender.com/api/tasks/${id}/status?status=COMPLETED`,

    {},

    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

  ).subscribe({

    next: () => {

      alert('Task Approved');

      // REFRESH DATA

      this.loadTasks();

      this.loadEmployeePerformance();

      this.loadActivityLogs();
    },

    error: (error) => {

      console.log(error);

      alert('Approval Failed');
    }
  });
}
deleteTask(id: number) {

  this.http.delete(

    `https://flowsync-workspace-api-2.onrender.com/api/tasks/${id}`,

    this.getHeaders()

  ).subscribe({

    next: () => {

      alert('Task Deleted');

      this.loadTasks();
    },

    error: (err) => {

      console.error(err);

      alert('Delete Failed');
    }
  });
}
loadNotifications() {

  const token =
    localStorage.getItem('token');

  this.http.get<any[]>(

    'https://flowsync-workspace-api-2.onrender.com/api/notifications',

    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }

  ).subscribe({

    next:(response)=>{

      console.log(
        'NOTIFICATION RESPONSE:',
        response
      );

      this.notifications =
        response;

      this.unreadCount =
        response.length;

    },

    error:(err)=>{

      console.log(err);

    }

  });

}
createEmployee() {

  const body = {

    name:
      this.employeeName,

    username:
      this.employeeUsername,

    email:
      this.employeeEmail,

    designation:
      this.employeeDesignation,

    password:
      this.employeePassword
  };

  this.http.post(

    'https://flowsync-workspace-api-2.onrender.com/api/admin/create-employee',

    body,

    {
      headers: {
        Authorization:
          'Bearer ' +
          localStorage.getItem('token')
      }
    }

  ).subscribe({

    next: () => {

      alert('Employee Created');

      this.loadUsers();
    },

    error: (error) => {

      console.log(error);

      alert('Failed');
    }
  });
}
loadMessages() {

  this.http.get(

    'https://flowsync-workspace-api-2.onrender.com/api/discussions',

    this.getHeaders()

  ).subscribe({

    next: (response: any) => {

      this.messages = response;
    },

    error: (error) => {

      console.log(error);
    }
  });
}
sendMessage() {

  if(
    !this.newMessage
    || this.newMessage.trim() === ''
  ) {

    return;
  }

  const body = {

    message: this.newMessage
  };

  const token =
    localStorage.getItem('token');

  this.http.post(

    'https://flowsync-workspace-api-2.onrender.com/api/discussions',

    body,

    {
      headers: {

        Authorization:
          `Bearer ${token}`
      }
    }

  ).subscribe({

    next: () => {

      this.newMessage = '';

      this.loadMessages();
    },

    error: (error) => {

      console.log(error);

      alert(
        'Failed To Send Message'
      );
    }
  });
}
logout() {

  localStorage.clear();

  this.router.navigate([
    '/login'
  ]);
}
toggleNotifications() {

  this.showNotifications =

    !this.showNotifications;

  if(this.showNotifications) {

    this.unreadCount = 0;
  }
}
changeRole(
  userId: number,
  role: string
) {

  const token =
    localStorage.getItem('token');

  this.http.put(

    `https://flowsync-workspace-api-2.onrender.com/api/admin/users/${userId}/role?role=${role}`,

    {},

    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }

  ).subscribe({

    next: () => {

      alert('Role Updated');

      this.loadUsers();
    },

    error: (error) => {

      console.log(error);

      alert('Role Update Failed');
    }
  });
}
scrollToSection(sectionId: string): void {

  const element = document.getElementById(sectionId);

  if (element) {

    element.scrollIntoView({
      behavior: 'smooth'
    });
  }
}
isChatFullscreen = false;

toggleMinimize() {

  this.isChatMinimized = !this.isChatMinimized;

  if(this.isChatMinimized){
    this.isChatFullscreen = false;
  }

}

toggleFullscreen() {

  this.isChatFullscreen = !this.isChatFullscreen;

  if(this.isChatFullscreen){
    this.isChatMinimized = false;
  }

}

}