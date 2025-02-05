import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { DialogModule } from 'primeng/dialog';


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
    DialogModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  
  title = 'Public';
  items: MenuItem[] | undefined;
  isMobile: boolean = false;
  menuOpen: boolean = false;

  ngOnInit(): void {
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
      { 
        label: 'Csomagválasztó',
        icon: 'pi pi-shopping-bag',
        routerLink: '/packages'
      },
    ];

    this.checkScreenSize();
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
