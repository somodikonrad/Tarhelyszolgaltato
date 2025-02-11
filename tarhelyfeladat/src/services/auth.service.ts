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

login(email: string, password: string): Observable<{ user: User; token: string; isAdmin: boolean }> {
  return this.http.post<{ user: User; token: string; isAdmin: boolean }>(`${this.apiUrl}/users/login`, { email, password })
    .pipe(
      tap(response => {
        console.log('Login API válasz:', response); // Debugging

        if (response && response.token) {
          const user: User = {
            id: response.user.id,
            email: email, // Az email, amit a felhasználó megadott
            username: response.user.username || '', // A username itt biztosan bekerül
            password: '',
            role: response.user.role // Ha role-t is át szeretnél venni
          };

          // Admin státusz beállítása
          const isAdmin = response.user.role === 'admin'; // Feltételes operátor helyett

          // Frissítsd a currentUser objektumot
          this.setCurrentUser(user, response.token, isAdmin);
        } else {
          console.error("Hibás válasz: Nincs user objektum", response);
        }
      })
    );
}

  
  
  
  

  // Felhasználó mentése a helyi tárolóba és frissítés


  private setCurrentUser(user: User, token: string, isAdmin: boolean): void {
    console.log("Mentett user:", user);
    
    localStorage.setItem(this.tokenName, token);
    localStorage.setItem("isAdmin", isAdmin ? "true" : "false");

    try {
        const userJson = JSON.stringify(user);
        console.log("JSON formátumú user:", userJson);
        localStorage.setItem("currentUser", userJson);
    } catch (error) {
        console.error("Hiba a JSON konvertáláskor:", error);
    }

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
    console.log("Betöltött user (string):", user);
    
    if (!user) {
        console.warn("Nincs elmentett currentUser a localStorage-ban.");
        return null;
    }
    
    try {
        const parsedUser = JSON.parse(user);
        console.log("Betöltött user (parsed):", parsedUser);
        return parsedUser;
    } catch (error) {
        console.error("Hibás JSON formátum a localStorage-ban:", error);
        localStorage.removeItem('currentUser'); // Töröljük a hibás adatot
        return null;
    }
}

  
  
  
}

