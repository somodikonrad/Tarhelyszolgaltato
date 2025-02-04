import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { Message } from '../../interfaces/message';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})

export class AlertComponent implements OnInit{

  constructor(private messageService: MessageService){}

  message:Message | null = null;
  closeAletInterval: any;

  ngOnInit(): void {
    this.messageService.messageSubject$.subscribe(msg => {
      this.message = msg;

     this.closeAletInterval = setTimeout(()=>{
        this.closeAlert();
      }, 5000);

    });
  }

  closeAlert(){
    this.messageService.clearMessage();
    clearInterval(this.closeAletInterval)
  }
}

