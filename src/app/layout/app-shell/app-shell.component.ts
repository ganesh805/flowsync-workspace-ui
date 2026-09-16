import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthStateService } from '../../services/auth-state.service';
import { NotificationStateService } from '../../services/notification-state.service';
import { OrganizationStateService } from '../../services/organization-state.service';
import { Sidebar } from '../sidebar/sidebar';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Sidebar
  ],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.css']
})
export class AppShellComponent implements OnInit {
  companyName = '';
  userName = '';
  userRole = '';
  logoUrl: string | null = null;
  isEmployee = false;
  employeeTeamName = '';
  darkMode = false;
  mobileMenuOpen = false;
  showNotifications = false;

  constructor(
    private http: HttpClient,
    public authState: AuthStateService,
    public notificationState: NotificationStateService,
    public orgState: OrganizationStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.companyName = this.authState.getCompanyName() || 'FlowSync Workspace';
    this.userName = this.authState.getNickname() || 'User';
    this.userRole = this.formatRole(this.authState.getRole());
    this.logoUrl = this.orgState.getCachedLogo();

    this.isEmployee = !this.authState.isOwner() && !this.authState.isAdmin();

    this.orgState.organization$.subscribe(org => {
      if (org) {
        if (org.companyName) this.companyName = org.companyName;
        this.logoUrl = org.logoUrl || null;
      }
    });

    if (this.authState.isAuthenticated()) {
      this.orgState.loadOrganization().subscribe({
        error: () => {}
      });

      if (this.isEmployee) {
        this.http.get<any>(`${environment.apiUrl}/profile`).subscribe({
          next: (profile) => {
            const rawTeam = profile?.team?.name || profile?.createdBy?.designation || profile?.designation || 'DEVELOPMENT';
            this.employeeTeamName = rawTeam.toUpperCase().trim();
          },
          error: () => {
            this.employeeTeamName = 'DEVELOPMENT';
          }
        });
      }

      this.notificationState.loadNotifications().subscribe();
    }
  }

  private formatRole(role: string | null): string {
    if (role === 'OWNER') return 'OWNER';
    if (role === 'ADMIN') return 'ADMIN';
    return 'EMPLOYEE';
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    this.authState.logout();
  }
}
