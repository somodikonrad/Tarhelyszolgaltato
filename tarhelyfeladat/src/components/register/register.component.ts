import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../services/api.service';
import { MessageService } from '../../services/message.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  public messageService: MessageService;  // Ezt állítsuk public-ra

  constructor(
    private api: ApiService,
    messageService: MessageService  // Injektáljuk a MessageService-et
  ) {
    this.messageService = messageService;
  }

  invalidFields: string[] = [];
  user: User = {
    id: '',
    username: '',
    email: '',
    password: '',
    role: ''
  };

  registration() {
    this.api.registration(this.user).subscribe(
      (res: any) => {
        // Ha a válasz státuszkódja 2xx, akkor itt kezeljük a sikeres választ
        if (res && res.message) {
          this.invalidFields = res.invalid || [];
          if (this.invalidFields.length === 0) {
            this.messageService.showMessage('OK', res.message, 'success');
            this.user = {
              id: '',
              username: '',
              email: '',
              password: '',
              role: ''
            };
          } else {
            // Hibás mezők, ha van ilyen
            this.messageService.showMessage('HIBA', res.message, 'error');
          }
        } else {
          // Ha nincs üzenet, akkor a válasz hibát jelez
          this.messageService.showMessage('HIBA', 'Valami hiba történt!', 'error');
        }
      },
      (error) => {
        // Hibák kezelése itt
        console.error('Registration failed', error);  // Hibák kiírása
        this.messageService.showMessage('HIBA', 'A regisztráció sikertelen!', 'error');
      }
    );
  }
  
  
  // Ellenőrizzük, hogy egy mező hibás-e
  isInvalid(field: string) {
    return this.invalidFields.includes(field);
  }
  
}
