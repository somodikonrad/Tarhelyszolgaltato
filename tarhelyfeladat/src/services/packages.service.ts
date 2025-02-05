import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Package {
  id: number;
  name: string;
  price: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class PackagesService {
  private apiUrl = 'http://localhost:3000/packages';

  constructor(private http: HttpClient) { }

  getPackages(): Observable<Package[]>{
    return this.http.get<Package[]>(this.apiUrl);
  }

  // Új csomag létrehozása
  createPackage(pkg: Package): Observable<Package> {
    return this.http.post<Package>(this.apiUrl, pkg);
  }
}
