import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrganizationStateService, OrganizationInfo } from '../../services/organization-state.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-organization-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './organization-profile.html',
  styleUrls: ['./organization-profile.css']
})
export class OrganizationProfileComponent implements OnInit {
  org: OrganizationInfo = {
    companyName: '',
    companyCode: '',
    companyDomain: '',
    logoUrl: null,
    description: '',
    industry: '',
    contactEmail: '',
    contactPhone: ''
  };

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  loading = true;
  saving = false;
  uploadingLogo = false;
  uploadError = '';

  constructor(
    public orgState: OrganizationStateService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.orgState.loadOrganization().subscribe({
      next: (data) => {
        this.org = { ...data };
        this.previewUrl = data.logoUrl || null;
        this.loading = false;
      },
      error: (err) => {
        this.toastService.error('Error', err?.error?.message || 'Failed to load organization profile');
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    this.uploadError = '';
    const file: File = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.uploadError = 'Invalid file format. Please upload a PNG, JPEG, or WebP image.';
      this.toastService.error('Invalid File Type', this.uploadError);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.uploadError = 'File size exceeds 5MB limit.';
      this.toastService.error('File Too Large', this.uploadError);
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadLogo(): void {
    if (!this.selectedFile) return;

    this.uploadingLogo = true;
    this.orgState.uploadLogo(this.selectedFile).subscribe({
      next: (updatedOrg) => {
        this.org = { ...updatedOrg };
        this.previewUrl = updatedOrg.logoUrl || null;
        this.selectedFile = null;
        this.uploadingLogo = false;
        this.toastService.success('Logo Updated', 'Organization logo has been saved and applied globally.');
      },
      error: (err) => {
        this.uploadingLogo = false;
        this.toastService.error('Upload Failed', err?.error?.message || 'Failed to upload logo.');
      }
    });
  }

  removeLogo(): void {
    if (!confirm('Are you sure you want to remove the organization logo?')) return;

    this.uploadingLogo = true;
    this.orgState.removeLogo().subscribe({
      next: (updatedOrg) => {
        this.org = { ...updatedOrg };
        this.previewUrl = null;
        this.selectedFile = null;
        this.uploadingLogo = false;
        this.toastService.success('Logo Removed', 'Organization logo removed.');
      },
      error: (err) => {
        this.uploadingLogo = false;
        this.toastService.error('Error', err?.error?.message || 'Failed to remove logo.');
      }
    });
  }

  saveOrganizationDetails(): void {
    if (!this.org.companyName || !this.org.companyName.trim()) {
      this.toastService.error('Validation Error', 'Organization name cannot be empty.');
      return;
    }

    this.saving = true;
    this.orgState.updateOrganization(this.org).subscribe({
      next: (updated) => {
        this.org = { ...updated };
        this.saving = false;
        this.toastService.success('Organization Saved', 'Organization details updated successfully.');
      },
      error: (err) => {
        this.saving = false;
        this.toastService.error('Save Failed', err?.error?.message || 'Failed to update organization details.');
      }
    });
  }
}
