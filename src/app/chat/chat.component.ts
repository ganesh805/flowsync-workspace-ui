import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, timer, takeUntil } from 'rxjs';
import { AuthStateService } from '../services/auth-state.service';
import { ChannelService, Channel, ChannelMessage } from '../services/channel.service';
import { DirectMessageService } from '../services/direct-message.service';
import { OrganizationStateService, TeamInfo } from '../services/organization-state.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private destroy$ = new Subject<void>();

  // Channels & DM Contacts List
  channels: Channel[] = [];
  dmContacts: any[] = [];
  teams: TeamInfo[] = [];

  // Active Selection
  activeType: 'CHANNEL' | 'DM' = 'CHANNEL';
  selectedChannel: Channel | null = null;
  selectedDMContact: any = null;

  // Active Messages
  messages: ChannelMessage[] = [];
  loadingMessages = false;
  loadingChannels = false;

  // Input & Modal state
  messageInput = '';
  editingMessageId: number | null = null;
  editInput = '';

  // Create Channel Modal state
  showCreateModal = false;
  newChannelName = '';
  newChannelDescription = '';
  newChannelType: 'PUBLIC_ORG' | 'PUBLIC_TEAM' | 'PRIVATE' = 'PUBLIC_TEAM';
  selectedTeamId: number | null = null;
  submittingChannel = false;

  constructor(
    public authState: AuthStateService,
    private channelService: ChannelService,
    private dmService: DirectMessageService,
    private orgState: OrganizationStateService,
    private toastService: ToastService
  ) {}

  get isOwner(): boolean { return this.authState.isOwner(); }
  get isAdmin(): boolean { return this.authState.isAdmin(); }
  get canCreateChannel(): boolean { return this.isOwner || this.isAdmin; }
  get currentUserId(): number | null { return this.authState.getUserId(); }

  ngOnInit(): void {
    this.loadChannels();
    this.loadDMContacts();
    this.loadTeams();

    // 5-second real-time auto sync
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

  loadChannels(silent = false): void {
    if (!silent) this.loadingChannels = true;
    this.channelService.getChannels()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (chans) => {
          this.loadingChannels = false;
          this.channels = chans || [];
          if (!this.selectedChannel && !this.selectedDMContact && this.channels.length > 0) {
            this.selectChannel(this.channels[0]);
          }
        },
        error: () => this.loadingChannels = false
      });
  }

  loadDMContacts(): void {
    this.dmService.getDirectContacts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contacts) => this.dmContacts = contacts || [],
        error: () => {}
      });
  }

  loadTeams(): void {
    if (this.canCreateChannel) {
      this.orgState.getTeams()
        .pipe(takeUntil(this.destroy$))
        .subscribe(teams => this.teams = teams || []);
    }
  }

  selectChannel(channel: Channel): void {
    this.activeType = 'CHANNEL';
    this.selectedChannel = channel;
    this.selectedDMContact = null;
    this.loadMessages();
  }

  selectDMContact(contact: any): void {
    this.activeType = 'DM';
    this.selectedDMContact = contact;
    this.selectedChannel = null;
    this.loadMessages();
  }

  loadMessages(silent = false): void {
    if (!silent) this.loadingMessages = true;

    if (this.activeType === 'CHANNEL' && this.selectedChannel) {
      this.channelService.getChannelMessages(this.selectedChannel.id, 0, 50)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (page) => {
            this.loadingMessages = false;
            const content = page?.content || [];
            this.messages = [...content].reverse(); // oldest top, newest bottom
            if (!silent) this.scrollToBottom();
          },
          error: () => this.loadingMessages = false
        });
    } else if (this.activeType === 'DM' && this.selectedDMContact) {
      this.dmService.getDirectMessages(this.selectedDMContact.id, 0, 50)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (page) => {
            this.loadingMessages = false;
            const content = page?.content || [];
            this.messages = [...content].reverse();
            if (!silent) this.scrollToBottom();
          },
          error: () => this.loadingMessages = false
        });
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    if (!this.messageInput.trim()) return;

    const text = this.messageInput.trim();
    this.messageInput = '';

    if (this.activeType === 'CHANNEL' && this.selectedChannel) {
      this.channelService.sendChannelMessage(this.selectedChannel.id, text)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadMessages(true);
            setTimeout(() => this.scrollToBottom(), 100);
          },
          error: (err) => this.toastService.error('Chat Error', err?.error?.message || 'Failed to send message.')
        });
    } else if (this.activeType === 'DM' && this.selectedDMContact) {
      this.dmService.sendDirectMessage(this.selectedDMContact.id, text)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadMessages(true);
            setTimeout(() => this.scrollToBottom(), 100);
          },
          error: (err) => this.toastService.error('Chat Error', err?.error?.message || 'Failed to send direct message.')
        });
    }
  }

  startEditMessage(msg: ChannelMessage): void {
    this.editingMessageId = msg.id;
    this.editInput = msg.content;
  }

  cancelEdit(): void {
    this.editingMessageId = null;
    this.editInput = '';
  }

  saveEditMessage(msgId: number): void {
    if (!this.editInput.trim()) return;
    this.channelService.editMessage(msgId, this.editInput.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.editingMessageId = null;
          this.editInput = '';
          this.loadMessages(true);
        },
        error: (err) => this.toastService.error('Error', err?.error?.message || 'Failed to edit message.')
      });
  }

  deleteMessage(msgId: number): void {
    if (!confirm('Are you sure you want to delete this message?')) return;
    this.channelService.deleteMessage(msgId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadMessages(true),
        error: (err) => this.toastService.error('Error', err?.error?.message || 'Failed to delete message.')
      });
  }

  openCreateChannelModal(): void {
    if (!this.canCreateChannel) return;
    this.newChannelName = '';
    this.newChannelDescription = '';
    this.newChannelType = this.isOwner ? 'PUBLIC_ORG' : 'PUBLIC_TEAM';
    this.selectedTeamId = null;
    this.showCreateModal = true;
  }

  closeCreateChannelModal(): void {
    this.showCreateModal = false;
  }

  submitCreateChannel(): void {
    if (!this.newChannelName.trim()) {
      this.toastService.warning('Required', 'Channel name is required.');
      return;
    }

    this.submittingChannel = true;
    const req = {
      name: this.newChannelName.trim(),
      description: this.newChannelDescription.trim() || undefined,
      channelType: this.newChannelType,
      teamId: this.selectedTeamId || undefined
    };

    this.channelService.createChannel(req)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.submittingChannel = false;
          this.toastService.success('Channel Created', `Successfully created #${created.name}`);
          this.closeCreateChannelModal();
          this.loadChannels();
          this.selectChannel(created);
        },
        error: (err) => {
          this.submittingChannel = false;
          this.toastService.error('Error', err?.error?.message || 'Failed to create channel.');
        }
      });
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch {}
  }
}
