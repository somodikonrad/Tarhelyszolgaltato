import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from '../services/message.service';
import { AlertComponent } from '../components/alert/alert.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MenubarModule,
    PanelMenuModule,
    RouterModule,
    DialogModule, 
    AlertComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Public';
  items: MenuItem[] = [];
  isMobile: boolean = false;
  menuOpen: boolean = false;
  private authSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.authSubscription = this.authService.currentUser$.subscribe(() => {
      this.updateMenu(); // Minden bejelentkezés/kijelentkezés után frissítjük a menüt
    });
    this.updateMenu(); // Kezdeti állapot beállítása
  }

  updateMenu() {
    if (this.authService.isLoggedIn()) {
      this.items = [
        {
          label: 'Csomagválasztó',
          icon: 'pi pi-shopping-bag',
          routerLink: '/packages'
        },
        {
          label: 'Kijelentkezés',
          icon: 'pi pi-sign-out',
          command: () => this.logout()
        }
      ];
    } else {
      this.items = [
        {
          label: 'Regisztráció',
          icon: 'pi pi-user-plus',
          routerLink: '/'
        },
        {
          label: 'Bejelentkezés',
          icon: 'pi pi-user',
          routerLink: '/login'
        },
        
      ];
    }
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.authService.logout();
    this.messageService.showMessage('OK', 'Sikeres kijelentkezés!', 'success');
    this.router.navigateByUrl('/login');
    this.updateMenu();
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe(); // Ne szivárogjon a memória
  }
}
