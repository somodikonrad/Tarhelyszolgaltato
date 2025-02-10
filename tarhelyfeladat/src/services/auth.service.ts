import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private tokenName = 'auth_token';
  
  // Reaktív állapotkezelés
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Bejelentkezés API hívás + felhasználói adatok mentése
  login(email: string, password: string): Observable<{ user: User; token: string; isAdmin: boolean }> {
    return this.http.post<{ user: User; token: string; isAdmin: boolean }>(`${this.apiUrl}/users/login`, { email, password })
      .pipe(
        tap(response => {
          console.log('Login API válasz:', response); // Debugging
          this.setCurrentUser(response.user, response.token, response.isAdmin);
        })
      );
  }
  
  

  // Felhasználó mentése a helyi tárolóba és frissítés


  private setCurrentUser(user: User, token: string, isAdmin: boolean): void {
    const decodedToken: any = jwtDecode(token);
    console.log("Decoded token:", decodedToken);
  
    localStorage.setItem("token", token);
    localStorage.setItem("isAdmin", decodedToken.role === "admin" ? "true" : "false");
    localStorage.setItem("currentUser", JSON.stringify(user)); // Felhasználói adatok mentése
  
    this.currentUserSubject.next(user);
  }
  
  // Kijelentkezés és adatok törlése
  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem(this.tokenName);
    localStorage.removeItem('isAdmin');
    this.currentUserSubject.next(null);
  }

  // Bejelentkezett felhasználó lekérése
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Bejelentkezett-e a felhasználó?
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Admin jogosultság ellenőrzése
  isAdmin(): boolean {
    const isAdmin = localStorage.getItem('isAdmin');
    return isAdmin === "true"; // Direktben ellenőrizzük a string értéket
  }
  // Token lekérése
  getToken(): string | null {
    return localStorage.getItem(this.tokenName);
  }

  // Felhasználó betöltése a localStorage-ból
  private loadUserFromStorage(): User | null {
    const user = localStorage.getItem('currentUser');
    
    // Ellenőrizzük, hogy van-e adat a 'currentUser' key alatt
    if (!user) {
      return null; // Ha nincs adat, akkor nem próbálkozunk a JSON.parse-tel
    }
  
    try {
      return JSON.parse(user); // Megpróbáljuk JSON formátumban értelmezni
    } catch (error) {
      console.error('Hiba történt a felhasználó betöltésekor a localStorage-ból:', error);
      localStorage.removeItem('currentUser'); // Töröljük az érvénytelen adatot
      return null;
    }
  }
  
  
}

