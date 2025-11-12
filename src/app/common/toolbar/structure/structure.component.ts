import { Component } from '@angular/core';
import { OrganizationStructureService } from '../../../services/organization-structure.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-structure',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './structure.component.html',
  styleUrl: './structure.component.scss',
})
export class StructureComponent {
  structure$ = this.orgService.getAll();

  constructor(
    private orgService: OrganizationStructureService,
    private sanitizer: DomSanitizer
  ) {}

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
