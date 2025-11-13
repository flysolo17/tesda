import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { SurveyService } from '../../services/survey.service';
import { Observable, of } from 'rxjs';
import { Survey } from '../../models/Survey';

@Component({
  selector: 'app-admin-survey',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-survey.component.html',
  styleUrl: './admin-survey.component.scss',
})
export class AdminSurveyComponent implements OnInit {
  surveys$: Observable<Survey[]> = of([]);
  constructor(private surveyService: SurveyService) {}
  ngOnInit(): void {
    this.surveys$ = this.surveyService.getAll();
  }
}
