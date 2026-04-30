import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  history: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    const data = localStorage.getItem('goride_history');
    if (data) {
      this.history = JSON.parse(data);
    } else {
      // Mock data initial si vide
      this.history = [
        { id: 101, service: 'Economy', price: 15.0, destination: 'Lac 2, Tunis', date: '2026-04-28T10:00:00Z', status: 'Terminé' },
        { id: 102, service: 'Comfort', price: 22.5, destination: 'Aéroport Tunis-Carthage', date: '2026-04-27T15:30:00Z', status: 'Terminé' }
      ];
    }
  }
}
