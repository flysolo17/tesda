import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ProgramType, Survey, TrainingProgram } from '../../models/Survey';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, NgbModalModule],
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.scss',
})
export class SurveyComponent {
  surveyForm: FormGroup;
  programs$ = Object.values(TrainingProgram);
  types$ = Object.values(ProgramType);
  constructor(private fb: FormBuilder, private activeModal: NgbActiveModal) {
    this.surveyForm = fb.nonNullable.group({
      programType: [null, Validators.required],
      program: [null, Validators.required],
      location: [null, Validators.required],
      comment: ['', Validators.required],
    });
  }

  submit() {
    if (this.surveyForm.invalid) {
      return;
    }
    const survey: Survey = {
      ...this.surveyForm.value,
      submittedAt: new Date(),
    };
    this.activeModal.close(survey);
  }

  close() {
    this.activeModal.close();
  }
}
