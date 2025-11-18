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
import { NgbModal, NgbNav, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarOptions } from '@fullcalendar/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { QueryDocumentSnapshot } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { EditStatusComponent } from './edit-status/edit-status.component';

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
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './admin-appointment.component.html',
  styleUrl: './admin-appointment.component.scss',
})
export class AdminAppointmentComponent implements OnInit {
  status$ = Object.values(AppointmentStatus);
  selectedMonth = new Date().getMonth() + 1;

  appointments$ = new BehaviorSubject<Appointment[]>([]);
  lastIndex: QueryDocumentSnapshot<Appointment> | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private activatedRoute: ActivatedRoute,
    private modalSerive: NgbModal
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      const status = params.get('status') as AppointmentStatus;
      if (status) {
        this.loadAppointments(status);
      }
    });
  }

  async loadAppointments(status: AppointmentStatus): Promise<void> {
    const appointments = await this.appointmentService.getAppointments(
      this.lastIndex,
      status,
      10
    );
    this.appointments$.next(appointments);
  }

  handleEventClick(arg: any): void {
    const schedule = arg.event.extendedProps;
    alert(`Schedule at ${schedule.time} with ${schedule.slots} slots`);
  }

  confirm(appointment: Appointment): void {
    const modalRef = this.modalSerive.open(EditStatusComponent);
    modalRef.componentInstance.title = 'Confirm Appointment';
    modalRef.componentInstance.status = AppointmentStatus.CONFIRMED;

    modalRef.result
      .then((notes: any) => {
        const newAppointment: Appointment = {
          ...appointment,
          notes: notes,
        };
        return this.appointmentService.updateStatus(
          newAppointment,
          AppointmentStatus.CONFIRMED
        );
      })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Appointment Confirmed',
          html: `
          <p><strong>${appointment.personalInformation.name}</strong>'s appointment has been confirmed.</p>
  
        `,
          confirmButtonText: 'OK',
        }).then(() => {
          const updated = this.appointments$
            .getValue()
            .filter((a) => a.id !== appointment.id);
          this.appointments$.next(updated);
        });
      })
      .catch((error: any) => {
        if (error !== 'cancel') {
          Swal.fire({
            icon: 'error',
            title: 'Confirmation Failed',
            text: 'Something went wrong while confirming the appointment.',
            footer: `<code>${error.message}</code>`,
          });
        }
      });
  }

  reject(appointment: Appointment): void {
    const modalRef = this.modalSerive.open(EditStatusComponent);
    modalRef.componentInstance.title = 'Reject Appointment';
    modalRef.componentInstance.status = AppointmentStatus.REJECTED;

    modalRef.result
      .then((notes: any) => {
        const newAppointment: Appointment = {
          ...appointment,
          notes: notes,
        };
        return this.appointmentService.updateStatus(
          newAppointment,
          AppointmentStatus.REJECTED
        );
      })
      .then(() => {
        Swal.fire({
          icon: 'info',
          title: 'Appointment Rejected',
          html: `
          <p><strong>${appointment.personalInformation.name}</strong>'s appointment has been rejected.</p>

        `,
          confirmButtonText: 'OK',
        }).then(() => {
          const updated = this.appointments$
            .getValue()
            .filter((a) => a.id !== appointment.id);
          this.appointments$.next(updated);
        });
      })
      .catch((error: any) => {
        if (error !== 'cancel') {
          Swal.fire({
            icon: 'error',
            title: 'Rejection Failed',
            text: 'Something went wrong while rejecting the appointment.',
            footer: `<code>${error.message}</code>`,
          });
        }
      });
  }

  complete(appointment: Appointment): void {
    const modalRef = this.modalSerive.open(EditStatusComponent);
    modalRef.componentInstance.title = 'Mark as Completed';
    modalRef.componentInstance.status = AppointmentStatus.COMPLETED;

    modalRef.result
      .then((notes: any) => {
        const newAppointment: Appointment = {
          ...appointment,
          notes: notes,
        };
        return this.appointmentService.updateStatus(
          newAppointment,
          AppointmentStatus.COMPLETED
        );
      })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Appointment Completed',
          html: `
          <p><strong>${appointment.personalInformation.name}</strong>'s appointment has been marked as completed.</p>
        `,
          confirmButtonText: 'OK',
        }).then(() => {
          const updated = this.appointments$
            .getValue()
            .filter((a) => a.id !== appointment.id);
          this.appointments$.next(updated);
        });
      })
      .catch((error: any) => {
        if (error !== 'cancel') {
          Swal.fire({
            icon: 'error',
            title: 'Completion Failed',
            text: 'Something went wrong while completing the appointment.',
            footer: `<code>${error.message}</code>`,
          });
        }
      });
  }
  cancel(appointment: Appointment): void {
    const modalRef = this.modalSerive.open(EditStatusComponent);
    modalRef.componentInstance.title = 'Cancel Appointment';
    modalRef.componentInstance.status = AppointmentStatus.CANCELLED;

    modalRef.result
      .then((notes: any) => {
        const newAppointment: Appointment = {
          ...appointment,
          notes: notes || 'Marked as no-show by admin.',
        };
        return this.appointmentService.updateStatus(
          newAppointment,
          AppointmentStatus.CANCELLED
        );
      })
      .then(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Appointment Cancelled',
          html: `
          <p><strong>${appointment.personalInformation.name}</strong>'s appointment has been cancelled.</p>
        `,
          confirmButtonText: 'OK',
        }).then(() => {
          const updated = this.appointments$
            .getValue()
            .filter((a) => a.id !== appointment.id);
          this.appointments$.next(updated);
        });
      })
      .catch((error: any) => {
        if (error !== 'cancel') {
          Swal.fire({
            icon: 'error',
            title: 'Cancellation Failed',
            text: 'Something went wrong while cancelling the appointment.',
            footer: `<code>${error.message}</code>`,
          });
        }
      });
  }
}
