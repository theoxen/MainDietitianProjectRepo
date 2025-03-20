import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClientManagementService } from '../../../services/client-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";


@Component({
  selector: 'app-client-history',
  standalone: true,
  imports: [],
  templateUrl: './client-history.component.html',
  styleUrl: './client-history.component.css'
})
export class ClientHistoryComponent implements OnInit {
  
  clientManagementService = inject(ClientManagementService);
  clientId: string | null = null;
  client: ClientProfile | null = null;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void{
    window.scrollTo(0, 0);

    this.clientId = this.route.snapshot.paramMap.get('clientId');

    console.log("Captured Client ID in ClientHistoryComponent:", this.clientId);

    if (this.clientId) {
      const client$ = this.clientManagementService.getClientDetails(this.clientId);
      client$.subscribe(client => {
        this.client = client;
      });
    }
  }

  // navigateTo(route: string) {
  //   if (this.clientId) {
  //     const updatedRoute = route.replace(':clientId', this.clientId);
  //     this.router.navigate([updatedRoute]);
  //   }
  // }

}
