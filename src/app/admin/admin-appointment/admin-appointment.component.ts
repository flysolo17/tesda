import { Component, OnInit } from '@angular/core';
import {
  ScheduleService,
  SchedulesPerDay,
} from '../../services/schedule.service';
import { AppointmentService } from '../../services/appointment.service';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  startWith,
  map,
  of,
} from 'rxjs';
import { Appointment, AppointmentStatus } from '../../models/Appointment';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { BaseChartDirective } from 'ng2-charts';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ChartData, ChartOptions } from 'chart.js';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Schedule } from '../../models/Schedule';
import { NgbNav, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarOptions } from '@fullcalendar/core';

@Component({
  selector: 'app-admin-appointment',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    FullCalendarModule,
    ReactiveFormsModule,

    FormsModule,
    NgbNavModule,
  ],
  templateUrl: './admin-appointment.component.html',
  styleUrl: './admin-appointment.component.scss',
})
export class AdminAppointmentComponent implements OnInit {
  status$ = Object.values(AppointmentStatus);
  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  selectedMonth = new Date().getMonth() + 1;
  appointments$: Observable<Appointment[]> = of([]);
  schedules$: Observable<SchedulesPerDay[]> = of([]);

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    events: [],
    eventClick: this.handleEventClick.bind(this),

    eventClassNames: () => ['bg-primary', 'text-white', 'border-0'],

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek',
    },
  };

  constructor(
    private appointmentService: AppointmentService,
    private scheduleService: ScheduleService
  ) {}

  ngOnInit(): void {
    this.loadAppointmentsForMonth(this.selectedMonth);
  }

  loadAppointmentsForMonth(month: number): void {
    this.appointments$ = this.appointmentService.getByMonth(month);
  }
  loadSchedules(month: number): void {
    this.schedules$ = this.scheduleService.getScheduleByMonth(month);
    this.schedules$.subscribe((days) => {
      this.calendarOptions.events = days.flatMap((d) =>
        d.schedules.map((s) => ({
          title: `${s.time} (${s.slots} slots)`,
          date: d.date,
          extendedProps: s,
        }))
      );
    });
  }

  onMonthChange(monthIndex: number): void {
    this.selectedMonth = monthIndex + 1;
    this.loadAppointmentsForMonth(this.selectedMonth);
    this.loadSchedules(this.selectedMonth);
  }

  handleEventClick(arg: any): void {
    const schedule = arg.event.extendedProps;
    alert(`Schedule at ${schedule.time} with ${schedule.slots} slots`);
  }
}
