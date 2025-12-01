import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import {
  ChartConfiguration,
  ChartData,
  ChartDataset,
  ChartEvent,
  ChartType,
} from 'chart.js';
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
import { User } from '../../models/Users';
import { AuthService } from '../../services/auth.service';
import {
  NgbDropdownModule,
  NgbAccordionItem,
} from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../services/notification.service';
import { Subscription, switchMap, combineLatest, map, of } from 'rxjs';
import { Notification } from '../../models/Notification';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    BaseChartDirective,
    CommonModule,
    RouterLink,
    NgbDropdownModule,
    NgbAccordionItem,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private visitorLogService = inject(VisitorLogService);
  private appointmentService = inject(AppointmentService);
  private programService = inject(ProgramsService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  private subscription: Subscription | null = null;

  isLoading = true;

  users$: User | null = null;
  visitorPerMonth$: VisitorPerMonth[] = [];
  services: Services[] = [];
  appointments: Appointment[] = [];
  notifications: Notification[] = [];
  users: User[] = [];

  // Pie chart
  public ageChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: false,

    maintainAspectRatio: true,
  };
  public ageChartLabels = ['14–17', '18–25', '26–35', '36–49', '50+'];
  public ageChartData: ChartData<'pie'> = {
    labels: this.ageChartLabels,
    datasets: [
      {
        data: [], // age counts
        backgroundColor: [
          '#4e73df',
          '#1cc88a',
          '#36b9cc',
          '#f6c23e',
          '#e74a3b',
        ],
      },
    ],
  };
  public ageChartType: ChartType = 'pie';

  // Bar chart
  public muniChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,

    maintainAspectRatio: true,
  };

  public muniChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Users' }],
  };
  public muniChartType: ChartType = 'bar';

  public serviceChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: false,
    maintainAspectRatio: false,
  };

  public serviceChartLabels: string[] = [];
  public serviceChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#4e73df',
          '#1cc88a',
          '#36b9cc',
          '#f6c23e',
          '#e74a3b',
        ],
      },
    ],
  };
  public serviceChartType: ChartType = 'pie';

  // WEEKLY VISITOR OVERVIEW (BAR)
  public weeklyVisitorOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
    maintainAspectRatio: false,
  };

  public weeklyVisitorData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Visitors This Week' }],
  };
  public weeklyVisitorType: ChartType = 'bar';

  // MONTHLY VISITOR OVERVIEW (BAR)
  public monthlyVisitorOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
    maintainAspectRatio: false,
  };

  public monthlyVisitorData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Visitors Per Month' }],
  };
  public monthlyVisitorType: ChartType = 'bar';

  ngOnInit(): void {
    this.subscription = this.authService
      .getCurrentUser()
      .pipe(
        switchMap((user) =>
          combineLatest({
            user: of(user),
            visitorPerMonth: this.visitorLogService.visitorPerMonth(),
            services: this.programService.getAllServices(),
            appointments: this.appointmentService.getAllAppointments(),
            notifications: this.notificationService.getTenNewNotifications(
              user?.id ?? '',
              true
            ),
            users: this.authService.getAllUsers(),
          })
        )
      )
      .subscribe({
        next: (state) => {
          this.users$ = state.user;
          this.visitorPerMonth$ = state.visitorPerMonth;
          this.services = state.services;
          this.appointments = state.appointments;
          this.notifications = state.notifications;
          this.users = state.users;

          this.computeAgeChart();
          this.computeMunicipalityChart();
          this.computeServiceDistribution();
          this.computeWeeklyVisitors();
          this.computeMonthlyVisitors();

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading dashboard state:', err);
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get unseenNotification(): number {
    if (!this.users$?.id) return 0;
    return this.notifications.filter(
      (n) => !(n.seen ?? []).includes(this.users$!!.id)
    ).length;
  }

  private computeAgeChart(): void {
    const ageGroups = [0, 0, 0, 0, 0]; // 14–17, 18–25, 26–35, 36–49, 50+

    for (const user of this.users) {
      const age = user.age;

      if (age >= 14 && age <= 17) ageGroups[0]++;
      else if (age >= 18 && age <= 25) ageGroups[1]++;
      else if (age >= 26 && age <= 35) ageGroups[2]++;
      else if (age >= 36 && age <= 49) ageGroups[3]++;
      else if (age >= 50) ageGroups[4]++;
    }

    // 🔥 Update the chart correctly
    this.ageChartData = {
      labels: this.ageChartLabels,
      datasets: [
        {
          data: [...ageGroups],
          backgroundColor: [
            '#4e73df',
            '#1cc88a',
            '#36b9cc',
            '#f6c23e',
            '#e74a3b',
          ],
        },
      ],
    };
  }

  private computeMunicipalityChart(): void {
    const muniCounts = new Map<string, number>();

    // Count users per municipality
    for (const user of this.users) {
      const muni = user.municipality?.toUpperCase().trim();
      if (!muni) continue;

      muniCounts.set(muni, (muniCounts.get(muni) ?? 0) + 1);
    }

    // Sort municipalities by count (descending) and take top 5
    const sorted = Array.from(muniCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const labels = sorted.map(([muni]) => muni);
    const data = sorted.map(([_, count]) => count);

    // Update chart data
    this.muniChartData = {
      labels,
      datasets: [
        {
          data,
          label: 'Users',
          backgroundColor: '#4e73df', // optional styling
        },
      ],
    };
  }

  get pendingAppointments(): number {
    return this.appointments.filter(
      (e) => e.status === AppointmentStatus.PENDING
    ).length;
  }
  get completedAppointments(): number {
    return this.appointments.filter(
      (e) => e.status === AppointmentStatus.COMPLETED
    ).length;
  }
  private computeServiceDistribution(): void {
    const serviceUsage = new Map<string, number>();

    // Count how many times each service was used
    for (const appt of this.appointments) {
      const serviceName = appt.serviceInformation?.name?.trim();
      if (!serviceName) continue;

      serviceUsage.set(serviceName, (serviceUsage.get(serviceName) ?? 0) + 1);
    }

    // Sort by usage, take top 5
    const sorted = Array.from(serviceUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const labels = sorted.map(([name]) => name);
    const data = sorted.map(([_, count]) => count);

    // Update the chart
    this.serviceChartLabels = labels;
    this.serviceChartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#4e73df',
            '#1cc88a',
            '#36b9cc',
            '#f6c23e',
            '#e74a3b',
          ],
        },
      ],
    };
  }

  private computeWeeklyVisitors(): void {
    const last7DaysLabels: string[] = [];
    const last7DaysCounts: number[] = [];

    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);

      const label = date.toLocaleDateString('en-US', { weekday: 'short' });
      last7DaysLabels.push(label);

      // Count visitors from visitorPerMonth$
      let count = 0;

      for (const entry of this.visitorPerMonth$) {
        for (const visitor of entry.visitors) {
          const visitDate = visitor.loggedAt;
          if (
            visitDate.getFullYear() === date.getFullYear() &&
            visitDate.getMonth() === date.getMonth() &&
            visitDate.getDate() === date.getDate()
          ) {
            count++;
          }
        }
      }

      last7DaysCounts.push(count);
    }

    this.weeklyVisitorData = {
      labels: last7DaysLabels,
      datasets: [{ data: last7DaysCounts, label: 'Visitors This Week' }],
    };
  }
  private computeMonthlyVisitors(): void {
    const labels = this.visitorPerMonth$.map((entry) => entry.month);
    const data = this.visitorPerMonth$.map((entry) => entry.count);

    this.monthlyVisitorData = {
      labels,
      datasets: [
        {
          data,
          label: 'Visitors Per Month',
          backgroundColor: '#4e73df',
        },
      ],
    };
  }
  get confirmedAppointments(): Appointment[] {
    return this.appointments.filter(
      (e) => e.status === AppointmentStatus.CONFIRMED
    );
  }
}
