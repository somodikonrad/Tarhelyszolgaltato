import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { provideHttpClient } from '@angular/common/http';
 
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, MenubarModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
 
export class AppComponent implements OnInit {
  
  title = 'Public';
  
  items: MenuItem[]|undefined;

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
    }
    ]
}
}
 