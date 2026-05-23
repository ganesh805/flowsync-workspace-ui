
import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
  FormsModule,
  RouterLink
],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  name = '';

  username = '';

  designation = '';

  email = '';

  password = '';

  role = 'MEMBER';
  companyCode = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register() {

    const data = {

      name: this.name,
      username: this.username,
      designation: this.designation,
      email: this.email,
      password: this.password,
      role: this.role,
      companyCode: this.companyCode
    };

    this.authService.register(data).subscribe({

      next: () => {

        alert('Registration Successful');

        this.router.navigate(['/login']);
      },

      error: (error) => {

        console.log(error);

        alert('Registration Failed');
      }
    });
  }
}