import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../services/auth-state.service';
import { OrganizationStateService } from '../../services/organization-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  @Output() menuClick = new EventEmitter<void>();

  isOwner = false;
  isAdmin = false;
  companyName = '';
  logoUrl: string | null = null;

  constructor(
    public authState: AuthStateService,
    public orgState: OrganizationStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isOwner = this.authState.isOwner();
    this.isAdmin = this.authState.isAdmin();
    this.companyName = this.authState.getCompanyName() || 'FlowSync';
    this.logoUrl = this.orgState.getCachedLogo();

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
    }
  }

  onItemClick(sectionId?: string): void {
    this.menuClick.emit();
    if (sectionId) {
      this.scrollTo(sectionId);
    }
  }

  logout(): void {
    this.menuClick.emit();
    this.authState.logout();
  }

  scrollTo(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }
}