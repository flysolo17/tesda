import { Component, Input, OnInit } from '@angular/core';
import { Appointment, AppointmentStatus } from '../../../models/Appointment';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Schedule } from '../../../models/Schedule';
import { ScheduleService } from '../../../services/schedule.service';
import { AppointmentService } from '../../../services/appointment.service';
import Swal from 'sweetalert2';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-reschedule-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './reschedule-dialog.component.html',
  styleUrl: './reschedule-dialog.component.scss',
})
export class RescheduleDialogComponent implements OnInit {
  @Input({ required: true }) appointment!: Appointment;
  isGettingSchedules = false;

  schedules$: Schedule[] = [];
  today = new Date().toISOString().split('T')[0]; // e.g., "2025-11-18"
  rescheduleForm: FormGroup;
  isLoading = false;
  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private activeModal: NgbActiveModal,
    private appointmentService: AppointmentService
  ) {
    this.rescheduleForm = fb.nonNullable.group({
      date: [null, Validators.required],
      selectedSchedule: [null, Validators.required],
      notes: [''],
    });
  }
  ngOnInit(): void {
    if (this.appointment) {
      this.rescheduleForm.patchValue({
        date: this.appointment.date,
        time: this.appointment.time,
      });
      this.onServiceAndDateChanged(
        this.appointment.serviceInformation.id,
        this.appointment.date
      );
      this.rescheduleForm.get('date')?.valueChanges.subscribe((date) => {
        const serviceId = this.appointment.serviceInformation.id;
        console.log('Changed');
        if (serviceId && date) {
          console.log('Triggers');
          this.onServiceAndDateChanged(serviceId, date);
        }
      });
    }
  }
  close() {
    this.activeModal.close();
  }

  onServiceAndDateChanged(serviceId: string, date: string) {
    this.isGettingSchedules = true;
    console.log(date);
    console.log(serviceId);
    this.scheduleService
      .getScheduleByDate(serviceId, date)
      .then((data) => {
        this.isGettingSchedules = false;
        console.log(data);
        this.schedules$ = data;
      })
      .catch((e) => {
        console.log(e);
      });
  }
  submit() {
    if (this.rescheduleForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill out all required fields before submitting.',
      });
      return;
    }

    const { date, selectedSchedule, note } = this.rescheduleForm.value;

    const selected = this.schedules$.find((s) => s.id === selectedSchedule);

    if (!selected) {
      Swal.fire({
        icon: 'error',
        title: 'Schedule Not Found',
        text: 'The selected schedule could not be found. Please try again.',
      });
      return;
    }

    const newAppointment: Appointment = {
      ...this.appointment,
      date,
      time: selected.time,
      sid: selectedSchedule,
      status: AppointmentStatus.CONFIRMED,
      notes: note ?? '',
    };
    this.isLoading = true;
    this.appointmentService
      .reschedule(newAppointment)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Appointment Rescheduled',
          text: 'Your appointment has been successfully rescheduled.',
        });
        this.isLoading = false;
        this.activeModal.close('success');
      })
      .catch((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Rescheduling Failed',
          text: 'Something went wrong while rescheduling. Please try again later.',
        });
        this.isLoading = false;
        console.error('Reschedule error:', err);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
  get slots(): number {
    return this.schedules$.reduce((total, s) => total + s.slots, 0);
  }
}
