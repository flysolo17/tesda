import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { SurveyService } from '../../services/survey.service';
import { Observable, of } from 'rxjs';
import { Survey } from '../../models/Survey';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewSurveyModalComponent } from './view-survey-modal/view-survey-modal.component';

@Component({
  selector: 'app-admin-survey',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-survey.component.html',
  styleUrl: './admin-survey.component.scss',
})
export class AdminSurveyComponent implements OnInit {
  surveys$: Observable<Survey[]> = of([]);
  constructor(
    private surveyService: SurveyService,
    private modalService: NgbModal
  ) {}
  ngOnInit(): void {
    this.surveys$ = this.surveyService.getAll();
  }
  delete(id: string) {
    Swal.fire({
      title: 'Delete this survey?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.surveyService
          .delete(id)
          .then(() => {
            Swal.fire({
              title: 'Deleted',
              text: 'Survey has been removed.',
              icon: 'success',
              timer: 1200,
              showConfirmButton: false,
            });
          })
          .catch(() => {
            Swal.fire({
              title: 'Error',
              text: 'Something went wrong. Try again.',
              icon: 'error',
            });
          });
      }
    });
  }
  viewSurvey(survey: Survey) {
    const modalRef = this.modalService.open(ViewSurveyModalComponent);
    modalRef.componentInstance.survey = survey;
  }
}
