import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { MessageService } from '../../services/message.service';
import { Router, RouterModule } from '@angular/router';
import { Package } from '../../interfaces/package';


@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, FormsModule, RouterModule],
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
    private authService: AuthService ,// AuthService injektálása
    private apiService: ApiService,
    private message: MessageService,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.loadPackages(); // Csomagok betöltése
    this.isAdmin = this.authService.isAdmin(); // Admin jogosultság ellenőrzése
  }

  // Csomagok betöltése
  loadPackages() {
    this.apiService.getPackages().subscribe((data: Package[]) => {
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
  
    this.apiService.createPackage(this.newPackage).subscribe(
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
  Buy(packageId: number) {
    // Ellenőrizd, hogy a packageId érvényes-e
    if (!packageId) {
      this.message.showMessage('HIBA', 'A csomag azonosító nem érvényes!', 'danger');
      return;
    }
  
    // Az adatokat egy objektumban átadjuk a subscribe metódusnak
    const data = { packageId };
  
    // Hívjuk meg az API subscribe() metódusát a packageId paraméterrel
    this.apiService.subscribe(data).subscribe(
      (response: any) => {
        // Sikeres előfizetés
        if (response?.message) { // Ha van üzenet a válaszban, akkor hiba történt
          this.message.showMessage('HIBA', response.message, 'danger'); // Hibaüzenet megjelenítése
        } else {
          // Sikeres előfizetés
          this.message.showMessage('OK', response.message, 'success');
          this.router.navigateByUrl('/packages');
        }
      },
      (error) => {
        // Hibakezelés: ha hiba történik az API hívás során
        console.error('Hiba az előfizetés során:', error);
      
        const errorMessage = error?.error?.message || 'Ismeretlen hiba történt!';
        this.message.showMessage('HIBA', errorMessage, 'danger');
      }
    );
  }
  
  deletePackage(id: number) {
    // Ellenőrizd, hogy az id string típusú, ha igen, konvertáld át number típussá
    const packageId = typeof id === 'string' ? Number(id) : id;
  
    if (confirm('Biztosan törölni szeretné ezt a csomagot?')) {
      this.apiService.deletePackage(id).subscribe(
        (response) => {
          console.log('Csomag törölve:', response);
          // A törölt csomagot eltávolítjuk a listából
          this.packages = this.packages.filter(pkg => pkg.id !== packageId);
        },
        (error) => {
          console.error('Hiba történt a csomag törlése közben:', error);
          alert('Hiba történt a csomag törlése közben: ' + (error.error?.message || error.message || 'Ismeretlen hiba'));
        }
      );
    }
  }
  
  

  // Form bezárása
  cancelCreatePackage() {
    this.createPackageFormVisible = false;
  }
}