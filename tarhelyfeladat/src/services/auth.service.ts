import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // API endpoint a bejelentkezéshez
  private currentUser: User | null = null;
  private tokenName = 'auth_token'; // A token kulcsa a localStorage-ban

  constructor(private http: HttpClient) {}

  // Bejelentkezés: autentikációs API hívás és felhasználó tárolása
  login(email: string, password: string, isAdmin?: boolean): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/login`, { email, password });
  }

  // A bejelentkezett felhasználó elmentése
  setCurrentUser(user: User, token: string, isAdmin: boolean) {
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));  // Tárolás a helyi tárolóban (localStorage)
    localStorage.setItem(this.tokenName, token);  // Token mentése a helyi tárolóban
    localStorage.setItem('isAdmin', JSON.stringify(isAdmin)); // Admin státusz mentése
  }

  // A felhasználó kijelentkezése
  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');  // Eltávolítjuk a helyi tárolóból
    localStorage.removeItem(this.tokenName);  // Token törlése
    localStorage.removeItem('isAdmin'); // Admin státusz törlése
  }

  // Aktuális felhasználó visszakérése
  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUser = JSON.parse(user);  // Ha létezik, betöltjük a tárolóból
      return this.currentUser;
    }
    return null;
  }

  // Admin jogosultság ellenőrzése
  isAdmin(): boolean {
    const isAdmin = localStorage.getItem('isAdmin');
    return isAdmin ? JSON.parse(isAdmin) : false;  // Ha az isAdmin tárolt adat létezik, visszaadjuk, különben false
  }

  // Bejelentkezett-e a felhasználó?
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Token lekérése
  getToken(): string | null {
    return localStorage.getItem(this.tokenName);
  }

  // Token validálása
  isTokenValid(): boolean {
    const token = this.getToken();
    // Itt további validációt is végezhetünk, pl. ellenőrizhetjük, hogy a token nem járt-e le
    return token !== null;
  }
}
