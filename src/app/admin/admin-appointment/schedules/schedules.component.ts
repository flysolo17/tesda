import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateScheduleDialogComponent } from '../create-schedule-dialog/create-schedule-dialog.component';
import {
  ScheduleService,
  SchedulesPerDay,
  ScheduleWithService,
} from '../../../services/schedule.service';
import { CommonModule } from '@angular/common';
import { map, Observable, shareReplay, take } from 'rxjs';
import { Schedule } from '../../../models/Schedule';
import Swal from 'sweetalert2';
import { Services } from '../../../models/Services';
import { ToastrService } from '../../../services/toastr.service';

export interface SchedulesPerService {
  service: Services;
  schedules: Schedule[];
  totalSlots: number;
}
@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [FullCalendarModule, CommonModule],
  templateUrl: './schedules.component.html',
  styleUrl: './schedules.component.scss',
})
export class SchedulesComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    events: [],

    eventClick: this.handleEventClick.bind(this),

    eventDisplay: 'block', // ensures full-width block rendering
    eventClassNames: () => ['text-center', 'fw-bold', 'border-0', 'p-0', 'm-0'],

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek',
    },

    validRange: {
      start: new Date().toISOString().split('T')[0],
    },

    dateClick: (info) => {
      const clickedDate = new Date(info.dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (clickedDate < today) {
        alert('Past dates are disabled.');
        return;
      }

      console.log('Clicked date:', info.dateStr);
    },
  };
  schedules$ = this.scheduleService
    .getAllScheduleWithServices()
    .pipe(shareReplay(1));

  schedulesPerService: Observable<SchedulesPerService[]> = this.schedules$.pipe(
    take(1),
    map((items: ScheduleWithService[]) => {
      const grouped = new Map<
        string,
        { service: Services; schedules: Schedule[] }
      >();

      for (const item of items) {
        const key = item.service?.id || 'unknown';
        if (!grouped.has(key)) {
          grouped.set(key, {
            service: item.service!,
            schedules: [],
          });
        }
        grouped.get(key)!.schedules.push(item.schedule);
      }

      return Array.from(grouped.values()).map((group) => ({
        service: group.service,
        schedules: group.schedules,
        totalSlots: group.schedules.reduce((sum, s) => sum + s.slots, 0),
      }));
    })
  );

  constructor(
    private modalService: NgbModal,
    private scheduleService: ScheduleService,
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.schedules$.pipe(take(1)).subscribe((items) => {
      const dateMap = new Map<
        string,
        Map<string, { service: Services; slots: number }>
      >();

      for (const item of items) {
        const date = item.schedule.date;
        const serviceId = item.service?.id || 'unknown';

        if (!dateMap.has(date)) {
          dateMap.set(date, new Map());
        }

        const serviceMap = dateMap.get(date)!;
        if (!serviceMap.has(serviceId)) {
          serviceMap.set(serviceId, {
            service: item.service!,
            slots: 0,
          });
        }

        serviceMap.get(serviceId)!.slots += item.schedule.slots;
      }

      this.calendarOptions.events = Array.from(dateMap.entries()).map(
        ([date, serviceMap]) => {
          const totalSlots = Array.from(serviceMap.values()).reduce(
            (sum, s) => sum + s.slots,
            0
          );
          return {
            title: `${totalSlots} slots`,
            start: date,
            allDay: true,
            extendedProps: {
              services: Array.from(serviceMap.values()),
            },
          };
        }
      );
    });
  }

  createSchedule() {
    const modalRef = this.modalService.open(CreateScheduleDialogComponent);
  }
  handleEventClick(arg: any): void {
    const services: { service: Services; slots: number }[] =
      arg.event.extendedProps?.services;

    if (!Array.isArray(services) || services.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No schedule data',
        text: 'No services found for this date.',
      });
      return;
    }

    const summary = services
      .map(({ service, slots }) => `• ${service.title}: ${slots} slots`)
      .join('\n');

    Swal.fire({
      title: `Schedules for ${arg.event.startStr}`,
      text: summary,
      icon: 'info',
      width: 500,
    });
  }
}
