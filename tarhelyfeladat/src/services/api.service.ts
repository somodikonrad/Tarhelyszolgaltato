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

  getToken(): string | null {
    return localStorage.getItem('token'); // Ne az environment változóból vedd, hanem közvetlenül!
  }
  

  /**
   * Header beállítása a bejelentkezési tokennel
   */
  tokenHeader(): { headers: HttpHeaders } {
    const token = this.getToken();
    if (!token) {
      console.warn('Nincs token a localStorage-ben!');
      return { headers: new HttpHeaders() }; // Üres fejléc, ha nincs token
    }
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }
  

  /**
   * Regisztrációs metódus
   * @param user - A regisztráló felhasználó adatai
   */
  registration(user: User): Observable<any> {
  
    return this.http.post<any>(`${this.server}/users/register`, user).pipe(
      catchError(error => {

        console.error('Registration failed', error);  
        return of(error);  
      })
    );
  }
  subscribe(data: object) {
    return this.http.post(`${this.server}/users/subscribe`, data, this.tokenHeader());
  }
  
  

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.server}/users/login`, { email, password }).pipe(
      catchError(error => {
        console.error('Login failed', error);
        return of(error);
      })
    );
  }
  
  

}
