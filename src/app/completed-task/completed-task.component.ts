import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Services } from '../services/services';

@Component({
  selector: 'app-completed-task',
  templateUrl: './completed-task.component.html',
  styleUrls: ['./completed-task.component.css']
})
export class CompletedTaskComponent implements OnInit {

  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";
  pagination:any= { itemsPerPage: 10, currentPage: 1 }
  completedData:any=[];
  loginUserID:string ='';

  constructor(private service: Services,private router:Router) {
    this.service.loginUserID.subscribe((loginUserID: any) => {
      this.loginUserID = loginUserID;
      if(loginUserID !=''){
        this.getCompletedData();
      }
    })
   }

  ngOnInit(): void {

  }

  handlePageChange(eve:any){
    this.pagination.currentPage = eve; 
  }
  clickToView(HR_REF_NO: any){
    this.router.navigate(['/createNewRequest'],{ queryParams: { HR_REF_NO: HR_REF_NO, openAs:"completed" } });
  }
  getCompletedData(){
    let dataObj = {userId : this.loginUserID}
    this.service.invokeService("GetFD_HLCompletedRequests", dataObj, this.namespace,true, false)
      .then((res: any) => {
       this.completedData = res
      })
  }
}
