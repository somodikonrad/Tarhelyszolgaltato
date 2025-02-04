import { Routes } from '@angular/router';
import { LoginComponent } from '../components/login/login.component';
import { RegisterComponent } from '../components/register/register.component';
import { PackagesComponent } from '../components/packages/packages.component';

export const routes: Routes = [
    {
        path: '', component: RegisterComponent
    },
    {
        path: 'login', component: LoginComponent
    },
    {
        path: 'packages', component: PackagesComponent
    },
    {
        path: '', redirectTo: '', pathMatch: 'full'
    }
 
];
 
