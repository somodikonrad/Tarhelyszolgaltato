import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {  ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,   
  imports: [DividerModule, ButtonModule, InputTextModule, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService) {}

  onLogin() {
    this.authService.login(this.username, this.password).subscribe(
      (user) => {
        this.authService.setCurrentUser(user);  // Bejelentkezés után elmentjük a felhasználót
        // Irányíthatjuk az admin felületre vagy más oldalakra
      },
      (error) => {
        this.errorMessage = 'Hiba történt a bejelentkezés során!';  // Hibakezelés
      }
    );
  }
}
