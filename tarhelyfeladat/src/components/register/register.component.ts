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
    username: '',
    email: '',
    password: '',
    role: '',
    token: ''
  };

  registration() {
    this.api.registration(this.user).subscribe(
      (res: any) => {
        // Ha nincs 'invalid' mező, akkor inicializáljuk üres tömbbel
        this.invalidFields = res.invalid || [];  // Biztosítjuk, hogy 'invalidFields' mindig tömb legyen
  
        if (this.invalidFields.length == 0) {
          // ✅ Sikeres regisztráció
          this.messageService.add({ severity: 'success', summary: 'Siker', detail: res.message });
  
          // Mezők ürítése sikeres regisztráció után
          this.user = {
            id: '',
            username: '',
            email: '',
            password: '',
            role: '',
            token: ''
          };
        } else {
          // ❌ Hiba esetén error üzenet
          this.messageService.add({ severity: 'error', summary: 'Hiba', detail: res.message });
        }
      },
      (error) => {
        // Ha valami hiba történt
        console.error("Hiba történt a regisztráció során:", error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hiba',
          detail: error?.error?.message || 'Hiba történt a regisztráció során',
        });
      }
    );
  }
  

  isInvalid(field: string) {
    return this.invalidFields.includes(field);
  }
}
