import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private message: MessageService,
    private router: Router
  ){}

  invalidFields: string[] = [];
  
  user: User = {
    id: '',
    username: '',
    email: '',
    password: '',
    role: ''  
  };

  isAdmin: boolean = false;  // Új változó, ami az admin státuszt tárolja

  login() {
    this.api.login(this.user.email, this.user.password).subscribe({
      next: (res: any) => {
        console.log(res);  // Debugging log, hogy megnézd a választ
    
        this.invalidFields = res.invalid || [];
    
        if (this.invalidFields.length === 0) {
          this.message.showMessage('OK', res.message, 'success');
    
          // Az `AuthService` már kezeli az isAdmin értékét, így nem kell külön beállítani
          this.auth.login(this.user.email, this.user.password).subscribe({
            next: (res) => {
              console.log(res);  // Ellenőrizd, hogy a `username` ott van-e a válaszban
              this.router.navigateByUrl('/packages');
            },
            error: (err) => {
              console.error('Login error:', err);
              this.message.showMessage('HIBA', err.error.message || 'Hiba történt', 'danger');
            }
          });
    
        } else {
          this.message.showMessage('HIBA', res.message, 'danger');
        }
      },
      error: (err) => {
        console.error('Login API hiba:', err);
        this.message.showMessage('HIBA', err.message || 'Ismeretlen hiba történt', 'danger');
      }
    });
  }
  
  

  isInvalid(field: string) {
    return this.invalidFields.includes(field);
  }
}
