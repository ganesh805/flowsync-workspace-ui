import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthStateService } from '../../services/auth-state.service';
import { NotificationStateService } from '../../services/notification-state.service';
import { AdminDataService } from '../../services/admin-data.service';
import { DiscussionService, DiscussionMessage } from '../../services/discussion.service';
import { TaskService } from '../../services/task.service';
import { ToastService } from '../../services/toast.service';
import { ResignationService, ResignationItem } from '../../services/resignation.service';

import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  PieController,
  ChartConfiguration,
  ChartType
} from 'chart.js';

Chart.register(PieController, ArcElement, Tooltip, Legend);

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
export class AdminDashboard implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  users: any[] = [];
  tasks: any[] = [];
  employeePerformance: any[] = [];
  activityLogs: any[] = [];
  messages: DiscussionMessage[] = [];
  resignations: ResignationItem[] = [];

  activeChatChannel: 'ORGANIZATION' | 'TEAM' | 'DIRECT' = 'ORGANIZATION';
  selectedDirectUser: any = null;

  // Task Comments Modal State
  selectedTaskForComments: any = null;
  taskComments: any[] = [];
  newCommentText = '';
  loadingComments = false;
  submittingComment = false;

  searchText = '';
  filteredUsers: any[] = [];
  showNotifications = false;
  darkMode = false;

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
  adminName = '';
  newMessage = '';

  // Tag suggestions state
  showTagSuggestions = false;
  filteredTagUsers: any[] = [];
  taggedUser = '';

  loadingTasks = false;
  loadingUsers = false;

  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Completed', 'Pending'],
    datasets: [{ data: [0, 0] }]
  };

  constructor(
    public authState: AuthStateService,
    public notificationState: NotificationStateService,
    private adminData: AdminDataService,
    private discussionService: DiscussionService,
    private taskService: TaskService,
    private toastService: ToastService,
    private resignationService: ResignationService,
    private router: Router
  ) {}

  colleagues: any[] = [];
  filteredColleagues: any[] = [];
  chatSearchQuery = '';

  loadColleagues(): void {
    this.discussionService.getColleagues()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cols) => {
          this.colleagues = cols || [];
          this.filterColleagues();
        },
        error: () => {}
      });
  }

  filterColleagues(): void {
    const q = this.chatSearchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredColleagues = [...this.colleagues];
    } else {
      this.filteredColleagues = this.colleagues.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.designation?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    }
  }

  ngOnInit(): void {
    this.companyName = this.authState.getCompanyName() || '';
    this.adminName = this.authState.getNickname() || 'Admin';

    this.loadAllData();
    this.loadColleagues();
    this.notificationState.loadNotifications().subscribe();

    timer(5000, 5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.authState.isAuthenticated()) {
          this.loadMessages(true);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllData(): void {
    this.loadUsers();
    this.loadTasks();
    this.loadEmployeePerformance();
    this.loadActivityLogs();
    this.loadMessages();
    this.loadResignations();
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.adminData.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.loadingUsers = false;
          this.users = res || [];
          this.filterUsers();
          // Total users count excludes OWNER/CEO
          this.totalUsers = this.users.filter(u => u.role !== 'OWNER').length;
        },
        error: () => {
          this.loadingUsers = false;
        }
      });
  }

  filterUsers(): void {
    const q = this.searchText.toLowerCase().trim();
    // Exclude CEO / Owner details from Team Lead employee view!
    let list = this.users.filter(u => u.role !== 'OWNER');
    if (q) {
      list = list.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.designation?.toLowerCase().includes(q)
      );
    }
    this.filteredUsers = list;
  }

  loadTasks(silent = false): void {
    if (!silent) this.loadingTasks = true;
    this.adminData.getTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.loadingTasks = false;
          this.tasks = Array.isArray(res) ? res : [];
          this.totalTasks = this.tasks.length;
          this.completedTasks = this.tasks.filter(t => t.status === 'COMPLETED').length;
          this.pendingTasks = this.totalTasks - this.completedTasks;

          this.pieChartData = {
            labels: ['Completed', 'Pending'],
            datasets: [{ data: [this.completedTasks, this.pendingTasks] }]
          };
        },
        error: () => {
          this.loadingTasks = false;
        }
      });
  }

  loadEmployeePerformance(silent = false): void {
    this.adminData.getPerformance()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.employeePerformance = res || [],
        error: () => {}
      });
  }

  loadActivityLogs(silent = false): void {
    this.adminData.getActivityLogs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.activityLogs = res || [],
        error: () => {}
      });
  }

  openTaskComments(task: any): void {
    this.selectedTaskForComments = task;
    this.newCommentText = '';
    this.loadTaskComments(task.id);
  }

  closeTaskComments(): void {
    this.selectedTaskForComments = null;
    this.taskComments = [];
  }

  loadTaskComments(taskId: number): void {
    this.loadingComments = true;
    this.taskService.getTaskComments(taskId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comments) => {
          this.loadingComments = false;
          this.taskComments = comments || [];
        },
        error: () => {
          this.loadingComments = false;
        }
      });
  }

  submitTaskComment(): void {
    if (!this.newCommentText.trim() || !this.selectedTaskForComments) return;
    this.submittingComment = true;
    const msg = this.newCommentText.trim();
    this.newCommentText = '';

    this.taskService.addTaskComment(this.selectedTaskForComments.id, msg)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submittingComment = false;
          this.loadTaskComments(this.selectedTaskForComments.id);
          this.toastService.success('Comment Posted', 'Comment added to task discussion thread.');
        },
        error: () => {
          this.submittingComment = false;
          this.toastService.error('Error', 'Failed to post comment.');
        }
      });
  }

  selectDirectUser(user: any): void {
    this.selectedDirectUser = user;
    this.activeChatChannel = 'DIRECT';
    this.loadMessages();
  }

  loadMessages(silent = false): void {
    if (this.activeChatChannel === 'DIRECT' && this.selectedDirectUser) {
      this.discussionService.getDirectMessages(this.selectedDirectUser.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (msgs) => this.messages = msgs || [],
          error: () => {}
        });
    } else {
      this.discussionService.getMessages(this.activeChatChannel)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (msgs) => this.messages = msgs || [],
          error: () => {}
        });
    }
  }

  switchChatChannel(channel: 'ORGANIZATION' | 'TEAM' | 'DIRECT'): void {
    this.activeChatChannel = channel;
    this.loadMessages();
  }

  loadResignations(silent = false): void {
    this.resignationService.getOrganizationResignations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => this.resignations = items || [],
        error: () => {}
      });
  }

  reviewResignation(id: number, status: 'APPROVED' | 'REJECTED'): void {
    let approvedLastDay: string | undefined = undefined;
    if (status === 'APPROVED') {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 90);
      const defaultDateStr = defaultDate.toISOString().split('T')[0];
      const customDay = prompt(`Approve Resignation Request:\n\nSet / Revise Final Last Working Day (YYYY-MM-DD) as per notice period policy:\n(Default 90-day date: ${defaultDateStr})`, defaultDateStr);
      if (customDay === null) return;
      approvedLastDay = customDay.trim() || defaultDateStr;
    }

    const feedback = prompt(`Enter feedback/comments for employee resignation (${status}):`, '');
    this.resignationService.updateResignationStatus(id, status, feedback || undefined, approvedLastDay)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Resignation Processed', `Resignation request marked as ${status}.`);
          this.loadResignations(true);
        },
        error: (err) => {
          this.toastService.error('Error', err?.error?.message || 'Failed to update resignation status.');
        }
      });
  }

  get myCreatedCount(): number {
    const currentNick = this.authState.getNickname();
    return this.users.filter(u => u.role === 'MEMBER' && (u.createdBy?.name === currentNick || !u.createdBy)).length;
  }

  createEmployee(): void {
    if (!this.employeeName.trim() || !this.employeeEmail.trim() || !this.employeePassword) {
      this.toastService.warning('Required Fields', 'Please fill in Name, Email, and Password.');
      return;
    }

    if (this.authState.isStrictAdmin() && this.myCreatedCount >= 20) {
      this.toastService.warning('Limit Reached', 'Team Lead employee creation limit reached (Maximum 20 team employees per Team Lead).');
      return;
    }

    const employee = {
      name: this.employeeName.trim(),
      username: this.employeeUsername.trim() || this.employeeEmail.trim().split('@')[0],
      email: this.employeeEmail.trim(),
      designation: this.employeeDesignation.trim() || 'Employee',
      password: this.employeePassword
    };

    this.adminData.createEmployee(employee)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Employee Created', `Account for ${employee.name} created.`);
          this.employeeName = '';
          this.employeeUsername = '';
          this.employeeEmail = '';
          this.employeeDesignation = '';
          this.employeePassword = '';
          this.loadUsers();
        },
        error: (err) => {
          const msg = err?.error?.message || err?.error?.error || 'Failed to create employee.';
          this.toastService.error('Error Creating Employee', msg);
        }
      });
  }

  changeRole(userId: number, newRole: string): void {
    this.adminData.updateUserRole(userId, newRole)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Role Updated', `User role changed to ${newRole}.`);
          this.loadUsers();
        },
        error: (err) => {
          this.toastService.error('Error', err?.error?.message || 'Failed to update role.');
        }
      });
  }

  changeDesignation(user: any): void {
    const newDesignation = prompt(`Update designation for ${user.name}:`, user.designation || 'Employee');
    if (newDesignation !== null && newDesignation.trim()) {
      this.adminData.updateUserDesignation(user.id, newDesignation.trim())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success('Designation Updated', `Updated ${user.name}'s designation to "${newDesignation.trim()}".`);
            this.loadUsers();
          },
          error: (err) => {
            this.toastService.error('Error', err?.error?.message || 'Failed to update designation.');
          }
        });
    }
  }

  deleteUser(userId: number): void {
    if (!confirm('Are you sure you want to remove this employee?')) return;

    this.adminData.deleteUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('User Deleted', 'Employee removed from workspace.');
          this.loadUsers();
        },
        error: (err) => {
          this.toastService.error('Error', err?.error?.message || 'Delete user failed.');
        }
      });
  }

  assignTask(): void {
    if (!this.taskTitle.trim() || !this.assignedUserId) {
      this.toastService.warning('Missing Information', 'Task title and assigned employee are required.');
      return;
    }

    const task = {
      title: this.taskTitle.trim(),
      description: this.taskDescription.trim(),
      dueDate: this.taskDueDate,
      priority: this.taskPriority,
      assignedToId: Number(this.assignedUserId)
    };

    this.taskService.createTask(task)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Task Assigned', 'New task assigned successfully.');
          this.taskTitle = '';
          this.taskDescription = '';
          this.taskDueDate = '';
          this.taskPriority = 'MEDIUM';
          this.assignedUserId = '';
          this.loadTasks(true);
        },
        error: (err) => {
          this.toastService.error('Assignment Error', err?.error?.message || 'Failed to assign task.');
        }
      });
  }

  approveTask(taskId: number): void {
    this.taskService.updateTaskStatus(taskId, 'COMPLETED')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Task Approved', 'Task marked as COMPLETED.');
          this.loadTasks(true);
          this.loadEmployeePerformance(true);
          this.loadActivityLogs(true);
        },
        error: (err) => {
          this.toastService.error('Approval Error', err?.error?.message || 'Approval failed.');
        }
      });
  }

  deleteTask(taskId: number): void {
    if (!confirm('Delete this task permanently?')) return;

    this.taskService.deleteTask(taskId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Task Deleted', 'Task deleted.');
          this.loadTasks(true);
        },
        error: (err) => {
          this.toastService.error('Delete Error', err?.error?.message || 'Failed to delete task.');
        }
      });
  }

  // Tag suggestions handler
  onChatInput(event: Event): void {
    const input = (event.target as HTMLTextAreaElement).value;
    const cursor = (event.target as HTMLTextAreaElement).selectionStart;
    const textBeforeCursor = input.substring(0, cursor);
    const lastAt = textBeforeCursor.lastIndexOf('@');

    if (lastAt !== -1 && (lastAt === 0 || /\s/.test(textBeforeCursor[lastAt - 1]))) {
      const q = textBeforeCursor.substring(lastAt + 1).toLowerCase();
      this.filteredTagUsers = this.filteredUsers.filter(u =>
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
      this.showTagSuggestions = this.filteredTagUsers.length > 0;
    } else {
      this.showTagSuggestions = false;
    }
  }

  selectTagUser(user: any): void {
    const lastAt = this.newMessage.lastIndexOf('@');
    if (lastAt !== -1) {
      const prefix = this.newMessage.substring(0, lastAt);
      this.newMessage = `${prefix}@${user.name} `;
      this.taggedUser = user.name;
    }
    this.showTagSuggestions = false;
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const content = this.newMessage.trim();
    const tagged = this.taggedUser || undefined;
    this.newMessage = '';
    this.taggedUser = '';
    this.showTagSuggestions = false;

    if (this.activeChatChannel === 'DIRECT' && this.selectedDirectUser) {
      this.discussionService.sendDirectMessage(this.selectedDirectUser.id, content)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.loadMessages(true),
          error: () => this.toastService.error('Chat Error', 'Failed to send direct message.')
        });
    } else {
      this.discussionService.sendMessage(content, tagged, this.activeChatChannel)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.loadMessages(true),
          error: () => this.toastService.error('Chat Error', 'Failed to send message.')
        });
    }
  }

  scrollToSection(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
  }

  logout(): void {
    this.authState.logout();
  }
}