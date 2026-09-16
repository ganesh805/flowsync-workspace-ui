import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { AuthStateService } from '../../services/auth-state.service';
import { NotificationStateService } from '../../services/notification-state.service';
import { DiscussionService, DiscussionMessage } from '../../services/discussion.service';
import { AdminDataService } from '../../services/admin-data.service';
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
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  tasks: any[] = [];
  messages: DiscussionMessage[] = [];
  users: any[] = [];
  myResignations: ResignationItem[] = [];

  // Resignation Form state
  resignationReason = '';
  resignationLetter = '';
  proposedLastDay = '';
  submittingResignation = false;

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
  companyName = '';
  unreadCount = 0;

  get minNoticeDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split('T')[0];
  }

  get approvedResignation(): ResignationItem | null {
    return this.myResignations.find(r => r.status === 'APPROVED') || null;
  }

  get remainingWorkingDays(): number {
    const res = this.approvedResignation;
    if (!res) return 0;
    const targetDateStr = res.approvedLastDay || res.proposedLastDay;
    if (!targetDateStr) return 0;

    const targetDate = new Date(targetDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  editingTaskId: number | null = null;
  totalTasks = 0;
  completedTasks = 0;
  pendingTasks = 0;

  currentPassword = '';
  newPassword = '';
  showNotifications = false;
  newMessage = '';

  // Tag suggestions state
  showTagSuggestions = false;
  filteredTagUsers: any[] = [];
  taggedUser = '';

  loadingTasks = false;
  loadingMessages = false;

  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Completed', 'Pending'],
    datasets: [{ data: [0, 0] }]
  };

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    public authState: AuthStateService,
    public notificationState: NotificationStateService,
    private discussionService: DiscussionService,
    private adminData: AdminDataService,
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
    this.nickname = this.authState.getNickname() || 'User';
    this.companyName = this.authState.getCompanyName() || '';

    this.loadTasks();
    this.loadUsers();
    this.loadColleagues();
    this.notificationState.loadNotifications().subscribe();
    this.loadMessages();
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

  loadUsers(): void {
    this.adminData.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.users = (res || []).filter((u: any) => u.role !== 'OWNER'),
        error: () => {}
      });
  }

  loadTasks(silent = false): void {
    if (!silent) this.loadingTasks = true;

    this.taskService.getTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.loadingTasks = false;
          this.tasks = Array.isArray(response) ? response : [];
          this.calculateStats();
        },
        error: (err) => {
          this.loadingTasks = false;
          if (!silent) this.toastService.error('Tasks', 'Failed to load assigned tasks.');
        }
      });
  }

  calculateStats(): void {
    this.totalTasks = this.tasks.length;
    this.completedTasks = this.tasks.filter(t => t.status === 'COMPLETED').length;
    this.pendingTasks = this.totalTasks - this.completedTasks;

    this.pieChartData = {
      labels: ['Completed', 'Pending'],
      datasets: [{ data: [this.completedTasks, this.pendingTasks] }]
    };
  }

  updateStatus(taskId: number, status: string): void {
    this.taskService.updateTaskStatus(taskId, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Status Updated', `Task status changed to ${status.replace('_', ' ')}.`);
          this.loadTasks(true);
        },
        error: (err) => {
          const msg = err?.error?.message || 'Status update failed.';
          this.toastService.error('Update Error', msg);
        }
      });
  }

  requestCompletion(taskId: number): void {
    this.updateStatus(taskId, 'COMPLETION_REQUESTED');
  }

  activeChatChannel: 'TEAM' | 'DIRECT' = 'TEAM';
  selectedDirectUser: any = null;

  // Task Comments Modal State
  selectedTaskForComments: any = null;
  taskComments: any[] = [];
  newCommentText = '';
  loadingComments = false;
  submittingComment = false;

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

  switchChatChannel(channel: 'TEAM' | 'DIRECT'): void {
    this.activeChatChannel = channel;
    this.loadMessages();
  }

  loadMessages(silent = false): void {
    if (!silent) this.loadingMessages = true;

    if (this.activeChatChannel === 'DIRECT' && this.selectedDirectUser) {
      this.discussionService.getDirectMessages(this.selectedDirectUser.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (msgs) => {
            this.loadingMessages = false;
            this.messages = msgs || [];
          },
          error: () => this.loadingMessages = false
        });
    } else {
      this.discussionService.getMessages('TEAM')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (msgs) => {
            this.loadingMessages = false;
            this.messages = msgs || [];
          },
          error: () => this.loadingMessages = false
        });
    }
  }

  loadMyResignations(silent = false): void {
    this.resignationService.getMyResignations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => this.myResignations = items || [],
        error: () => {}
      });
  }

  submitResignation(): void {
    if (!this.resignationReason.trim()) {
      this.toastService.warning('Required Field', 'Please state the primary reason for resignation.');
      return;
    }

    this.submittingResignation = true;
    const payload = {
      reason: this.resignationReason.trim(),
      letter: this.resignationLetter.trim() || undefined,
      proposedLastDay: this.proposedLastDay || undefined
    };

    this.resignationService.submitResignation(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submittingResignation = false;
          this.toastService.success('Resignation Submitted', 'Your resignation request has been sent to your Team Lead & Admin.');
          this.resignationReason = '';
          this.resignationLetter = '';
          this.proposedLastDay = '';
          this.loadMyResignations(true);
        },
        error: (err) => {
          this.submittingResignation = false;
          this.toastService.error('Submission Error', err?.error?.message || 'Failed to submit resignation request.');
        }
      });
  }

  onChatInput(event: Event): void {
    const input = (event.target as HTMLTextAreaElement).value;
    const cursor = (event.target as HTMLTextAreaElement).selectionStart;
    const textBeforeCursor = input.substring(0, cursor);
    const lastAt = textBeforeCursor.lastIndexOf('@');

    if (lastAt !== -1 && (lastAt === 0 || /\s/.test(textBeforeCursor[lastAt - 1]))) {
      const q = textBeforeCursor.substring(lastAt + 1).toLowerCase();
      this.filteredTagUsers = this.users.filter(u =>
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
      this.discussionService.sendMessage(content, tagged, 'TEAM')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.loadMessages(true),
          error: () => this.toastService.error('Chat Error', 'Failed to send message.')
        });
    }
  }

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword) {
      this.toastService.warning('Password Update', 'Please fill in both current and new password.');
      return;
    }

    this.authService.changePassword(this.currentPassword, this.newPassword)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (msg) => {
          this.toastService.success('Password Changed', 'Your password has been updated successfully.');
          this.currentPassword = '';
          this.newPassword = '';
        },
        error: (err) => {
          const msg = err?.error?.message || 'Password update failed.';
          this.toastService.error('Error', msg);
        }
      });
  }

  get filteredTasks(): any[] {
    return this.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesFilter = this.selectedFilter === 'ALL' || task.status === this.selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }

  get paginatedTasks(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTasks.slice(start, start + this.itemsPerPage);
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
  }

  logout(): void {
    this.authState.logout();
  }
}