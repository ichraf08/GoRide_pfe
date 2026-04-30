import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { DriverService } from '../../services/driver.service';
import { Earning, EarningStats } from '../../models/driver.models';

@Component({
  selector: 'app-earnings',
  templateUrl: './earnings.component.html',
  styleUrls: ['./earnings.component.css']
})
export class EarningsComponent implements OnInit {
  earnings: Earning[] = [];
  stats: EarningStats | null = null;
  loading = true;
  selectedPeriod = 'week';

  // Chart
  public chartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  public chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false },
        ticks: { callback: (val: number) => val + ' DT' }
      },
      x: { grid: { display: false }, border: { display: false } }
    }
  };
  public chartType: any = 'bar';

  constructor(private driverService: DriverService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.driverService.getEarningStats().subscribe(stats => {
      this.stats = stats;
      this.chartData = {
        labels: stats.weeklyLabels,
        datasets: [{
          data: stats.weeklyData,
          label: 'Revenus (DT)',
          backgroundColor: '#3b82f6',
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 28,
        }]
      };
    });

    this.driverService.getEarnings().subscribe(earnings => {
      this.earnings = earnings;
      this.loading = false;
    });
  }

  get totalCommission(): number {
    return this.earnings.reduce((sum, e) => sum + e.commission, 0);
  }

  get totalTips(): number {
    return this.earnings.reduce((sum, e) => sum + e.tip, 0);
  }

  get totalNet(): number {
    return this.earnings.reduce((sum, e) => sum + e.netAmount, 0);
  }
}
