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
  transparencySeals$ = this.transparencySealService.getWithAttachments();
  constructor(private transparencySealService: TransparencySealService) {}

  downloadFile(url: string, fileName: string) {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);

        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => console.error('Download error:', err));
  }
}
