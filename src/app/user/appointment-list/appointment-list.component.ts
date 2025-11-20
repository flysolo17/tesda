import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../services/appointment.service';
import { filter, map, Observable, of, switchMap } from 'rxjs';
import { Appointment } from '../../models/Appointment';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

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
}
