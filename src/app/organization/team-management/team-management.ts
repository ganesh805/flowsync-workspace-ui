import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrganizationStateService, TeamInfo } from '../../services/organization-state.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './team-management.html',
  styleUrls: ['./team-management.css']
})
export class TeamManagementComponent implements OnInit {
  teams: TeamInfo[] = [];
  users: any[] = [];
  loading = true;
  creatingTeam = false;

  newTeamName = '';
  newTeamDescription = '';
  newTeamLeadId: number | null = null;
  showCreateModal = false;

  constructor(
    public orgState: OrganizationStateService,
    private adminData: AdminDataService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadTeams();
    this.loadUsers();
  }

  loadTeams(): void {
    this.loading = true;
    this.orgState.getTeams().subscribe({
      next: (data) => {
        this.teams = data;
        this.loading = false;
      },
      error: (err) => {
        this.toastService.error('Error', err?.error?.message || 'Failed to load teams.');
        this.loading = false;
      }
    });
  }

  loadUsers(): void {
    this.adminData.getUsers().subscribe({
      next: (data) => this.users = data,
      error: () => {}
    });
  }

  createTeam(): void {
    if (!this.newTeamName || !this.newTeamName.trim()) {
      this.toastService.error('Validation Error', 'Team name is required.');
      return;
    }

    this.creatingTeam = true;
    this.orgState.createTeam({
      name: this.newTeamName.trim(),
      description: this.newTeamDescription.trim(),
      leadId: this.newTeamLeadId ? Number(this.newTeamLeadId) : undefined
    }).subscribe({
      next: () => {
        this.creatingTeam = false;
        this.newTeamName = '';
        this.newTeamDescription = '';
        this.newTeamLeadId = null;
        this.showCreateModal = false;
        this.toastService.success('Team Created', 'New team created successfully.');
        this.loadTeams();
      },
      error: (err) => {
        this.creatingTeam = false;
        this.toastService.error('Creation Failed', err?.error?.message || 'Failed to create team.');
      }
    });
  }

  deleteTeam(id: number, name: string): void {
    if (!confirm(`Are you sure you want to delete the team "${name}"?`)) return;

    this.orgState.deleteTeam(id).subscribe({
      next: () => {
        this.toastService.success('Team Deleted', `Team "${name}" removed.`);
        this.loadTeams();
      },
      error: (err) => {
        this.toastService.error('Delete Failed', err?.error?.message || 'Failed to delete team.');
      }
    });
  }
}
