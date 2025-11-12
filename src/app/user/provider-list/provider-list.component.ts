import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ProviderService,
  ProviderWithServices,
} from '../../services/provider.service';
import { map, Observable, of } from 'rxjs';
import { Provider, ProviderType } from '../../models/Provider';
import { CommonModule } from '@angular/common';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { Services } from '../../models/Services';
import { dA } from '@fullcalendar/core/internal-common';

@Component({
  selector: 'app-provider-list',
  standalone: true,
  imports: [CommonModule, NgbAccordionModule],
  templateUrl: './provider-list.component.html',
  styleUrl: './provider-list.component.scss',
})
export class ProviderListComponent implements OnInit {
  provider$: Observable<ProviderWithServices[]> = of([]);
  type: ProviderType | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private providerService: ProviderService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((param) => {
      this.type = param['type'];
      if (this.type) {
        this.provider$ = this.providerService.getProviderByType(this.type);
        this.provider$.subscribe((data) => {
          console.log(data);
        });
      }
    });
  }

  downloadFile(fileUrl: string | null) {
    if (!fileUrl) return;
    window.open(fileUrl, '_blank'); // Opens the file in a new tab
  }
}
