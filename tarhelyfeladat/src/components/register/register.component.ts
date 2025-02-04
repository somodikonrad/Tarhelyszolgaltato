import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { User } from '../../interfaces/user';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [DividerModule, ButtonModule, InputTextModule, CommonModule, FormsModule, ToastModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  providers: [MessageService] // Hozzáadva a MessageService, ha nincs globálisan importálva
})
export class RegisterComponent {
  constructor(
    private api: ApiService,
    private messageService: MessageService // Javítva a MessageService név
  ) {}

  invalidFields: string[] = [];

  user: User = {
    id: '',
    name: '',
    email: '',
    passwd: '',
    confirm: '',
    role: '',
    domain: ''
  };

  registration() {
    this.api.registration('users', this.user).subscribe((res: any) => {
      this.invalidFields = res.invalid;
      if (this.invalidFields.length == 0) {
        // ✅ Helyes MessageService hívás
        this.messageService.add({ severity: 'success', summary: 'Siker', detail: res.message });

        // Mezők ürítése sikeres regisztráció után
        this.user = {
          id: '',
          name: '',
          email: '',
          passwd: '',
          confirm: '',
          role: '',
          domain: ''
        };
      } else {
        // ❌ Hiba esetén error üzenet
        this.messageService.add({ severity: 'error', summary: 'Hiba', detail: res.message });
      }
    });
  }

  isInvalid(field: string) {
    return this.invalidFields.includes(field);
  }
}
