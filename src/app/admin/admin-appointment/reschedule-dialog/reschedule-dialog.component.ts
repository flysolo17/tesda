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

  today = new Date().toISOString().split('T')[0]; // e.g., "2025-11-18"
  rescheduleForm: FormGroup;
  isLoading = false;
  selectedSlot: string | null = null;
  slots = [
    '08:00 AM – 09:00 AM',
    '09:00 AM – 10:00 AM',
    '10:00 AM – 11:00 AM',
    '11:00 AM – 12:00 PM',
    '12:00 PM – 01:00 PM',
    '01:00 PM – 02:00 PM',
    '02:00 PM – 03:00 PM',
    '03:00 PM – 04:00 PM',
    '04:00 PM – 05:00 PM',
  ];
  selectedSlots: string[] = [];
  onSelectTimeSlot(e: string) {
    if (!this.isAvailable(e)) return;
    this.selectedSlot = e;
  }
  constructor(
    private fb: FormBuilder,

    private activeModal: NgbActiveModal,
    private appointmentService: AppointmentService
  ) {
    this.rescheduleForm = fb.nonNullable.group({
      date: [null, Validators.required],

      notes: [''],
    });
  }
  ngOnInit(): void {
    this.selectedSlot = this.appointment.time;
    if (this.appointment) {
      this.rescheduleForm.patchValue({
        date: this.appointment.date,
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
  }
  submit() {
    if (this.rescheduleForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill out all required fields before submitting.',
      });
      console.log(this.rescheduleForm);
      return;
    }

    if (this.selectedSlot === null) {
      Swal.fire({
        icon: 'warning',
        title: 'No Time Selected',
        text: 'Please choose a time slot before submitting your appointment.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }
    const { date, note } = this.rescheduleForm.value;

    const newAppointment: Appointment = {
      ...this.appointment,
      date: date,
      time: this.selectedSlot,
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
  isAvailable(time: string): boolean {
    // available if NOT already booked
    return !this.selectedSlots.includes(time);
  }
  onDateChange(value: string) {
    this.appointmentService.onDateChange(value).then((data) => {
      this.selectedSlots = data;

      if (
        this.selectedSlot !== null &&
        this.selectedSlots.includes(this.selectedSlot)
      ) {
        this.selectedSlot = null;
      }
    });
  }
}
