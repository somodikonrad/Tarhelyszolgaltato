import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { User } from '../../interfaces/user';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [DividerModule, ButtonModule, InputTextModule, CommonModule, FormsModule, ToastModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  providers: [MessageService] // Hozzáadva a MessageService, ha nincs globálisan importálva
})
export class RegisterComponent {
  constructor(
    private api: ApiService,
    private message: MessageService // Javítva a MessageService név
  ) {}

  invalidFields:string[] = [];
 
  user:User = {
    id: '',
    username: '',
    email: '',
    password: '',
    role: ''
  }
 
  registration(){
    this.api.registration(this.user).subscribe((res:any) => {
      this.invalidFields = res.invalid;
      if (this.invalidFields.length == 0){
        this.message.showMessage('OK', res.message, 'success');
        this.user = {
          id: '',
          username: '',
          email: '',
          password: '',
          role: '',
        }
      }else{
        this.message.showMessage('HIBA', res.message, 'danger');
      }
    });
  }
 
  isInvalid(field:string){
    return this.invalidFields.includes(field);
  }
}
