import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';

  password = '';

  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {

    if (!this.email || !this.password) {

      alert('Please fill all fields');

      return;
    }

    this.loading = true;

    const data = {

      email: this.email,

      password: this.password
    };

    this.authService.login(data).subscribe({

      next: (response) => {

  localStorage.setItem(
    'token',
    response.token
  );
  console.log("LOGIN RESPONSE =", response);

  console.log(
    "TOKEN STORED =",
    localStorage.getItem('token')
  );

  localStorage.setItem(
    'role',
    response.role
  );

  localStorage.setItem(

    'nickname',

    response.name
  );

  localStorage.setItem(

    'companyName',

    response.organizationName
  );

  if(response.role === 'ADMIN') {

    this.router.navigate([
      '/admin'
    ]);

  } else {

    this.router.navigate([
      '/dashboard'
    ]);
  }
},

      error: (error: any) => {

        console.log(error);

        this.loading = false;

        alert('Invalid Email Or Password');
      }
    });
  }
  
}