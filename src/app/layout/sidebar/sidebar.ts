import { Component } from '@angular/core';

import {
  Router,
  RouterLink,
} from '@angular/router';

@Component({
  selector: 'app-sidebar',

  standalone: true,

  imports: [
    RouterLink,

  ],

  templateUrl: './sidebar.html',

  styleUrl: './sidebar.css'
})

export class Sidebar {

  constructor(
    private router: Router
  ) {}

  logout() {

    localStorage.clear();

    this.router.navigate([
      '/login'
    ]);
  }

  scrollTo(sectionId: string) {

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
}