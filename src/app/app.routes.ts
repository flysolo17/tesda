import { Routes } from '@angular/router';

import { LandingPageComponent } from './common/landing-page/landing-page.component';
import { authGuard } from './guards/auth.guard';
import { MainComponent } from './user/main/main.component';
import { AdminMainComponent } from './admin/admin-main/admin-main.component';
import { LoginComponent } from './admin/login/login.component';
import { NavigationComponent } from './admin/navigation/navigation.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminBannersComponent } from './admin/about/admin-banners/admin-banners.component';

import { CreateServiceComponent } from './admin/admin-services/create-service/create-service.component';
import { HomeComponent } from './common/toolbar/home/home.component';
import { HistoryComponent } from './common/toolbar/history/history.component';
import { MissionComponent } from './common/toolbar/mission/mission.component';
import { CareersComponent } from './common/toolbar/careers/careers.component';
import { StructureComponent } from './common/toolbar/structure/structure.component';
import { MessagingComponent } from './admin/messaging/messaging.component';
import { adminGuard } from './guards/admin.guard';
import { CreateAnnouncementComponent } from './admin/create-announcement/create-announcement.component';
import { AnnouncementComponent } from './admin/announcement/announcement.component';
import { NewsComponent } from './admin/news/news.component';

import { UserDashboardComponent } from './user/user-dashboard/user-dashboard.component';
import { UserMessagesComponent } from './user/user-messages/user-messages.component';
import { ServicesListComponent } from './common/services-list/services-list.component';
import { AnnounementListComponent } from './common/announement-list/announement-list.component';
import { ViewAnnouncementComponent } from './common/view-announcement/view-announcement.component';
import { AdminFeedbackComponent } from './admin/admin-feedback/admin-feedback.component';
import { AdminAppointmentComponent } from './admin/admin-appointment/admin-appointment.component';
import { AdminPhilgepsPostingComponent } from './admin/admin-philgeps-posting/admin-philgeps-posting.component';
import { PhilGepsListComponent } from './user/phil-geps-list/phil-geps-list.component';
import { AdminServicesComponent } from './admin/admin-services/admin-services.component';
import { AdminActivitiesComponent } from './admin/about/admin-activities/admin-activities.component';
import { AdminCareersComponent } from './admin/about/admin-careers/admin-careers.component';
import { OrganizationChartComponent } from './admin/about/organization-chart/organization-chart.component';
import { AdminProvidersComponent } from './admin/admin-services/admin-providers/admin-providers.component';
import { ProviderListComponent } from './user/provider-list/provider-list.component';
import { AdminTransparencySealComponent } from './admin/admin-transparency-seal/admin-transparency-seal.component';
import { CreateSealComponent } from './admin/admin-transparency-seal/create-seal/create-seal.component';
import { TransparencySealListComponent } from './user/transparency-seal-list/transparency-seal-list.component';
import { NewsAndEventsListComponent } from './user/news-and-events/news-and-events-list/news-and-events-list.component';
import { AdminEventsComponent } from './admin/admin-events/admin-events.component';
import { AdminSurveyComponent } from './admin/admin-survey/admin-survey.component';
import { exitPageGuard } from './admin/admin-services/exit-page.guard';
import { CreatePostingComponent } from './admin/admin-philgeps-posting/create-posting/create-posting.component';
import { CreateActivityComponent } from './admin/about/admin-activities/create-activity/create-activity.component';
import { SchedulesComponent } from './admin/admin-appointment/schedules/schedules.component';
import { ProfileComponent } from './common/profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/landing-page',
    pathMatch: 'full',
  },

  {
    path: 'landing-page',
    component: LandingPageComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'services',
        component: ServicesListComponent,
      },
      {
        path: 'announcements',
        component: AnnounementListComponent,
      },

      {
        path: 'announcements/:id',
        component: ViewAnnouncementComponent,
      },
      {
        path: 'provider',
        component: ProviderListComponent,
      },

      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'history',
        component: HistoryComponent,
      },
      {
        path: 'structure',
        component: StructureComponent,
      },
      {
        path: 'mission',
        component: MissionComponent,
      },
      {
        path: 'careers',
        component: CareersComponent,
      },
      {
        path: 'philgeps-posting',
        component: PhilGepsListComponent,
      },
      {
        path: 'transparency-seal',
        component: TransparencySealListComponent,
      },
      {
        path: 'news-and-events',
        component: NewsAndEventsListComponent,
      },
    ],
  },
  {
    path: 'main',
    component: MainComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: UserDashboardComponent,
      },
      {
        path: 'dashboard',
        component: UserDashboardComponent,
      },
      {
        path: 'messages',
        component: UserMessagesComponent,
      },
    ],
  },
  {
    path: 'administration',
    component: AdminMainComponent,
    children: [
      {
        path: '',
        redirectTo: '/administration/login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'main',
        canActivate: [adminGuard],
        component: NavigationComponent,

        children: [
          {
            path: '',
            component: AdminDashboardComponent,
          },
          {
            path: 'survey',
            component: AdminSurveyComponent,
          },
          {
            path: 'dashboard',
            component: AdminDashboardComponent,
          },
          {
            path: 'appointments',
            component: AdminAppointmentComponent,
          },
          {
            path: 'schedules',
            component: SchedulesComponent,
          },
          {
            path: 'messages',
            component: MessagingComponent,
          },
          {
            path: 'banners',
            component: AdminBannersComponent,
          },
          {
            path: 'organizational-structure',
            component: OrganizationChartComponent,
          },
          {
            path: 'careers',
            component: AdminCareersComponent,
          },
          {
            path: 'create-service',
            component: CreateServiceComponent,
            canDeactivate: [exitPageGuard],
          },
          {
            path: 'create-posting',
            component: CreatePostingComponent,
            canDeactivate: [exitPageGuard],
          },
          {
            path: 'services',
            component: AdminServicesComponent,
          },
          {
            path: 'providers',
            component: AdminProvidersComponent,
          },

          {
            path: 'announcements',
            component: AnnouncementComponent,
          },
          {
            path: 'news',
            component: NewsComponent,
          },
          {
            path: 'events',
            component: AdminEventsComponent,
          },
          {
            path: 'create-announcement',
            component: CreateAnnouncementComponent,
          },
          {
            path: 'activities',
            component: AdminActivitiesComponent,
          },
          {
            path: 'create-activity',
            component: CreateActivityComponent,
            canDeactivate: [exitPageGuard],
          },
          {
            path: 'feedback',
            component: AdminFeedbackComponent,
          },
          {
            path: 'philgeps-posting',
            component: AdminPhilgepsPostingComponent,
          },
          {
            path: 'transparency-seal',
            component: AdminTransparencySealComponent,
          },
          {
            path: 'create-seal',
            component: CreateSealComponent,
            canDeactivate: [exitPageGuard],
          },
          {
            path: 'profile',
            component: ProfileComponent,
          },
        ],
      },
    ],
  },
];
