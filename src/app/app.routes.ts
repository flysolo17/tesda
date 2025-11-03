import { Routes } from '@angular/router';

import { LandingPageComponent } from './common/landing-page/landing-page.component';
import { authGuard } from './guards/auth.guard';
import { MainComponent } from './user/main/main.component';
import { AdminMainComponent } from './admin/admin-main/admin-main.component';
import { LoginComponent } from './admin/login/login.component';
import { NavigationComponent } from './admin/navigation/navigation.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminBannersComponent } from './admin/admin-banners/admin-banners.component';
import { AdminCareersComponent } from './admin/admin-careers/admin-careers.component';
import { AdminRequirementsComponent } from './admin/admin-requirements/admin-requirements.component';
import { AdminServicesComponent } from './admin/admin-services/admin-services.component';
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
import { AdminActivitiesComponent } from './admin/admin-activities/admin-activities.component';
import { UserDashboardComponent } from './user/user-dashboard/user-dashboard.component';
import { UserMessagesComponent } from './user/user-messages/user-messages.component';

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
            path: 'dashboard',
            component: AdminDashboardComponent,
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
            path: 'careers',
            component: AdminCareersComponent,
          },
          {
            path: 'create-service',
            component: CreateServiceComponent,
          },
          {
            path: 'services',
            component: AdminServicesComponent,
          },
          {
            path: 'requirements',
            component: AdminRequirementsComponent,
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
            path: 'create-announcement',
            component: CreateAnnouncementComponent,
          },
          {
            path: 'activities',
            component: AdminActivitiesComponent,
          },
        ],
      },
    ],
  },
];
