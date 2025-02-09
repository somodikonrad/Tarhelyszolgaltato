import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { MessageService } from '../../services/message.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent {
  constructor(
    private api: ApiService,
    private message: MessageService
  ){}

  invalidFields:string[] = [];

  user:User = {
    id: '',
   username: '',
    email: '',
    password: '',
    role: ''
  }
  registration() {
    console.log('Felhasználó adatai:', this.user); // A felhasználói adatok logolása
  
    this.api.registration(this.user).subscribe(
      (res: any) => {
        console.log('Válasz a backend-től:', res); // A válasz naplózása
  
        // Ha a backend válaszában van hibaüzenet
        if (res?.message) {
          this.message.showMessage('HIBA', res.error.message, 'danger'); // Hibaüzenet megjelenítése
        } else {
          // Sikeres regisztráció
          this.message.showMessage('OK', 'Sikeres regisztráció!', 'success');
        }
  
        // Az adatok nullázása, ha sikeres a regisztráció
        this.user = {
          id: '',
          username: '',
          email: '',
          password: '',
          role: ''
        };
      },
      (err) => {
        // Hibakezelés: Ha hibát kapunk a backend-től
        console.error('Hiba történt a regisztráció során:', err);
        
        // Ha a hibaüzenet a backend válaszából jön
        const errorMessage = err?.error?.message || 'Ismeretlen hiba történt!';
        
        // Hibás mezők listája
        if (err?.error?.invalid?.length) {
          this.invalidFields = err.error.invalid;
        }
  
        // Hibaüzenet megjelenítése
        this.message.showMessage('HIBA', errorMessage, 'danger');
      }
    );
  }
  
  

  isInvalid(field:string){
    return this.invalidFields.includes(field);
  }

}
