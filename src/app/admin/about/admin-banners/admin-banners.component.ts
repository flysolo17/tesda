import { Component } from '@angular/core';
import { BannerService } from '../../../services/banner.service';
import { ToastrService } from '../../../services/toastr.service';
import { finalize } from 'rxjs';
import { Banner } from '../../../models/Banner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-banners.component.html',
  styleUrl: './admin-banners.component.scss',
})
export class AdminBannersComponent {
  selectedFile: File | null = null;
  isUploading = false;
  banners: Banner[] = [];

  constructor(
    private bannerService: BannerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadBanners();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Selected file:', this.selectedFile);
    }
  }

  create(): void {
    if (!this.selectedFile) {
      this.toastr.showError('Please select a banner image first!');
      return;
    }

    this.isUploading = true;

    this.bannerService
      .add(this.selectedFile)
      .pipe(
        finalize(() => {
          this.isUploading = false;
          this.selectedFile = null;
        })
      )
      .subscribe({
        next: () => {
          this.toastr.showSuccess('Banner added successfully!');
          this.loadBanners();
        },
        error: (err) => {
          console.error('Upload failed:', err);
          this.toastr.showError('Failed to add banner.');
        },
      });
  }

  deleteBanner(url: string): void {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    this.bannerService.delete(url).subscribe({
      next: () => {
        this.toastr.showSuccess('Banner deleted successfully!');
        this.loadBanners();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.toastr.showError('Failed to delete banner.');
      },
    });
  }

  private loadBanners(): void {
    this.bannerService.getAll().subscribe({
      next: (banners) => (this.banners = banners),
      error: (err) => console.error('Error loading banners:', err),
    });
  }
}
