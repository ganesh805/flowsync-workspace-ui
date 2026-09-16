import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TaskService } from '../../services/task.service';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css'
})
export class TaskDetails implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private readonly COMMENTS_API = `${environment.apiUrl}/comments`;

  task: any;
  comments: any[] = [];
  newComment = '';
  loading = false;
  submittingComment = false;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private toastService: ToastService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const taskId = Number(this.route.snapshot.params['id']);
    if (taskId) {
      this.loadTask(taskId);
      this.loadComments(taskId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTask(id: number): void {
    this.loading = true;
    this.taskService.getTaskById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.task = res;
        },
        error: (err) => {
          this.loading = false;
          this.toastService.error('Task Not Found', 'Could not load task details or unauthorized access.');
        }
      });
  }

  loadComments(taskId: number): void {
    this.http.get<any[]>(`${this.COMMENTS_API}/${taskId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.comments = res || [],
        error: () => {}
      });
  }

  addComment(): void {
    if (!this.newComment.trim()) return;

    const content = this.newComment.trim();
    this.submittingComment = true;

    this.http.post(`${this.COMMENTS_API}/${this.task.id}`, { message: content })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submittingComment = false;
          this.newComment = '';
          this.toastService.success('Comment Added', 'Your comment has been posted.');
          this.loadComments(this.task.id);
        },
        error: (err) => {
          this.submittingComment = false;
          this.toastService.error('Error', err?.error?.message || 'Failed to post comment.');
        }
      });
  }
}