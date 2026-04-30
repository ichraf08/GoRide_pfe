import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  balance: number = 45.50;
  cards: any[] = [
    { type: 'Visa', last4: '4242', expiry: '12/26', isDefault: true },
    { type: 'Mastercard', last4: '5580', expiry: '08/25', isDefault: false }
  ];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  addFunds(): void {
    const amount = prompt('Montant à ajouter (DT):', '20');
    if (amount && !isNaN(Number(amount))) {
      this.balance += Number(amount);
    }
  }

  get currentUserFullName(): string {
    const user = this.authService.getCurrentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'Utilisateur';
  }
}
