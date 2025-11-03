import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartEvent, ChartType } from 'chart.js';



@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {

  // 1️⃣ Visitors Bar Chart
  visitorsChartData: ChartConfiguration['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      { label: 'Visitors', data: [30, 50, 35, 60], backgroundColor: '#3b82f6' }
    ]
  };
  visitorsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: true, position: 'top' } }
  };
  visitorsChartType: ChartType = 'bar';

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
    plugins: { legend: { position: 'top' } }
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
        pointBackgroundColor: '#22c55e'
      },
    ],
  };
  feedbackChartType: ChartType = 'line';
  feedbackChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: true, position: 'top' } },
    scales: { y: { beginAtZero: true } }
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
    { title: 'New Assessment request', from: 'test' }
  ];
}
