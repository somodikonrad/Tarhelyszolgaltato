import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Package, PackagesService } from '../../services/packages.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, FormsModule],
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss'],
})
export class PackagesComponent implements OnInit {
  packages: Package[] = []; // Csomagok listája
  createPackageFormVisible: boolean = false; // Az új csomag form láthatósága
  newPackage: Package = {
    name: '', price: 0, description: '',
    id: 0
  }; // Az új csomag adatai
  isAdmin: boolean = false; // Admin jogosultság kezelése

  constructor(
    private packageService: PackagesService,
    private authService: AuthService // AuthService injektálása
  ) {}

  ngOnInit(): void {
    this.loadPackages(); // Csomagok betöltése
    this.isAdmin = this.authService.isAdmin(); // Admin jogosultság ellenőrzése
  }

  // Csomagok betöltése
  loadPackages() {
    this.packageService.getPackages().subscribe((data: Package[]) => {
      this.packages = data; // A kapott adatokat a csomagok listájához adjuk
    });
  }

  // A felugró ablak megjelenítése
  showCreatePackageForm() {
    this.createPackageFormVisible = true;
  }

  // A csomag mentése az adatbázisba
  savePackage() {
    if (!this.newPackage.name || !this.newPackage.price || !this.newPackage.description) {
      console.error('Hiba: Néhány mező üres.');
      return; // Ha valamelyik mező üres, ne küldjük el a csomagot
    }
  
    this.packageService.createPackage(this.newPackage).subscribe(
      (response) => {
        console.log('Csomag sikeresen létrehozva:', response); // sikeres válasz
        this.loadPackages(); // Frissítjük a csomagok listáját
      },
      (error) => {
        console.error('Hiba történt:', error); // Hiba válasz kezelése
        alert('Hiba történt a csomag mentésekor: ' + (error.error?.message || error.message || 'Ismeretlen hiba'));
      }
    );
  }

  // Form bezárása
  cancelCreatePackage() {
    this.createPackageFormVisible = false;
  }
}
