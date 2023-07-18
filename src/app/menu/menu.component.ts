import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AppComponent } from '../app.component';
import { Services } from '../services/services';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, AfterViewInit {

  tabName: any;
  menuHide: boolean = true;
  loginUserID: string = '';
  @Output() tabNameChange = new EventEmitter<any>()


  constructor(private router: Router, private service: Services, public appComponent: AppComponent) {
    this.service.loginUserID.subscribe((loginUserID: any) => {
      this.loginUserID = loginUserID;
      if (this.loginUserID) {
        this.getRoles();
      }
    })
  }

  ngOnInit(): void {
    this.activeNewRequestTab();
    this.service.taskPage.subscribe((call) => {
      this.menuHide = false;
    })
    let routerName = window.location.href.split('/')[window.location.href.split('/').length - 1];
    if (routerName.includes('?')) {
      let a = routerName.split('?')[0] + "," + routerName.split('?')[1].split('=')[1]
      this.tabClick(a);
    }
    else {
      this.service.routeChange.subscribe((call: any) => {
        this.tabClick(call);
      })
    }
    this.service.routeChange.subscribe((call: any) => {
      this.tabClick(call);
    })
  }
  ngAfterViewInit() {

  }

  tabClick(type: any): void {
    this.service.createPageEvents.next('');
    let REF_ID: string = ''
    if (type.includes(',')) {
      let split = type.split(',')
      type = split[0]
      REF_ID = split[1]
      type == 'createNewEngineFamily' ? this.router.navigate(['/createNewEngineFamily'], { queryParams: { REF_ID: REF_ID } }) :
        type == 'createNewEngineModel' ? this.router.navigate(['/createNewEngineModel'], { queryParams: { REF_ID: REF_ID } }) :
          type == 'createmasterform' ? this.router.navigate(['/createmasterform'], { queryParams: { REF_ID: REF_ID } }) : ''
    }

    this.tabName = type;
    if (type == 'createNewEngineFamily' || type == 'createNewEngineModel' || type == 'createmasterform') {
      this.menuHide = false;
    }
    else {
      this.menuHide = true;
    }
    this.tabNameChange.emit(type);
  }

  menuHideFun() {
    let routerName = window.location.href.split('/')[window.location.href.split('/').length - 1];
    routerName = routerName.includes('?') ? routerName.split('?')[0] : routerName
    this.menuHide = true;
    // let routerName = window.location.href.split('/')[window.location.href.split('/').length - 1];
    this.tabName = routerName == 'createNewEngineFamily' ? 'engineFamily' : routerName == 'createNewEngineModel' ? 'engineModel' : routerName == 'createmasterform' ? 'createmaster' : 'createmaster'
  }


  activeNewRequestTab() {
    let routerName = window.location.href.split('/')[window.location.href.split('/').length - 1];
    routerName = routerName.includes('?') ? routerName.split('?')[0] : routerName
    if (routerName == 'createNewEngineFamily' || routerName == 'engineFamily' || routerName == 'createNewEngineModel' || routerName == 'engineModel' || routerName == 'createmaster') {
      this.tabName = routerName == 'createNewEngineFamily' ? 'engineFamily' : routerName == 'engineFamily' ? 'engineFamily' :
        routerName == 'createNewEngineModel' ? 'engineModel' : routerName == 'engineModel' ? 'engineModel' : routerName == 'createmaster' ? 'createmaster' : ''
    }
    if (routerName == 'createNewEngineFamily' || routerName == 'createNewEngineModel' || routerName == 'createmasterform') {
      this.menuHide = false;
    }
  }
  rolesArr: any = [];
  getRoles() {
    let dataObj = { userId: this.loginUserID }
    this.service.invokeService("GetFD_HL_ProjectTeamRolesByUserId", dataObj, "http://schemas.cordys.com/FD_HL_WSPackage", true, false)
      .then((res: any) => {
        this.rolesArr = []
        res.forEach((obj: any) => {
          this.rolesArr.push(obj.UM_USER_ROLE)
        })
        let FD_HL_REQUESTOR = ["Engine Family", "Engine Model", "Create New Request", "Clone", "Inbox", "Saved", "Completed Task", "Dashboard"];
        let FD_HL_CD_COE_SPOC = ["Inbox", "Create Master Attributes", "Report Config", "Dashboard"]
        let FD_HL_HEAD = ["Dashboard"]
        let FD_HL_VIEWER = ["ViewDashboard"]
        this.rolesArr.forEach((d: any) => {
          if (d == 'FD_HL_REQUESTOR') {
            this.tabsArr.push(...FD_HL_REQUESTOR)
          }  else if (d == 'FD_HL_CD_COE_SPOC') {
            this.tabsArr.push(...FD_HL_CD_COE_SPOC)
          } else if (d == 'FD_HL_HEAD') {
            this.tabsArr.push(...FD_HL_HEAD)
          } else if (d == 'FD_HL_VIEWER') {
            this.tabsArr.push(...FD_HL_VIEWER)
          }
        })
        this.service.tabsArr.next(this.tabsArr)
      })
  }
  tabsArr: any = [];
  tabHide(arg: string) {
    if (this.tabsArr.includes(arg)) {
      return true;
    } else {
      return false;
    }
  }
  dashboardTab(){
    if(this.tabsArr.includes('Dashboard') || this.tabsArr.includes('ViewDashboard')){
      return true;
    } else {
      return false;
    }
  }
}
