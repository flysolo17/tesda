import { Component, inject, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartEvent, ChartType } from 'chart.js';
import {
  VisitorLogService,
  VisitorPerMonth,
} from '../../services/visitor-log.service';
import { dA } from '@fullcalendar/core/internal-common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private visitorLogService = inject(VisitorLogService);
  visitorPerMonth$: VisitorPerMonth[] = [];
  // 1️⃣ Visitors Bar Chart
  visitorsChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [], // will be filled dynamically
    datasets: [
      {
        label: 'Visitors',
        data: [],
        backgroundColor: '#3b82f6',
      },
    ],
  };

  visitorsChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
    },
  };

  ngOnInit(): void {
    this.visitorLogService.visitorPerMonth().then((data) => {
      this.visitorPerMonth$ = data;
      this.visitorsChartData = this.buildVisitorsChartData(data);
    });
  }

  private buildVisitorsChartData(
    data: VisitorPerMonth[]
  ): ChartConfiguration<'bar'>['data'] {
    const now = new Date();
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // 1️⃣ Generate last 4 months
    const last4Months: { month: string; year: string }[] = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last4Months.push({
        month: monthNames[d.getMonth()],
        year: d.getFullYear().toString(),
      });
    }

    // 2️⃣ Map visitor data to those months
    const monthDataMap = new Map<string, number>();
    data.forEach((entry) => {
      const key = `${entry.year}-${entry.month}`;
      monthDataMap.set(key, entry.count);
    });

    // 3️⃣ Build chart data with zero-fill
    const labels = last4Months.map((m) => m.month);
    const values = last4Months.map((m) => {
      const key = `${m.year}-${m.month}`;
      return monthDataMap.get(key) ?? 0;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Visitors',
          data: values,
          backgroundColor: '#3b82f6',
        },
      ],
    };
  }

  // 2️⃣ Pie Chart - Availed Services
  servicesChartData: ChartConfiguration['data'] = {
    labels: ['Service A', 'Service B', 'Service C'],
    datasets: [
      {
        data: [40, 30, 30],
        backgroundColor: ['#8b5cf6', '#fbbf24', '#ef4444'],
      },
    ],
  };
  servicesChartType: ChartType = 'pie';
  servicesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
  };

  // 3️⃣ Feedback Line Chart
  feedbackChartData: ChartConfiguration['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        label: 'Feedback',
        data: [100, 200, 150, 300],
        fill: false,
        borderColor: '#22c55e',
        tension: 0.3,
        borderWidth: 3,
        pointBackgroundColor: '#22c55e',
      },
    ],
  };
  feedbackChartType: ChartType = 'line';
  feedbackChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: true, position: 'top' } },
    scales: { y: { beginAtZero: true } },
  };

  // 4️⃣ Horizontal Bar Chart - Upcoming Activities
  activitiesChartData: ChartConfiguration['data'] = {
    labels: ['Schedule 1', 'Schedule 2', 'Schedule 3'],
    datasets: [
      {
        label: 'Days',
        data: [3, 5, 2],
        backgroundColor: '#3b82f6',
      },
    ],
  };
  activitiesChartType: ChartType = 'bar';
  activitiesChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { x: { beginAtZero: true } },
  };

  newRequests = [
    { title: 'New Training request', from: 'test' },
    { title: 'New Assessment request', from: 'test' },
  ];
}
