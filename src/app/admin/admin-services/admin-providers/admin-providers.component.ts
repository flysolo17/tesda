import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProviderService } from '../../../services/provider.service';
import { Provider } from '../../../models/Provider';
import { CreateProviderComponent } from '../create-provider/create-provider.component';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-providers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-providers.component.html',
  styleUrl: './admin-providers.component.scss',
})
export class AdminProvidersComponent {
  providers$ = this.providerService.getAllProviders();
  constructor(
    private modalService: NgbModal,
    private providerService: ProviderService
  ) {}

  create(provider: Provider | null = null) {
    const modalRef = this.modalService.open(CreateProviderComponent, {
      size: 'lg',
    });
    modalRef.componentInstance.provider = provider;
  }

  trackById(index: number, item: Provider): string {
    return item.id;
  }

  delete(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the provider.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
    }).then((result) => {
      if (result.isConfirmed) {
        this.providerService.delete(id).then(() => {
          Swal.fire('Deleted!', 'Provider removed successfully.', 'success');
        });
      }
    });
  }
}
