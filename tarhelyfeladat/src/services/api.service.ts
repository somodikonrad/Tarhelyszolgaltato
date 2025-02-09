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

  getToken(): string | null {
    return localStorage.getItem('token'); // Ne az environment változóból vedd, hanem közvetlenül!
  }
  

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
  
  

  
}
