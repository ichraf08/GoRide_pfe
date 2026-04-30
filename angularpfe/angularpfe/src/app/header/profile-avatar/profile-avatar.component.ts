import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avatar-container" [ngStyle]="{'width': size + 'px', 'height': size + 'px', 'font-size': fontSize + 'px'}">
      <img *ngIf="photoUrl; else initialsTemplate" [src]="photoUrl" class="avatar-img shadow-sm" alt="Profile" (error)="onImageError()">
      <ng-template #initialsTemplate>
        <div class="avatar-initials shadow-sm" [ngStyle]="{'background': backgroundColor}">
          {{ initials }}
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .avatar-container {
      display: inline-block;
      border-radius: 50%;
      position: relative;
      user-select: none;
      flex-shrink: 0;
    }
    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #fff;
    }
    .avatar-initials {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 700;
      letter-spacing: 0.5px;
      border: 2px solid #fff;
      text-transform: uppercase;
    }
  `]
})
export class ProfileAvatarComponent implements OnInit, OnChanges {
  @Input() firstName: string = '';
  @Input() lastName: string = '';
  @Input() photoUrl?: string;
  @Input() size: number = 40;

  initials: string = '';
  backgroundColor: string = '#2563eb'; // Default blue
  fontSize: number = 14;

  // Premium colors array (GoRide platform colors)
  private colors = [
    'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Primary Blue (btn-premium-blue)
    'linear-gradient(135deg, #475569 0%, #1e293b 100%)', // Slate/Dark (text color)
    'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', // Premium Orange (btn-premium-orange)
    'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', // Premium Purple (btn-premium-purple)
  ];

  ngOnInit(): void {
    this.calculateAvatar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['firstName'] || changes['lastName'] || changes['photoUrl'] || changes['size']) {
      this.calculateAvatar();
    }
  }

  calculateAvatar(): void {
    this.fontSize = this.size * 0.4; // Responsive font size
    
    if (!this.photoUrl) {
      this.initials = this.getInitials();
      this.backgroundColor = this.getColorFromName();
    }
  }

  getInitials(): string {
    let f = this.firstName ? this.firstName.charAt(0).toUpperCase() : '';
    let l = this.lastName ? this.lastName.charAt(0).toUpperCase() : '';
    if (!f && !l) return 'U';
    return `${f}${l}`;
  }

  getColorFromName(): string {
    const name = `${this.firstName}${this.lastName}`;
    if (!name) return this.colors[0];
    
    // Simple hash function to always assign same color to same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.colors.length;
    return this.colors[index];
  }

  onImageError(): void {
    // If image fails to load, fallback to initials
    this.photoUrl = undefined;
    this.calculateAvatar();
  }
}
