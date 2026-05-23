import { Routes } from '@angular/router';

import { Login }
from './auth/login/login';

import { Register }
from './auth/register/register';

import { Home }
from './dashboard/home/home';

import { AdminDashboard }
from './admin/admin-dashboard/admin-dashboard';

import { RegisterCompany }
from './pages/register-company/register-company';

import { TaskDetails }
from './task/task-details/task-details';

import { authGuard }
from './guards/auth.guard';

import { adminGuard }
from './guards/admin-guard';
import { ProfileComponent }
from './profile/profile';

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

  {
    path: 'dashboard',

    component: Home,

    canActivate: [authGuard]
  },

  {
    path: 'admin',

    component: AdminDashboard,

    canActivate: [
      authGuard,
      adminGuard
    ]
  },

  {
    path: 'task/:id',

    component: TaskDetails,

    canActivate: [authGuard]
  },

  // KEEP LAST

  {
    path: '**',

    redirectTo: 'login'
  },

  {
  path:'profile',
  component:ProfileComponent
}

];