import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../services/appointment.service';
import { filter, map, Observable, of, switchMap } from 'rxjs';
import { Appointment } from '../../models/Appointment';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.scss',
})
export class AppointmentListComponent implements OnInit {
  appointments$: Observable<Appointment[]> = of([]);

  constructor(
    private appointmentService: AppointmentService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.appointments$ = this.activatedRoute.queryParamMap.pipe(
      map((params) => params.get('id')),
      filter((id): id is string => !!id),
      switchMap((id) => this.appointmentService.getAppointmentsByUID(id))
    );
  }
  trackById(index: number, item: Appointment): string {
    return item.id;
  }

  cancelAppointment(appointment: Appointment) {
    Swal.fire({
      title: 'Cancel Appointment?',
      text: `Are you sure you want to cancel your appointment for ${appointment.serviceInformation.name} on ${appointment.date} at ${appointment.time}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        this.appointmentService
          .cancel(appointment)
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Cancelled',
              text: 'Your appointment has been cancelled successfully.',
              confirmButtonColor: '#3085d6',
            });
          })
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Cancellation Failed',
              text: 'Something went wrong. Please try again later.',
              confirmButtonColor: '#d33',
            });
            console.error('Cancel error:', error);
          });
      }
    });
  }
}
