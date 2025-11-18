import { Component, Input } from '@angular/core';
import { AppointmentService } from '../../../services/appointment.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Appointment, AppointmentStatus } from '../../../models/Appointment';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-edit-status',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './edit-status.component.html',
  styleUrl: './edit-status.component.scss',
})
export class EditStatusComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) status!: AppointmentStatus;

  notes = new FormControl('');
  constructor(private activeModal: NgbActiveModal) {}

  close(): void {
    this.activeModal.close(this.notes.value?.trim() || null);
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
