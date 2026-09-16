import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, timer, takeUntil } from 'rxjs';
import { AuthStateService } from '../../services/auth-state.service';
import { OrganizationStateService, OrganizationMetrics, OrganizationInfo, TeamInfo, TeamLeadInfo } from '../../services/organization-state.service';
import { AdminDataService } from '../../services/admin-data.service';
import { DiscussionService, DiscussionMessage } from '../../services/discussion.service';
import { ToastService } from '../../services/toast.service';
import { ResignationService, ResignationItem } from '../../services/resignation.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './owner-dashboard.html',
  styleUrls: ['./owner-dashboard.css']
})
export class OwnerDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  org: OrganizationInfo | null = null;
  metrics: OrganizationMetrics | null = null;
  teams: TeamInfo[] = [];
  teamLeads: TeamLeadInfo[] = [];
  selectedTeamLead: TeamLeadInfo | null = null;
  activityLogs: any[] = [];
  messages: DiscussionMessage[] = [];
  resignations: ResignationItem[] = [];
  loading = true;

  // Create Team Lead Modal State
  showCreateLeadModal = false;
  newLeadName = '';
  newLeadEmail = '';
  newLeadPassword = '';
  newLeadDesignation = '';
  newLeadUsername = '';
  creatingLead = false;

  // Chat Tag Suggestions State
  newMessage = '';
  showTagSuggestions = false;
  filteredTagUsers: any[] = [];
  taggedUser = '';

  constructor(
    public authState: AuthStateService,
    public orgState: OrganizationStateService,
    private adminData: AdminDataService,
    private discussionService: DiscussionService,
    private toastService: ToastService,
    private resignationService: ResignationService
  ) {}

  ngOnInit(): void {
    this.loadData();

    // Poll live discussion messages every 10s
    timer(10000, 10000)
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

  loadData(): void {
    this.loading = true;

    this.orgState.loadOrganization()
      .pipe(takeUntil(this.destroy$))
      .subscribe(org => this.org = org);

    this.orgState.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.metrics = data;
          this.loading = false;
        },
        error: () => this.loading = false
      });

    this.orgState.getTeams()
      .pipe(takeUntil(this.destroy$))
      .subscribe(teams => this.teams = teams);

    this.orgState.getTeamLeads()
      .pipe(takeUntil(this.destroy$))
      .subscribe(leads => this.teamLeads = leads);

    this.adminData.getActivityLogs()
      .pipe(takeUntil(this.destroy$))
      .subscribe(logs => this.activityLogs = logs);

    this.loadMessages();
    this.loadResignations();
  }

  activeChatChannel: 'ORGANIZATION' | 'DIRECT' = 'ORGANIZATION';
  selectedDirectUser: any = null;

  selectDirectUser(user: any): void {
    this.selectedDirectUser = user;
    this.activeChatChannel = 'DIRECT';
    this.loadMessages();
  }

  switchChatChannel(channel: 'ORGANIZATION' | 'DIRECT'): void {
    this.activeChatChannel = channel;
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
      this.discussionService.getMessages('ORGANIZATION')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (msgs) => this.messages = msgs || [],
          error: () => {}
        });
    }
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

    const feedback = prompt(`Executive feedback for resignation request (${status}):`, '');
    this.resignationService.updateResignationStatus(id, status, feedback || undefined, approvedLastDay)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Resignation Reviewed', `Resignation request marked as ${status}.`);
          this.loadResignations(true);
        },
        error: (err) => {
          this.toastService.error('Error', err?.error?.message || 'Failed to process resignation.');
        }
      });
  }

  openCreateLeadModal(): void {
    this.newLeadName = '';
    this.newLeadEmail = '';
    this.newLeadPassword = '';
    this.newLeadDesignation = '';
    this.newLeadUsername = '';
    this.showCreateLeadModal = true;
  }

  closeCreateLeadModal(): void {
    this.showCreateLeadModal = false;
  }

  createTeamLead(): void {
    if (!this.newLeadName.trim() || !this.newLeadEmail.trim() || !this.newLeadPassword) {
      this.toastService.warning('Missing Fields', 'Please provide Name, Email, and Password for Team Lead.');
      return;
    }

    if (!this.newLeadDesignation.trim()) {
      this.toastService.warning('Required Field', 'Please provide Department / Team Name (e.g., Development, Marketing, Sales).');
      return;
    }

    this.creatingLead = true;
    const dept = this.newLeadDesignation.trim();
    const payload = {
      name: this.newLeadName.trim(),
      email: this.newLeadEmail.trim(),
      password: this.newLeadPassword,
      designation: dept,
      username: this.newLeadUsername.trim() || this.newLeadEmail.trim().split('@')[0]
    };

    this.orgState.createTeamLead(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.creatingLead = false;
          this.toastService.success('Team Lead & Department Created', `Successfully created ${res.name} as Team Lead for "${dept}" department.`);
          this.closeCreateLeadModal();
          this.loadData();
        },
        error: (err) => {
          this.creatingLead = false;
          const msg = err?.error?.message || err?.error?.error || 'Failed to create Team Lead account.';
          this.toastService.error('Error Creating Team Lead', msg);
        }
      });
  }

  openTeamLeadModal(lead: TeamLeadInfo): void {
    this.selectedTeamLead = lead;
  }

  closeTeamLeadModal(): void {
    this.selectedTeamLead = null;
  }

  // Tag suggestions handler for Live Chat
  onChatInput(event: Event): void {
    const input = (event.target as HTMLTextAreaElement).value;
    const cursor = (event.target as HTMLTextAreaElement).selectionStart;
    const textBeforeCursor = input.substring(0, cursor);
    const lastAt = textBeforeCursor.lastIndexOf('@');

    if (lastAt !== -1 && (lastAt === 0 || /\s/.test(textBeforeCursor[lastAt - 1]))) {
      const q = textBeforeCursor.substring(lastAt + 1).toLowerCase();
      this.filteredTagUsers = this.teamLeads.filter(u =>
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
      this.discussionService.sendMessage(content, tagged, 'ORGANIZATION')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.loadMessages(true),
          error: () => this.toastService.error('Chat Error', 'Failed to send message.')
        });
    }
  }
}
