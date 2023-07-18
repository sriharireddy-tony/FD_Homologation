import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Services } from '../services/services';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css']
})
export class InboxComponent implements OnInit {

  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";
  pagination:any= { itemsPerPage: 10, currentPage: 1 }
  loginUserID:string ='';
  inbox_data:any=[];

  constructor(private service: Services,private router:Router) { 
    this.service.loginUserID.subscribe((loginUserID: any) => {
      this.loginUserID = loginUserID;
      if(loginUserID !=''){
        this.getRoles();
      }
    })
  }

  ngOnInit(): void {
    
  }

  handlePageChange(eve:any){
    this.pagination.currentPage = eve; 
  }
  rolesString:string=''
  getRoles(){
    let dataObj = {userId : this.loginUserID}
    this.service.invokeService("GetFD_HL_ProjectTeamRolesByUserId", dataObj, this.namespace,true, false)
      .then((res: any) => {
        let rolesArr:any =[]
       res.forEach((obj:any)=>{
        rolesArr.push(obj.UM_USER_ROLE)
       })
       this.rolesString = rolesArr.toString();
       this.getInboxData();
      })
  }

  getInboxData(){
    let dataObj = {
      loginUser : this.loginUserID,
      loginUserRoles : this.rolesString
    }
    this.service.invokeService("GetFD_HLInboxDetails", dataObj, this.namespace,true, false)
      .then((res: any) => {
       this.inbox_data = res
      })
  }
  clickToView(taskId: string){
    this.router.navigate(['/createNewRequest'],{ queryParams: { taskId: taskId, openAs:"customInboxTask"} });
}

}
