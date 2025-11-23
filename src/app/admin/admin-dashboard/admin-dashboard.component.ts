import { Component, inject, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartEvent, ChartType } from 'chart.js';
import {
  VisitorLogService,
  VisitorPerMonth,
} from '../../services/visitor-log.service';
import { dA } from '@fullcalendar/core/internal-common';
import { ProgramsService } from '../../services/programs.service';
import { Services } from '../../models/Services';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment, AppointmentStatus } from '../../models/Appointment';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [BaseChartDirective, CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private visitorLogService = inject(VisitorLogService);
  private appointmentService = inject(AppointmentService);
  private programService = inject(ProgramsService);
  visitorPerMonth$: VisitorPerMonth[] = [];
  services: Services[] = [];
  appointments: Appointment[] = [];
  visitorsChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
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
    this.programService.getAllServices().then((data) => {
      this.services = data;
    });
    this.appointmentService.getAllAppointments().then((data) => {
      this.appointments = data;
      this.servicesChartData = this.buildServicesChartData(data);
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

  get completedAppointments(): number {
    return this.appointments.filter(
      (e) => e.status === AppointmentStatus.COMPLETED
    ).length;
  }
  get pendingAppointments(): number {
    return this.appointments.filter(
      (e) => e.status === AppointmentStatus.PENDING
    ).length;
  }
  get activeUsers(): number {
    if (!this.visitorPerMonth$) {
      return 0;
    }

    // Flatten all visitors and collect their uids
    const allUids = this.visitorPerMonth$.flatMap((v) =>
      v.visitors.map((visitor) => visitor.uid)
    );

    // Use a Set to ensure uniqueness
    const uniqueUids = new Set(allUids);

    return uniqueUids.size;
  }

  private buildServicesChartData(
    appointments: Appointment[]
  ): ChartConfiguration<'pie'>['data'] {
    // Count appointments per service name
    const serviceCountMap = new Map<string, number>();

    appointments.forEach((app) => {
      const serviceName = app.serviceInformation?.name ?? 'Unknown';
      serviceCountMap.set(
        serviceName,
        (serviceCountMap.get(serviceName) ?? 0) + 1
      );
    });

    // Extract labels and values
    const labels = Array.from(serviceCountMap.keys());
    const values = Array.from(serviceCountMap.values());

    // Generate colors dynamically (fallback palette)
    const colors = [
      '#8b5cf6',
      '#fbbf24',
      '#ef4444',
      '#3b82f6',
      '#22c55e',
      '#e11d48',
      '#14b8a6',
    ];
    const backgroundColors = labels.map((_, i) => colors[i % colors.length]);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
        },
      ],
    };
  }
  get ongoingAppointments(): Appointment[] {
    return this.appointments

      .filter(
        (e) =>
          e.status === AppointmentStatus.PENDING ||
          e.status === AppointmentStatus.CONFIRMED
      )
      .slice(0, 2);
  }
}
