import { Component } from '@angular/core';
import { TransparencySealService } from '../../services/transparency-seal.service';
import { CommonModule } from '@angular/common';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-transparency-seal-list',
  standalone: true,
  imports: [CommonModule, NgbAccordionModule],
  templateUrl: './transparency-seal-list.component.html',
  styleUrl: './transparency-seal-list.component.scss',
})
export class TransparencySealListComponent {
  transparencySeals$ = this.transparencySealService.getAll();
  constructor(private transparencySealService: TransparencySealService) {}
}
