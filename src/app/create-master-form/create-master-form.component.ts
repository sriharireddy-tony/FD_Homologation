import { Component, OnInit } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { Services } from 'src/app/services/services';
import { AppComponent } from 'src/app/app.component';
import { FormBuilder, Validators } from '@angular/forms';
import { MenuComponent } from '../menu/menu.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
declare var $: any



@Component({
  selector: 'app-create-master-form',
  templateUrl: './create-master-form.component.html',
  styleUrls: ['./create-master-form.component.css']
})
export class CreateMasterFormComponent implements OnInit {

  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";
  ATTR_REF_ID: string = '';
  loginUserID: string = '';
  isSubmitted: boolean = false;
  data_send: any = {}
  REF_ID:string='';
  ATTR_NAME:string='';
  AttributeChar: any = [];
  call_modal: Boolean = false;
  docNameDropArr:any =[];
  subscription: Subscription | undefined;
  disUpdate:boolean = false;
  
  constructor(private location: Location, private menuComp: MenuComponent, private service: Services, private appComponent: AppComponent, private fb: FormBuilder,
     private datepipe: DatePipe, private router: Router,private activatedRoute:ActivatedRoute) {
    this.service.lovMasaterList.subscribe((lovMasaterList: any) => {
      this.AttributeChar = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ATTRIBUTE_CHAR');
    })
    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.REF_ID = params.REF_ID;
      if(this.datavalidate(this.REF_ID)!=''){
        this.getData();
        this.disUpdate = true;
      }
    })
    this.service.loginUserID.subscribe((loginUserID: any) => {
      this.loginUserID = loginUserID;
    })
    this.subscription = this.service.callEngineModel.subscribe((call) => {
      if(call=='save'){
        this.save();
      }
     else if(call=='clear'){
      this.engineModelForm.reset();
     }
    })
  }

  engineModelForm = this.fb.group({
    ATTR_NAME: ['',Validators.required],
    ATTR_DESC: ['',Validators.required],
    ATTR_CHARACTERISTICS: [null,Validators.required],
    DOUMENT_NAME: [null,Validators.required],
    MANDATORY: ['',Validators.required],
    VISIBLE: ['',Validators.required],
    Highlite: ['',Validators.required],
  })

  ngOnInit(): void {
    this.getFDHLReportNames();
    this.getAllData();
  }
  ngOnDestroy() {
    this.subscription?.unsubscribe()
}
  clear(){
    this.engineModelForm.reset();
  }
  getFDHLReportNames(){
    this.service.invokeService("GetFDHLReportNames", null, this.namespace,true, false)
    .then((res: any) => {
      this.docNameDropArr = res;
    })
  }
  docSelectId:string ='';
  docDropSelect(e:any){
    this.docNameDropArr.forEach((d:any)=>{
      if(d.REPORT_NAME == e.target.value){
        this.docSelectId = d.REPORT_REF_ID
      }
    })
  }
  AttrCharSelect(e:any){
    if(e.target.value=='Sub_Group'){
      this.engineModelForm.patchValue({MANDATORY :'No'})
    } else {
      this.engineModelForm.patchValue({MANDATORY :''})
    }
  }
  getData(){
    let dataObj ={ATTR_REF_ID : this.REF_ID} 
    this.service.invokeService("GetFDHLAttributeDetailsByATTR_REF_ID", dataObj, this.namespace,true, false)
      .then((res: any) => {
        this.ATTR_REF_ID = res[0].ATTR_REF_ID
        this.ATTR_NAME = res[0].ATTR_NAME
        this.docSelectId = res[0].REPORT_REF_ID
        this.engineModelForm.patchValue({
          ATTR_NAME: this.datavalidate(res[0].ATTR_NAME),
          ATTR_DESC: this.datavalidate(res[0].ATTR_DESC),
          ATTR_CHARACTERISTICS: this.datavalidate(res[0].ATTR_CHARACTERISTICS),
          DOUMENT_NAME: this.datavalidate(res[0].DOUMENT_NAME),
          MANDATORY: this.datavalidate(res[0].MANDATORY),
          VISIBLE: this.datavalidate(res[0].VISIBLE),
          Highlite: this.datavalidate(res[0].ATTR_HIGHLIGHT)
        })
      })
    }
    uniqueObj:any ={};
    allUniqueStrArr:any=[]
    getAllData(){
      let tempArr:any=[]
      let arrUniqueObj:any =[]
      let dataObj ={ATTR_REF_ID : ''} 
      this.service.invokeService("GetFDHLAttributeDetailsByATTR_REF_ID", dataObj, this.namespace,true, false)
        .then((res: any) => {
          res.forEach((data:any)=>{
            tempArr.push({ATTR_NAME:this.datavalidate(data.ATTR_NAME),ATTR_DESC:this.datavalidate(data.ATTR_DESC),DOUMENT_NAME:this.datavalidate(data.DOUMENT_NAME)})
              if(this.datavalidate(this.REF_ID)!=''){
                if(data.ATTR_NAME==this.uniqueObj.ATTR_NAME && data.ATTR_DESC==this.uniqueObj.ATTR_DESC && data.DOUMENT_NAME==this.uniqueObj.DOUMENT_NAME){
                  tempArr.pop();
                }
              }
          })
          tempArr.forEach((d:any)=>{
            arrUniqueObj =[]
            Object.values(d).forEach((value) => {
              arrUniqueObj.push(value);
          })
          this.allUniqueStrArr.push(arrUniqueObj.toString())
        })
        })
    }
    uniqueCombination(){
      let arr:any =[];
      arr.push(this.datavalidate(this.engineModelForm.controls['ATTR_NAME'].value))
      arr.push(this.datavalidate(this.engineModelForm.controls['ATTR_DESC'].value))
      // arr.push(this.datavalidate(this.engineModelForm.controls['ATTR_CHARACTERISTICS'].value))
      arr.push(this.datavalidate(this.engineModelForm.controls['DOUMENT_NAME'].value))
      return (this.allUniqueStrArr.includes(arr.toString()) ? true : false)
    }
  save() {
    let dataObj = {};
    this.isSubmitted = true;
    this.call_modal =false;
    if (this.engineModelForm.invalid) {
      setTimeout(()=>{
        this.call_modal = true;
      this.data_send = { 'text': 'Please Enter All Mandatory Fields', active: this.call_modal };
    }, 0);
      return;
    }
    if(this.uniqueCombination() && !this.disUpdate){
      setTimeout(()=>{
        this.call_modal = true;
      this.data_send = { 'text': 'Master Attribute is already created with same combination', active: this.call_modal };
    }, 0);
      return;
    }
    if (this.datavalidate(this.ATTR_REF_ID) == '') {
      dataObj = {
        tuple: {
          new: {
            FD_HL_ATTRIBUTES_M: {
              'ATTR_NAME': this.datavalidate(this.engineModelForm.controls['ATTR_NAME'].value),
              'ATTR_DESC': this.datavalidate(this.engineModelForm.controls['ATTR_DESC'].value),
              'ATTR_CHARACTERISTICS': this.datavalidate(this.engineModelForm.controls['ATTR_CHARACTERISTICS'].value),
              'DOUMENT_NAME': this.datavalidate(this.engineModelForm.controls['DOUMENT_NAME'].value),
              'MANDATORY': this.datavalidate(this.engineModelForm.controls['MANDATORY'].value),
              'VISIBLE': this.datavalidate(this.engineModelForm.controls['VISIBLE'].value),
              'ATTR_HIGHLIGHT': this.datavalidate(this.engineModelForm.controls['Highlite'].value),
              'CREATION_DATE': this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
              'CREATED_BY': this.loginUserID,
              'REPORT_REF_ID': this.docSelectId
            }
          }
        }
      }
    } else {
      dataObj = {
        tuple: {
          old: {
            FD_HL_ATTRIBUTES_M: {
              ATTR_REF_ID: this.ATTR_REF_ID
            }
          },
          new: {
            FD_HL_ATTRIBUTES_M: {
              'ATTR_NAME': this.datavalidate(this.engineModelForm.controls['ATTR_NAME'].value),
              'ATTR_DESC': this.datavalidate(this.engineModelForm.controls['ATTR_DESC'].value),
              'ATTR_CHARACTERISTICS': this.datavalidate(this.engineModelForm.controls['ATTR_CHARACTERISTICS'].value),
              'DOUMENT_NAME': this.datavalidate(this.engineModelForm.controls['DOUMENT_NAME'].value),
              'MANDATORY': this.datavalidate(this.engineModelForm.controls['MANDATORY'].value),
              'VISIBLE': this.datavalidate(this.engineModelForm.controls['VISIBLE'].value),
              'ATTR_HIGHLIGHT': this.datavalidate(this.engineModelForm.controls['Highlite'].value),
              'MODIFIED_DATE': this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
              'MODIFIED_BY': this.loginUserID,
              'REPORT_REF_ID': this.docSelectId
            }
          }
        }
      }
    }

    this.service.invokeService("UpdateFdHlAttributesM", dataObj, this.namespace, true, false)
      .then((res: any) => {
        this.ATTR_REF_ID = res[0].ATTR_REF_ID
        this.call_modal = true;
        let text = this.disUpdate ? 'Master Attributes Updated Successfully' : 'New Master Attributes Created Successfully'
        this.data_send = { text: text, active: this.call_modal,from:'masterSave'};
      },
        (err) => {
          console.log('Error occured! While saving the data');
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


  back() {
    // this.router.navigate(['createmaster'])
    this.appComponent.routerName('createmaster','backBtn');
    this.menuComp.menuHideFun();
    this.location.back();
  }

}
