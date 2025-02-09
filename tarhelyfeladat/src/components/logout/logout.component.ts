import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Kilépés logikája
    this.logout();
  }

  logout() {
    // A token törlése a localStorage-ból
    localStorage.removeItem('token');

    // Beállítjuk, hogy a felhasználó kilépett
    // Irányítjuk a bejelentkezési oldalra
    this.router.navigate(['/login']);
  }
}
