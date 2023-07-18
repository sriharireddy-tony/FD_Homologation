import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Services } from '../services/services';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.css']
})
export class SavedComponent implements OnInit {

  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";
  pagination:any= { itemsPerPage:10, currentPage: 1 }
  savedData:any=[];
  loginUserID:string ='';

  constructor(private service: Services,private router:Router) { 
    this.service.loginUserID.subscribe((loginUserID: any) => {
      this.loginUserID = loginUserID;
      if(loginUserID !=''){
        this.getSavedData();
      }
    })
  }
  ngOnInit(): void {
    
  }

  clickToView(HR_REF_NO: any){
    this.router.navigate(['/createNewRequest'],{ queryParams: { HR_REF_NO: HR_REF_NO, openAs:"saved" } });
  }

  handlePageChange(eve:any){
    this.pagination.currentPage = eve; 
  }

  getSavedData(){
    let dataObj = {userId : this.loginUserID}
    this.service.invokeService("GetFd_HLSavedRequestsByHR_RefNo", dataObj, this.namespace,true, false)
      .then((res: any) => {
       this.savedData = res
      })
  }
}
