import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  companyName = '';
  role = '';
  nickname = '';

  constructor(public authState: AuthStateService) {}

  ngOnInit(): void {
    this.companyName = this.authState.getCompanyName() || 'FlowSync Workspace';
    this.role = this.authState.getRole() || 'MEMBER';
    this.nickname = this.authState.getNickname() || 'User';
  }
}