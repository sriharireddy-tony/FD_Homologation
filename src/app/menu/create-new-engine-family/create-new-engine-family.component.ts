import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { MenuComponent } from '../menu.component';
import { AppComponent } from 'src/app/app.component';
import { FormBuilder, Validators } from '@angular/forms';
import { Services } from 'src/app/services/services';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
declare var $: any

@Component({
  selector: 'app-create-new-engine-family',
  templateUrl: './create-new-engine-family.component.html',
  styleUrls: ['./create-new-engine-family.component.css']
})
export class CreateNewEngineFamilyComponent implements OnInit {

  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";
  tabName: any;
  menuHide: boolean = true
  isSubmitted: boolean = false;
  ENGINE_F_REF_ID: string = '';
  loginUserID: string = '';
  REF_ID:string | undefined;
  ENGINE_FAMILY_NO:string=''

  enginePlatform: any = [];
  engineFIE: any = [];
  engineAspiration: any = [];
  engineVolume: any = [];
  // enginePower: any = [];
  engineEATS: any = [];
  call_modal:Boolean = false;
  data_send:any;
  subscription: Subscription | undefined;
  disUpdate:boolean = false;
  engineEmission:any=[]

  engineFamilyForm = this.fb.group({
    PLATFORM: ['', Validators.required],
    VOLUME: ['', Validators.required],
    RATED_POWER: ['', Validators.required],
    RATED_SPEED: ['', Validators.required],
    ASPIRATION_TYPE: ['', Validators.required],
    FIE_USED: ['', Validators.required],
    EATS_USED: [''],
    ENGINE_REMARKS: ['', Validators.required],
    EMISSION_COMPLIANCE: ['', Validators.required]
  })

  constructor(private location: Location, public menuComp: MenuComponent, private appComponent: AppComponent, private fb: FormBuilder, private service: Services, 
    private datepipe: DatePipe, private activatedRoute:ActivatedRoute) {
    this.service.lovMasaterList.subscribe((lovMasaterList: any) => {
      this.enginePlatform = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_PLATFORM');
      this.engineFIE = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_FIE');
      this.engineAspiration = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_ASPIRATION');
      this.engineVolume = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_VOLUME');
      this.engineEmission = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_EMISSION');
    this.engineEATS = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_EATS');
    this.bindSelected();
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
      this.clear();
     }
    })
  }

  ngOnInit(): void {
   setTimeout(() => {
    this.getAllData();
   }, 500);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe()
}
clear(){
  this.engineFamilyForm.patchValue({
    PLATFORM: '',
    VOLUME: '',
    ASPIRATION_TYPE: '',
    FIE_USED: '',
    EATS_USED: '',
    EMISSION_COMPLIANCE: '',
    RATED_POWER:'',
    RATED_SPEED:'',
    ENGINE_REMARKS:'',
  })
}
multiPlatform:string='';
multiPlatformDesc:string='';
selectPlatform(e:any){
  const arr = this.engineFamilyForm.controls['PLATFORM'].value.map((obj:any) => obj.LOV_ID);
  const arr1 = this.engineFamilyForm.controls['PLATFORM'].value.map((obj:any) => obj.LOV_DESC);
  this.multiPlatform = arr.sort().toString();
  this.multiPlatformDesc= arr1.sort().toString();
  console.log(this.multiPlatform)
}

uniqueObj:any ={};
getData(){
  let dataObj ={ENGINE_F_REF_ID : this.REF_ID} 
  this.service.invokeService("GetFDHLEngineFamilyDetails", dataObj, this.namespace,true, false)
    .then((res: any) => {
      this.multiPlatform = this.datavalidate(res[0].PLATFORM)
      this.ENGINE_FAMILY_NO = res[0].ENGINE_FAMILY_NO
      this.multiPlatformDesc = res[0].PLATFORM_DESC;
      this.engineFamilyForm.patchValue({
        // PLATFORM: res[0].PLATFORM_DESC.includes(',')? res[0].PLATFORM_DESC.split(',') : res[0].PLATFORM_DESC,
        VOLUME: this.datavalidate(res[0].VOLUME),
        RATED_POWER: this.datavalidate(res[0].RATED_POWER),
        RATED_SPEED: this.datavalidate(res[0].RATED_SPEED),
        ASPIRATION_TYPE: this.datavalidate(res[0].ASPIRATION_TYPE),
        FIE_USED: this.datavalidate(res[0].FIE_USED),
        EATS_USED: this.datavalidate(res[0].EATS_USED),
        LOCATION: this.datavalidate(res[0].LOCATION),
        EMISSION_COMPLIANCE: this.datavalidate(res[0].EMISSION_COMPLIANCE),
        ENGINE_REMARKS: this.datavalidate(res[0].ENGINE_REMARKS)
      })
      this.uniqueObj ={
        PLATFORM : this.datavalidate(res[0].PLATFORM),
        VOLUME: this.datavalidate(res[0].VOLUME),
        RATED_POWER : this.datavalidate(res[0].RATED_POWER),
        RATED_SPEED: this.datavalidate(res[0].RATED_SPEED),
        ASPIRATION_TYPE: this.datavalidate(res[0].ASPIRATION_TYPE),
        FIE_USED: this.datavalidate(res[0].FIE_USED)
      }
      this.bindSelected();
    })
}
bindSelected(){
  setTimeout(() => {
    const arr = this.multiPlatform.split(',')
    const multiSelected: any[] = [];
   for(let item of arr){
    for(let item1 of this.enginePlatform){
      if(item == item1.LOV_ID){
        multiSelected.push(item1)
      }
    }
   }
   this.engineFamilyForm.patchValue({
    PLATFORM: multiSelected
   })
  }, 0);
}
allUniqueStrArr:any=[]
uniquebool:boolean = false;
getAllData(){
  let tempArr:any=[]
  let arrUniqueObj:any =[]
  let dataObj ={ENGINE_F_REF_ID : ''} 
  this.service.invokeService("GetFDHLEngineFamilyDetails", dataObj, this.namespace,true, false)
    .then((res: any) => {
      res.forEach((data:any)=>{
        tempArr.push({PLATFORM:this.datavalidate(data.PLATFORM),VOLUME:this.datavalidate(data.VOLUME),
          RATED_POWER:this.datavalidate(data.RATED_POWER),RATED_SPEED:this.datavalidate(data.RATED_SPEED),
          ASPIRATION_TYPE:this.datavalidate(data.ASPIRATION_TYPE),FIE_USED:this.datavalidate(data.FIE_USED)})
          if(this.datavalidate(this.REF_ID)!=''){
          if(data.PLATFORM==this.uniqueObj.PLATFORM && data.VOLUME==this.uniqueObj.VOLUME && data.RATED_POWER==this.uniqueObj.RATED_POWER &&
            data.RATED_SPEED==this.uniqueObj.RATED_SPEED && data.ASPIRATION_TYPE==this.uniqueObj.ASPIRATION_TYPE && data.FIE_USED==this.uniqueObj.FIE_USED){
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
        });
    })
}

  back() {
    this.appComponent.routerName('engineFamily','backBtn');
    this.menuComp.menuHideFun();
    this.location.back();
  }
  uniqueCombination(){
    let arr:any =[];
    arr.push(this.datavalidate(this.multiPlatform))
    arr.push(this.datavalidate(this.engineFamilyForm.controls['VOLUME'].value))
    arr.push(this.datavalidate(this.engineFamilyForm.controls['RATED_POWER'].value))
    arr.push(this.datavalidate(this.engineFamilyForm.controls['RATED_SPEED'].value))
    arr.push(this.datavalidate(this.engineFamilyForm.controls['ASPIRATION_TYPE'].value))
    arr.push(this.datavalidate(this.engineFamilyForm.controls['FIE_USED'].value))
    return (this.allUniqueStrArr.includes(arr.toString()) ? true : false)
  }

  save() {
    this.call_modal = false;
    this.isSubmitted = true;
    let dataObj = {};
    if (this.engineFamilyForm.invalid) {
      setTimeout(()=>{
        this.call_modal = true;
      this.data_send = { 'text': 'Please Enter All Mandatory Fields', active: this.call_modal };
    }, 0);
      return;
    }
    if(this.uniqueCombination()){
      setTimeout(()=>{
        this.call_modal = true;
      this.data_send = { 'text': 'Engine Family is already created with same combination', active: this.call_modal };
    }, 0);
    return ;
    }
    if (this.datavalidate(this.REF_ID) != '') {
      dataObj = {
        tuple: {
          old: {
            FD_HL_ENGINE_FAMILY_M: {
              ENGINE_F_REF_ID: this.REF_ID
            }
          },
          new: {
            FD_HL_ENGINE_FAMILY_M: {
              'PLATFORM': this.datavalidate(this.multiPlatform),
              'PLATFORM_DESC': this.multiPlatformDesc,
              'VOLUME': this.datavalidate(this.engineFamilyForm.controls['VOLUME'].value),
              'RATED_POWER': this.datavalidate(this.engineFamilyForm.controls['RATED_POWER'].value),
              'RATED_SPEED': this.datavalidate(this.engineFamilyForm.controls['RATED_SPEED'].value),
              'ASPIRATION_TYPE': this.datavalidate(this.engineFamilyForm.controls['ASPIRATION_TYPE'].value),
              'FIE_USED': this.datavalidate(this.engineFamilyForm.controls['FIE_USED'].value),
              'EATS_USED': this.datavalidate(this.engineFamilyForm.controls['EATS_USED'].value),
              'MODIFIED_BY':this.loginUserID,
              'MODIFIED_DATE':this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
              'ENGINE_FAMILY_NO': this.ENGINE_FAMILY_NO,
              'EMISSION_COMPLIANCE': this.datavalidate(this.engineFamilyForm.controls['EMISSION_COMPLIANCE'].value),
              'ENGINE_REMARKS':this.datavalidate(this.engineFamilyForm.controls['ENGINE_REMARKS'].value)
            }
          }
        }
      }
    } else {
      dataObj = {
        tuple: {
          new: {
            FD_HL_ENGINE_FAMILY_M: {
              'ENGINE_F_REF_ID': '',
              'PLATFORM': this.datavalidate(this.multiPlatform),
              'PLATFORM_DESC': this.multiPlatformDesc,
              'VOLUME': this.datavalidate(this.engineFamilyForm.controls['VOLUME'].value),
              'RATED_POWER': this.datavalidate(this.engineFamilyForm.controls['RATED_POWER'].value),
              'RATED_SPEED': this.datavalidate(this.engineFamilyForm.controls['RATED_SPEED'].value),
              'ASPIRATION_TYPE': this.datavalidate(this.engineFamilyForm.controls['ASPIRATION_TYPE'].value),
              'FIE_USED': this.datavalidate(this.engineFamilyForm.controls['FIE_USED'].value),
              'EATS_USED': this.datavalidate(this.engineFamilyForm.controls['EATS_USED'].value),
              'CREATED_BY': this.loginUserID,
              'CREATION_DATE': this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
              'EMISSION_COMPLIANCE': this.datavalidate(this.engineFamilyForm.controls['EMISSION_COMPLIANCE'].value),
              'ENGINE_REMARKS':this.datavalidate(this.engineFamilyForm.controls['ENGINE_REMARKS'].value)
            }
          }
        }
      }
    }
    this.service.spinner.next(true);
    this.service.invokeService("UpdateFdHlEngineFamilyM", dataObj, this.namespace, true, false)
      .then((res: any) => {
        this.service.spinner.next(false);
        this.REF_ID = res[0].ENGINE_F_REF_ID
        this.ENGINE_FAMILY_NO = res[0].ENGINE_FAMILY_NO
        let dObj = {ENGINE_F_REF_ID:this.REF_ID}
        this.service.invokeService("SendFD_HLEngineFamilyCustomMail", dObj, this.namespace, true, false)
        .then((res: any) => {

        })
        this.call_modal =true;
        let text = this.disUpdate ? 'Engine Family Updated Successfully' : 'New Engine Family Created Successfully'
        let obj:any = {'text':text,'text1':`Serial Number`,'text2':`${res[0].ENGINE_FAMILY_NO}`,active:this.call_modal,from:'familySave'};
        this.data_send = obj;
      },
        (err) => {
          console.log('Error occured! While saving the data')
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
