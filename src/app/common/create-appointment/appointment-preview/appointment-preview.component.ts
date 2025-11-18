import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Appointment } from '../../../models/Appointment';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../services/appointment.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointment-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-preview.component.html',
  styleUrl: './appointment-preview.component.scss',
})
export class AppointmentPreviewComponent {
  @Input({ required: true }) appointment!: Appointment;
  constructor(
    private activeModal: NgbActiveModal,
    private appointmentSerive: AppointmentService,
    private router: Router
  ) {}
  close() {
    this.activeModal.close();
  }
  confirm() {
    this.appointmentSerive
      .create(this.appointment)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Appointment Confirmed',
          text: 'Your appointment has been successfully submitted.',
        });
        this.activeModal.close(true);
        this.router.navigate(['']);
      })
      .catch((error) => {
        console.error('Appointment creation failed:', error);
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'Something went wrong. Please try again later.',
        });
        this.activeModal.dismiss(); // optional: dismiss without confirmation
      });
  }
}
