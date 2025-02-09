import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable, of } from 'rxjs';
import { User } from '../interfaces/user';
import { catchError } from 'rxjs/operators';  // catchError importálása

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  private tokenName = environment.tokenName;
  private server = environment.serverUrl;

  /**
   * Bejelentkezési token lekérése a localStorage-ból
   */
  getToken(): String | null {
    return localStorage.getItem(this.tokenName);
  }

  /**
   * Header beállítása a bejelentkezési tokennel
   */
  tokenHeader(): { headers: HttpHeaders } {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return { headers };
  }

  /**
   * Regisztrációs metódus
   * @param user - A regisztráló felhasználó adatai
   */
  registration(user: User): Observable<any> {
  
    return this.http.post<any>(`${this.server}/users/register`, user).pipe(
      catchError(error => {
        // Hibák kezelése
        console.error('Registration failed', error);  // Hibák konzolra kiírása
        return of(error);  // Visszaadjuk a hibát, hogy a frontend is kezelhesse
      })
    );
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.server}/users/login`, { username, password }).pipe(
      catchError(error => {
        console.error('Login failed', error);
        return of(error);
      })
    );
  }
  
  

}
