import { Routes } from '@angular/router';

import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { RegisterCompany } from './pages/register-company/register-company';
import { Home } from './dashboard/home/home';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { TaskDetails } from './task/task-details/task-details';
import { ProfileComponent } from './profile/profile';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { OwnerDashboardComponent } from './organization/owner-dashboard/owner-dashboard';
import { OrganizationProfileComponent } from './organization/organization-profile/organization-profile';
import { TeamManagementComponent } from './organization/team-management/team-management';

import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin-guard';
import { ownerGuard } from './guards/owner.guard';

import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'register-company',
    component: RegisterCompany
  },

  // AUTHENTICATED APP SHELL ROUTES
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: Home
      },
      {
        path: 'owner',
        component: OwnerDashboardComponent,
        canActivate: [ownerGuard]
      },
      {
        path: 'organization',
        component: OrganizationProfileComponent,
        canActivate: [ownerGuard]
      },
      {
        path: 'organization/teams',
        component: TeamManagementComponent,
        canActivate: [ownerGuard]
      },
      {
        path: 'admin',
        component: AdminDashboard,
        canActivate: [adminGuard]
      },
      {
        path: 'chat',
        component: ChatComponent
      },
      {
        path: 'task/:id',
        component: TaskDetails
      },
      {
        path: 'profile',
        component: ProfileComponent
      }
    ]
  },

  // WILDCARD REDIRECT
  {
    path: '**',
    redirectTo: 'login'
  }
];