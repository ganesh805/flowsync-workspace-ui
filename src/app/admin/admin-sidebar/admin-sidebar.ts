import { Component }
from '@angular/core';

import { CommonModule }
from '@angular/common';

import { Router }
from '@angular/router';
import { RouterModule }
from '@angular/router';

@Component({

  selector: 'app-admin-sidebar',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule
  ],

  templateUrl:
    './admin-sidebar.html',

  styleUrls: [
    './admin-sidebar.css'
  ]
})

export class AdminSidebar {

  companyName = '';

  constructor(
    private router: Router
  ) {}

  ngOnInit() {

    this.companyName =

      localStorage.getItem(
        'companyName'
      ) || 'Workspace';
  }

  scrollTo(
    sectionId: string
  ) {

    const element =

      document.getElementById(
        sectionId
      );

    if(element) {

      element.scrollIntoView({

        behavior: 'smooth'
      });
    }
  }

  logout() {

    localStorage.clear();

    this.router.navigate([
      '/login'
    ]);
  }
}