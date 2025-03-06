import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClientManagementService } from '../../../services/client-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";

@Component({
  selector: 'app-manage-client',
  standalone: true,
  imports: [ReactiveFormsModule, NavBarComponent],
  templateUrl: './manage-client.component.html',
  styleUrl: './manage-client.component.css'
})
export class ManageClientComponent{
  
}