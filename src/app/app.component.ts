import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CreateNewEngineModelComponent } from './menu/create-new-engine-model/create-new-engine-model.component';
import { Services } from './services/services';
declare var $: any

@Component({
  // providers:[CreateNewEngineModelComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'FD_Homologation';
  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";

  tabName: any = '';
  btnHide: string = '';
  HR_REF_NO: string = '';
  actRole: string = '';
  actStage:string='';
  subscription: Subscription | undefined;
  repConfBtn:boolean=false;
  revBtnEnable:boolean = false;
  newLineBtn:boolean = true;
  actStag:string='';
  saveBtn:string='';
  spinner:boolean = false;
  SaveUpdateHRNo:string ='';

  constructor(private service: Services, private router: Router) {
    this.service.spinner.subscribe((bool:any)=>{
      this.spinner = bool;
    })
    this.service.SaveUpdateHRNo.subscribe((SaveUpdateHRNo:any)=>{
      this.SaveUpdateHRNo = SaveUpdateHRNo;
      this.saveBtn = this.datavalidate(this.SaveUpdateHRNo) == ''? 'Save' : 'Update'
    })
    this.service.HR_REF_NO.subscribe((obj: any) => {
      let temp = window.location.href.split('/')[window.location.href.split('/').length - 1]
      this.HR_REF_NO = obj.HR_REF_NO;
      this.actRole = obj.actRole;
      this.actStage = this.datavalidate(obj.actStage)
      if (this.HR_REF_NO != undefined && temp.includes('?')) {
        let routerName = window.location.href.split('/')[window.location.href.split('/').length - 1].split('?')[0]
        this.routerName(routerName, '');
      }
    })
    // if ($.cordys.authentication.sso.isAuthenticated()) {
      $.cordys.authentication.getUser().done((userObject: any) => {
          if(this.datavalidate(userObject.userName)!='' && this.datavalidate(userObject.userName)!='anonymous'){
            let param = { userId: userObject.userName};
          this.service.invokeService("GetFDHLLoginUser", param, this.namespace, true, false)
          .then((response: any) => {
              this.service.sharingData(userObject.userName, 'loginUserID');
              this.service.sharingData(response[0].getFDHLLoginUser.USER.USERNAME, 'loginUserName');
              this.getLovMasterData();
              this.getEngineFamily();
            }).catch((error: any) => {
              alert(error);
            });
            } else {
              $.cordys.authentication.sso.authenticate('venkat', 'venkat').done(() => {
                this.getLovMasterData();
                this.getEngineFamily();
                // this.router.navigate(['/home']);
              });
            }
      });
    // } else {
    //   $.cordys.authentication.sso.authenticate('venkat', 'venkat').done(() => {
    //   });
    // }


    this.service.repConfEventCall.subscribe((call:any) => {
      if (this.datavalidate(call.split(',')[0])!='') {
        this.repConfBtn = true;
      } else {
        this.repConfBtn = false;
      }
      if(this.datavalidate(call.split(',')[1])=='1'){
        this.revBtnEnable = true;
      } else {
        this.revBtnEnable = false;
      }
    })
    this.service.addNewLineBtn.subscribe((d:any) => {
      this.newLineBtn = d==0 ? false: this.datavalidate(d) =='a' ? true : false;
    })
    this.service.ARAIFlag.subscribe((d1:any) => {
     this.procesStatus = d1
    })
    this.service.cloneHRNo.subscribe((clone:any)=>{
      this.cloneHRNo = this.datavalidate(clone)
    })
  }

cloneHRNo:string='';
  procesStatus:string='';
  ngOnInit(): void {
    let routerName = window.location.href.split('/')[window.location.href.split('/').length - 1];
    if (routerName.includes('?')) {
      let split = routerName.split('?')
      routerName = split[0]
      this.REF_ID = split[1].includes('&') ? '' : split[1]
    }
    setTimeout(() => {
      if (!routerName.includes('?')) {
        this.routerName(routerName, '');
      }
    }, 0)
    this.subscription = this.service.routeChange.subscribe((call: any) => {
      this.routerName(call, '');
    })
    this.service.actStag.subscribe((d:any)=>{
      this.actStag = d
    })
  }

  engineFamilyBtnDisable: boolean = false;
  engineModelBtnDisable: boolean = false;
  REF_ID: string = ''

  routerName(type: string, tab: string) {
    this.getopenAs(); 
    this.repConfBtn = false;
    type = this.OpenAs=='completed'? 'completedTasks' : this.OpenAs=='dashboard'? 'dashboard' : type
    if (tab == 'backBtn') {
      this.REF_ID = ''
    }
    if (type.includes(',')) {
      let split = type.split(',')
      type = split[0]
      this.REF_ID = split[1]
    }

    setTimeout(() => {
      this.actRole = tab == 'tabPage' ? '' : this.actRole
      this.btnHide = type == 'createNewEngineModel' && this.REF_ID == '' ? 'Create New Engine Model' :
        type == 'createNewEngineFamily' && this.REF_ID == '' ? 'Create New Engine Family' :
          type == 'createNewEngineModel' && this.REF_ID != '' ? 'Engine Model' :
            type == 'createNewEngineFamily' && this.REF_ID != '' ? 'Update Engine Family' :
              type == 'createmasterform' && this.REF_ID != '' ? 'Update Master Attributes' :
                type == 'engineModel' ? 'Engine Model' : type == 'clone' ? 'Clone Request' :
                  type == 'engineFamily' ? 'Engine Family' : type == 'createmaster' ? 'Create Master Attributes' :
                    type == 'createmasterform' ? 'Create New Master Attributes' : type == 'saved' ? 'Requester Saved' :
                      type == 'inbox' ? 'Requester Inbox' : type == 'completedTasks' ? 'Requester Completed Task' :
                        type == 'createNewRequest' && (this.datavalidate(this.actRole) =='' || this.datavalidate(this.actRole) =='FD_HL_REQUESTOR') ? 'Create New Request' :
                         type == 'createmasterform' ? 'Create Master Form' :
                          type == 'createNewRequest' && (this.datavalidate(this.actRole) == 'FD_HL_CD_COE_SPOC') ? 'CD CoE SPOC Request Screen' :
                            type == 'reportconfig' ? 'Report Configuration' : type == 'dashboard' ? 'Dashboard' :''
    }, 0);
  
  }

  tabNameChange1(name: any) {
    this.tabName = name;
    this.routerName(name, 'tabPage');
  }

  OpenAs:string='';
  getopenAs(){
    let routerName = window.location.href.split('/')[window.location.href.split('/').length - 1];
    if (routerName.includes('openAs')) {
      this.OpenAs = routerName.split('?')[1].split('&')[1].split('=')[1]
    } else {
      this.OpenAs = "";
    }
    this.saveBtn = this.datavalidate(this.SaveUpdateHRNo) == ''? 'Save' : 'Update'
  }

  getLovMasterData() {
    let param = { type: "" };
    this.service.invokeService("GetFDHLLovMasterDetailsByType", param, this.namespace, true, false)
      .then((response: any) => {
        this.service.sharingData(response, 'LovDetails');
      }).catch((error: any) => {
        alert(error);
      });
  }
  public engineModel(arg: string): void {
    this.service.callEngineModel.next(arg);
  }
  public engineFamily(arg: string): void {
    this.service.callEngineModel.next(arg);
  }
  masterAttribute(arg: string) {
    this.service.callEngineModel.next(arg);
  }

  // masterattributes(){
  //   this.service.masterAttributes.next( true );
  // }

  createPageEvents(arg: string) {
    this.service.createPageEvents.next(arg);
  }
  ENGINE_FAMILY_NO_Arr: any = []

  getEngineFamily() {
    let dataObj = { ENGINE_M_REF_ID: '' }
    this.service.invokeService("GetFDHLEngineFamilyDetails", dataObj, this.namespace, true, false)
      .then((res: any) => {
        res.forEach((data: any) => {
          this.ENGINE_FAMILY_NO_Arr.push({ RefNo: data.ENGINE_F_REF_ID, engineFamilyNo: data.ENGINE_FAMILY_NO })
        })
      })
  }
  datavalidate(data: string | null | undefined) {
    //debugger;
    if (data != undefined && data != null && data != "") {
      return data;
    } else {
      return "";
    }
  }
}
