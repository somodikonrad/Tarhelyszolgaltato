import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { catchError } from 'rxjs/operators';  // catchError importálása
import { of } from 'rxjs';  // 'of' importálása a hiba kezeléséhez

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  private tokenName = environment.tokenName;
  private server = environment.serverUrl;

  getToken(): String | null {
    return localStorage.getItem(this.tokenName);
  }

  tokenHeader(): { headers: HttpHeaders } {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return { headers };
  }

  registration(user: User): Observable<any> {
  
    return this.http.post<any>(`${this.server}/users/register`, user).pipe(
      catchError(error => {
        // Hibák kezelése
        console.error('Registration failed', error);  // Hibák konzolra kiírása
        return of(error);  // Visszaadjuk a hibát, hogy a frontend is kezelhesse
      })
    );
  }

}
