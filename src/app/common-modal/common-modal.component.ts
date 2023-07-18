import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PrimeNGConfig } from "primeng/api";
import { AppComponent } from '../app.component';
import { Services } from '../services/services';
  
@Component({
  selector: 'app-common-modal',
  templateUrl: './common-modal.component.html',
  styleUrls: ['./common-modal.component.css']
})
export class CommonModalComponent implements OnInit {
  displayBasic:Boolean = true;
  @Input() data_display:any;
  openas:string=''
  constructor(private primengConfig: PrimeNGConfig,private service: Services,private router: Router,private appComponent:AppComponent) {
  }
  ngOnInit(): void {
    this.openas = window.location.href.split('&')[window.location.href.split('&').length - 1].split('=')[1];
    this.primengConfig.ripple = true;
    this.displayBasic = this.data_display.active;
  }
  close(){
  if(this.data_display.from =='task'){
    if (this.openas == 'customInboxTask'){
      this.router.navigate(['/inbox']);
      this.service.routeChange.next('inbox');
    }
     else if (this.openas == 'mail'){
      window.close();
    }
    else{
      this.router.navigate(['/inbox']);
      this.service.routeChange.next('inbox')
    }
  }
  if(this.data_display.from =='familySave'){
    this.router.navigate(['/engineFamily']);
    this.service.routeChange.next('engineFamily');
    this.appComponent.routerName('engineFamily','backBtn');
  }
  if(this.data_display.from =='modelSave'){
    this.router.navigate(['/engineModel']);
    this.service.routeChange.next('engineModel');
    this.appComponent.routerName('engineModel','backBtn');
  }
  if(this.data_display.from =='masterSave'){
    this.router.navigate(['/createmaster']);
    this.service.routeChange.next('createmaster'); 
    this.appComponent.routerName('createmaster','backBtn');
  }
}
}
