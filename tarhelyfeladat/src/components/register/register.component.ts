import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { MessageService } from '../../services/message.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user';
import { Router, RouterModule  } from '@angular/router';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent {
  constructor(
    private api: ApiService,
    private message: MessageService,
    private router: Router
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
  
        // Ha van hibaüzenet a válaszban
        if (res?.error?.message) {
          this.message.showMessage('HIBA', res.error.message, 'danger'); 
          return; // Ha hiba van, nem folytatjuk tovább
        }
  
        // Sikeres regisztráció esetén token mentése
        if (res?.token) {
          console.log('Token mentése:', res.token);
          localStorage.setItem('token', res.token);
        } else {
          console.warn('⚠️ Nincs token a válaszban!');
        }
  
        // Sikeres regisztráció üzenet és átirányítás
        this.message.showMessage('OK', 'Sikeres regisztráció!', 'success');
        this.router.navigateByUrl('/login');
  
        // Az adatok nullázása
        this.user = { id: '', username: '', email: '', password: '', role: '' };
      },
      (err) => {
        console.error('Hiba történt a regisztráció során:', err);
  
        // Ha a hiba a backend válaszából jön
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
