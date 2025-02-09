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
    this.api.login(this.user.email, this.user.password).subscribe((res: any) => {
      console.log(res);  // Debugging log, hogy megnézd a választ

      this.invalidFields = res.invalid || []; // Ha nincs 'invalid', akkor üres tömböt rendelünk hozzá

      if (this.invalidFields.length === 0) {
        this.message.showMessage('OK', res.message, 'success');
        
        // Beállítjuk az isAdmin változót a válaszból
        if (res.user && res.user.role === 'admin') {
          this.isAdmin = true;
        } else {
          this.isAdmin = false;
        }

        // Elmentjük a felhasználói adatokat a helyi tárolóba vagy AuthService-be, hogy később elérjük
        this.auth.login(this.user.email, this.user.password, this.isAdmin);

        // Átirányítjuk a felhasználót a csomagok oldalára
        this.router.navigateByUrl('/packages');
      } else {
        this.message.showMessage('HIBA', res.message, 'danger');
      }
    });
  }

  isInvalid(field: string) {
    return this.invalidFields.includes(field);
  }
}
