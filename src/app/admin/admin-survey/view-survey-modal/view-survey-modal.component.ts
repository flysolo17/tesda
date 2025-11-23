import { Component, inject, Input } from '@angular/core';
import { Survey } from '../../../models/Survey';
import {
  NgbActiveModal,
  NgbModal,
  NgbModalModule,
} from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-survey-modal',
  standalone: true,
  imports: [NgbModalModule, CommonModule],
  templateUrl: './view-survey-modal.component.html',
  styleUrl: './view-survey-modal.component.scss',
})
export class ViewSurveyModalComponent {
  @Input({ required: true }) survey!: Survey;

  activeModal = inject(NgbActiveModal);
}
