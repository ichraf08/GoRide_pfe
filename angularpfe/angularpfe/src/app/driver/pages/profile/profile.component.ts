import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DriverService } from '../../services/driver.service';
import { DriverProfile, Review } from '../../models/driver.models';

@Component({
  selector: 'app-driver-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: DriverProfile | null = null;
  reviews: Review[] = [];
  profileForm!: FormGroup;
  loading = true;
  isEditing = false;
  saveSuccess = false;
  activeTab: 'info' | 'reviews' | 'security' = 'info';

  // Password form
  passwordForm!: FormGroup;
  passwordSaved = false;

  constructor(
    private driverService: DriverService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if a specific tab should be opened via URL parameter
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'reviews') {
        this.activeTab = 'reviews';
      }
    });

    this.driverService.getProfile().subscribe(profile => {
      this.profile = profile;
      this.initForm(profile);
      this.loading = false;
    });

    this.driverService.getReviews().subscribe(reviews => {
      this.reviews = reviews;
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  initForm(profile: DriverProfile): void {
    this.profileForm = this.fb.group({
      firstName: [profile.firstName, Validators.required],
      lastName: [profile.lastName, Validators.required],
      email: [profile.email, [Validators.required, Validators.email]],
      phone: [profile.phone, Validators.required],
      city: [profile.city, Validators.required],
      licenseNumber: [profile.licenseNumber, Validators.required],
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.profile) {
      this.initForm(this.profile);
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const updates = this.profileForm.value;
    this.driverService.updateProfile(updates).subscribe(updated => {
      this.profile = updated;
      this.isEditing = false;
      this.saveSuccess = true;
      setTimeout(() => this.saveSuccess = false, 3000);
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    // Simulate password change
    this.passwordSaved = true;
    this.passwordForm.reset();
    setTimeout(() => this.passwordSaved = false, 3000);
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStarArray(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }
}
