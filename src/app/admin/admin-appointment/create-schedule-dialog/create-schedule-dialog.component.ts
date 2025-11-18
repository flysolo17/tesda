import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProgramsService } from '../../../services/programs.service';
import { Services } from '../../../models/Services';
import Swal from 'sweetalert2';
import { Schedule, TIME_ARRAY } from '../../../models/Schedule';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ScheduleService } from '../../../services/schedule.service';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-create-schedule-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './create-schedule-dialog.component.html',
  styleUrl: './create-schedule-dialog.component.scss',
})
export class CreateScheduleDialogComponent implements OnInit {
  services$: Services[] = [];
  time$ = TIME_ARRAY;
  scheduleForm: FormGroup;
  today = new Date().toISOString().split('T')[0]; // e.g., "2025-11-18"
  @Input({ required: true }) schedule: Schedule | null = null;

  constructor(
    private activeModal: NgbActiveModal,
    private programService: ProgramsService,
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private appointmentService: AppointmentService
  ) {
    this.scheduleForm = fb.nonNullable.group({
      serviceId: [null, Validators.required],
      slots: [null, [Validators.required, Validators.min(1)]],
      time: [null, Validators.required],
      date: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadServices();

    if (this.schedule) {
      this.scheduleForm.patchValue({
        serviceId: this.schedule.serviceId,
        slots: this.schedule.slots,
        time: this.schedule.time,
        date: this.schedule.date,
      });
    }
  }

  loadServices(): void {
    this.programService
      .getAllServices()
      .then((services) => {
        this.services$ = services;
      })
      .catch((error) => {
        console.error('Failed to load services:', error);
        Swal.fire({
          icon: 'error',
          title: 'Load Failed',
          text: 'Unable to fetch services. Please try again later.',
        });
      });
  }

  submit(): void {
    if (this.scheduleForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Form',
        text: 'Please complete all required fields.',
      });
      return;
    }

    const formValue = this.scheduleForm.value;
    const now = new Date();
    const selectedDate = new Date(formValue.date);

    if (selectedDate < new Date(now.toDateString())) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date',
        text: 'You cannot schedule for a past date.',
      });
      return;
    }

    const schedule: Schedule = {
      ...(this.schedule ?? { id: crypto.randomUUID(), createdAt: new Date() }),
      ...formValue,
      updatedAt: new Date(),
    };

    if (this.schedule) {
      this.update(schedule);
    } else {
      this.create(schedule);
    }
  }

  create(schedule: Schedule): void {
    this.scheduleService
      .create(schedule)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Schedule Created',
          text: 'Your schedule has been successfully created.',
          timer: 2000,
          showConfirmButton: false,
        });
        this.activeModal.close(true);
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text: 'Unable to create schedule. Please try again.',
        });
      });
  }

  update(schedule: Schedule): void {
    this.scheduleService
      .updateSchedule(schedule)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Schedule Updated',
          text: 'Your schedule has been successfully updated.',
          timer: 2000,
          showConfirmButton: false,
        });
        this.activeModal.close(true);
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'Unable to update schedule. Please try again.',
        });
      });
  }

  close(): void {
    this.activeModal.close();
  }
}
