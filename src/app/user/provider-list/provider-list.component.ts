import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ProviderService,
  ProviderWithServices,
} from '../../services/provider.service';
import { map, Observable, of } from 'rxjs';
import { Provider, ProviderType } from '../../models/Provider';
import { CommonModule } from '@angular/common';
import {
  NgbAccordionModule,
  NgbModal,
  NgbSlide,
} from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from '../../services/auth.service';
import { SurveyComponent } from '../survey/survey.component';
import { Survey } from '../../models/Survey';
import { SurveyService } from '../../services/survey.service';
import { User, UserType } from '../../models/Users';
import { user } from '@angular/fire/auth';
import Swal from 'sweetalert2';
import { dA } from '@fullcalendar/core/internal-common';
import { Services, ServiceType } from '../../models/Services';

@Component({
  selector: 'app-provider-list',
  standalone: true,
  imports: [CommonModule, NgbAccordionModule],
  templateUrl: './provider-list.component.html',
  styleUrl: './provider-list.component.scss',
})
export class ProviderListComponent implements OnInit {
  provider$: Observable<ProviderWithServices[]> = of([]);
  title: string = 'List of TVET PROVIDERS and assessment centers';
  type: ProviderType | null = null;
  users: User | null = null;
  constructor(
    private activatedRoute: ActivatedRoute,
    private providerService: ProviderService,
    private authService: AuthService,
    private modalService: NgbModal,
    private surveyService: SurveyService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      const rawType = params.get('type');
      const type = Object.values(ProviderType).includes(rawType as ProviderType)
        ? (rawType as ProviderType)
        : null;
      if (type !== null) {
        this.title = type;
      }
      this.provider$ = this.providerService.getProviderByType(type);
    });
    this.authService.getCurrentUser().subscribe(async (user) => {
      if (user) {
        this.users = user;
        if (this.users.type == UserType.USER) {
          const hasSubmitted = await this.surveyService.checkIfSubmitted(
            user.id
          );
          if (hasSubmitted) {
            console.log('User has already submitted a survey.');
          } else {
            this.openSurvey();
          }
        }
      }
    });
  }

  downloadFile(fileUrl: string | null) {
    if (!fileUrl) return;
    window.open(fileUrl, '_blank');
  }
  openSurvey() {
    const modalRef = this.modalService.open(SurveyComponent);
    modalRef.result
      .then((result: Survey | any) => {
        if (result) {
          result.uid = this.users?.id;
          result.profile = this.users?.profile;
          result.name = this.users?.name;
          this.saveSurvey(result);
        }
      })
      .catch((error) => {
        console.log('Survey modal dismissed:', error);
      });
  }
  saveSurvey(survey: Survey) {
    this.surveyService
      .create(survey)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Survey Submitted',
          text: 'Thank you for completing the survey!',
          confirmButtonColor: '#3085d6',
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'Something went wrong. Please try again later.',
          confirmButtonColor: '#d33',
        });
        console.error('Survey submission error:', error);
      });
  }

  getRegisteredPrograms(services: Services[]): string[] {
    return services.map((e) => e.title);
  }

  getAccreditedQualifications(services: Services[]): string[] {
    return services.map((e) => e.qualification);
  }
}
