import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../menu.component';
import { DatePipe, Location } from '@angular/common';
import { Services } from 'src/app/services/services';
import { AppComponent } from 'src/app/app.component';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { ActivatedRoute } from '@angular/router';
declare var $: any


@Component({
  selector: 'app-create-new-engine-model',
  templateUrl: './create-new-engine-model.component.html',
  styleUrls: ['./create-new-engine-model.component.css']
})
export class CreateNewEngineModelComponent implements OnInit {

  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";
  ENGINE_M_REF_ID: string = '';
  loginUserID: string = '';
  isSubmitted: boolean = false;
  REF_ID: string = ''
  ENGINE_MODEL_NO: string = ''

  engineFamily: any = [];
  engineVarient: any = [];
  engineApplication: any = []
  enginePlatform: any = []
  engineFIE: any = []
  engineEmission: any = []
  engineAspiration: any = []
  call_modal: Boolean = false;
  data_send: any;
  ENGINE_FAMILY_NO_Arr: any = []
  engineVolume: any = [];
  disUpdate: boolean = false;
  subscription: Subscription | undefined;
  company: any = [];
  addiInfo: any = [];

  engineModelForm = this.fb.group({
    APPLICATION_TYPE: ['', Validators.required],
    PLATFORM: ['', Validators.required],
    FIE: [''],
    DISPLACEMENT_L: ['', Validators.required],
    ASPIRATION_TYPE: [''],
    POWER_HP: ['', Validators.required],
    EMISSION_COMPLIANCE: [''],
    // PARENT_ENGINE: ['', Validators.required],
    VARIANT: ['', Validators.required],
    ENGINE_FAMILY_NO: ['', Validators.required],
    REMARKS: ['', Validators.required],
    MG: ['', Validators.required],
    addiInform: ['']
  })

  constructor(private location: Location, public menuComp: MenuComponent, private service: Services, private appComponent: AppComponent, private fb: FormBuilder,
    private datepipe: DatePipe, private activatedRoute: ActivatedRoute) {
    this.service.lovMasaterList.subscribe((lovMasaterList: any) => {
      this.company = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'COMPANY');
      this.engineVarient = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_VARIANT');
      this.engineApplication = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_APPLICATION');
      this.addiInfo = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ADDITIONAL_INFO');
      this.engineFIE = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_FIE');
      this.engineEmission = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_EMISSION');
      this.engineAspiration = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_ASPIRATION');
      this.engineVolume = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_VOLUME');
      // this.enginePlatform = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_PLATFORM');
    })
    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.REF_ID = params.REF_ID;
      if (this.datavalidate(this.REF_ID) != '') {
        this.getData();
        this.disUpdate = true;
      }
    })
    this.service.loginUserID.subscribe((loginUserID: any) => {
      this.loginUserID = loginUserID;
    })
    this.subscription = this.service.callEngineModel.subscribe((call) => {
      if (call == 'save') {
        this.save();
      }
      else if (call == 'clear') {
        this.clear();
      }
    })
  }

  ngOnInit(): void {
    this.getEngineFamily();
    this.getAllData();
    this.getEngineModelByID();
  }
  clear() {
    this.engineModelForm.patchValue({
      APPLICATION_TYPE: '',
      PLATFORM: '',
      FIE: '',
      ASPIRATION_TYPE: '',
      EMISSION_COMPLIANCE: '',
      ENGINE_FAMILY_NO: '',
      DISPLACEMENT_L: '',
      POWER_HP: '',
      VARIANT: '',
      MG: '',
      addiInform: '',
      REMARKS: ''
    })
  }
  getEngineFamily() {
    let dataObj = { ENGINE_M_REF_ID: '' }
    this.service.invokeService("GetFDHLEngineFamilyDetails", dataObj, this.namespace, true, false)
      .then((res: any) => {
        res.forEach((data: any) => {
          this.ENGINE_FAMILY_NO_Arr.push({ RefNo: data.ENGINE_F_REF_ID, engineFamilyNo: data.ENGINE_FAMILY_NO })
        })
      })
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe()
  }
  back() {
    this.appComponent.routerName('engineModel', 'backBtn');
    this.menuComp.menuHideFun();
    this.location.back();
  }
  engineFamilyNo: string = '';
  dropDisOption: any = [];
  getEngFamilyDetails(e: any) {
    this.dropDisOption = [];
    let dataObj = { ENGINE_F_REF_ID: e.target.value }
    this.service.invokeService("GetFDHLEngineFamilyDetails", dataObj, this.namespace, true, false)
      .then((res: any) => {
        this.engineFamilyNo = res[0].ENGINE_FAMILY_NO
        this.engineModelForm.patchValue({
          ASPIRATION_TYPE: this.datavalidate(res[0].ASPIRATION_TYPE),
          FIE: this.datavalidate(res[0].FIE_USED),
          // PLATFORM: this.datavalidate(res[0].PLATFORM),
          EMISSION_COMPLIANCE: this.datavalidate(res[0].EMISSION_COMPLIANCE)
        })
        this.filterDropOptions(res[0].ENGINE_FAMILY_NO);
        this.getFDHLPlatformsLovByEngineFamily(res[0].ENGINE_FAMILY_NO,res[0].PLATFORM);
      })
  }

  async getFDHLPlatformsLovByEngineFamily(ENGINE_FAMILY_NO:string,PLATFORM:string){
    let obj ={
      ENGINE_FAMILY_NO: ENGINE_FAMILY_NO,
      PLATFORM: PLATFORM
    }
    try {
      await this.service.invokeService("GetFDHLPlatformsLovByEngineFamily", obj, this.namespace, true, false).then((res:any)=>{
        this.enginePlatform = res;
        if(res.length == '1'){
          this.engineModelForm.patchValue({PLATFORM: this.datavalidate(res[0].LOV_ID)})
        } else {
          // this.engineModelForm.patchValue({PLATFORM: ''})
        }
      })
    } catch (error) {
      console.error('Error:', error);
    }
  }

  engineModelById: any = [];
  getData() {
    let dataObj = { ENGINE_M_REF_ID: this.REF_ID }
    this.service.invokeService("GetFDHLEngineModelDetails", dataObj, this.namespace, true, false)
      .then((res: any) => {
        this.ENGINE_MODEL_NO = res[0].ENGINE_MODEL_NO
        this.engineFamilyNo = this.datavalidate(res[0].ENGINE_FAMILY_NO)
        this.engineModelForm.patchValue({
          APPLICATION_TYPE: this.datavalidate(res[0].APPLICATION_TYPE),
          PLATFORM: this.datavalidate(res[0].PLATFORM),
          FIE: this.datavalidate(res[0].FIE),
          DISPLACEMENT_L: this.datavalidate(res[0].DISPLACEMENT_L),
          ASPIRATION_TYPE: this.datavalidate(res[0].ASPIRATION_TYPE),
          POWER_HP: this.datavalidate(res[0].POWER_HP),
          EMISSION_COMPLIANCE: this.datavalidate(res[0].EMISSION_COMPLIANCE),
          // PARENT_ENGINE: this.datavalidate(res[0].PARENT_ENGINE),
          VARIANT: this.datavalidate(res[0].VARIANT),
          MG: this.datavalidate(res[0].COMPANY),
          addiInform: this.datavalidate(res[0].ADDITIONAL_INFO),
          REMARKS: this.datavalidate(res[0].REMARKS)
        })
        let dataObj1 = { ENGINE_FAMILY_NO: res[0].ENGINE_FAMILY_NO }
        this.service.invokeService("GetFDHLEngineFamilyDetailsByNo", dataObj1, this.namespace, true, false)
          .then((res1: any) => {
            this.engineModelForm.patchValue({ ENGINE_FAMILY_NO: this.datavalidate(res1[0].ENGINE_F_REF_ID) })
          })
        this.filterDropOptions(res[0].ENGINE_FAMILY_NO);
        this.getFDHLPlatformsLovByEngineFamily(res[0].ENGINE_FAMILY_NO,res[0].PLATFORM);
      })
  }
  getEngineModelByID() {
    let dataObj = { ENGINE_M_REF_ID: '' }
    this.service.invokeService("GetFDHLEngineModelDetails", dataObj, this.namespace, true, false)
      .then((res: any) => {
        this.engineModelById = res;
      })
  }

  allUniqueStrArr: any = []
  uniquebool: boolean = false;
  addInformUniq: any = [];
  getAllData() {
    let tempArr: any = []
    let arrUniqueObj: any = []
    let dataObj = { ENGINE_F_REF_ID: '' }
    this.service.invokeService("GetFDHLEngineModelDetails", dataObj, this.namespace, true, false)
      .then((res: any) => {
        res.forEach((data: any) => {
          tempArr.push({
            APPLICATION_TYPE: this.datavalidate(data.APPLICATION_TYPE), ENGINE_FAMILY_NO: this.datavalidate(data.ENGINE_FAMILY_NO),
            DISPLACEMENT_L: this.datavalidate(data.DISPLACEMENT_L), POWER_HP: this.datavalidate(Math.round(parseFloat(data.POWER_HP)).toString()),
            MG : this.datavalidate(data.COMPANY), addiInform : this.datavalidate(data.ADDITIONAL_INFO)
          })
          // if(this.datavalidate(this.REF_ID)!==''){
          //   if(data.VARIANT==this.engineModelForm.value.VARIANT && data.ENGINE_FAMILY_NO==this.engineFamilyNo){
          //     tempArr.pop();
          //   }
          // }
        })
        tempArr.forEach((d: any) => {
          arrUniqueObj = []
          Object.values(d).forEach((value) => {
            arrUniqueObj.push(value);
          })
          this.allUniqueStrArr.push(arrUniqueObj.toString())
        });
      })
  }
  uniqueCombination() {
    let arr: any = [];
    let power = this.engineModelForm.controls['POWER_HP'].value;
    arr.push(this.datavalidate(this.engineModelForm.controls['APPLICATION_TYPE'].value))
    arr.push(this.datavalidate(this.engineFamilyNo))
    arr.push(this.datavalidate(this.engineModelForm.controls['DISPLACEMENT_L'].value))
    arr.push(this.datavalidate(Math.round(parseFloat(power)).toString()))
    arr.push(this.datavalidate(this.engineModelForm.controls['MG'].value))
    arr.push(this.datavalidate(this.engineModelForm.controls['addiInform'].value))
    this.uniquebool = this.allUniqueStrArr.includes(arr.toString()) ? true : false;
    // return (this.allUniqueStrArr.includes(arr.toString()) ? true : false)
  }
  filterDropOptions(ENGINE_FAMILY_NO: string) {
    this.addInformUniq =[];
    this.engineModelById.filter((data: any) => {
      if (data.ENGINE_FAMILY_NO == ENGINE_FAMILY_NO) {
        this.dropDisOption.push(data.VARIANT)
        if (this.datavalidate(data.ADDITIONAL_INFO) != '')
          this.addInformUniq.push(data.ADDITIONAL_INFO)
      }
    })
  }
  disDropOption(arg: string) {
    this.engineModelForm.controls['ENGINE_FAMILY_NO'].value == '' ? this.dropDisOption = [] : this.dropDisOption
    if (this.dropDisOption.length == 0) {
      if (this.engineModelForm.controls['ENGINE_FAMILY_NO'].value == '') {
        return (arg != '' ? true : false)
      } else {
        return (arg == 'Parent' ? false : true)
      }
    } else {
      return (this.dropDisOption.includes(arg) ? true : false)
    }
  }
  addInformFunc(arg: string) {
    this.engineModelForm.controls['ENGINE_FAMILY_NO'].value == '' ? this.addInformUniq = [] : this.addInformUniq
    if( this.engineModelForm.controls['ENGINE_FAMILY_NO'].value == ''){
      return true;
    } else {
      return (this.addInformUniq.includes(arg) ? true : false)
    }
  }

  save() {
    this.isSubmitted = true;
    this.call_modal = false;
    let dataObj = {};
    this.uniqueCombination();
    if (this.engineModelForm.invalid) {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { 'text': 'Please Enter All Mandatory Fields', active: this.call_modal };
      }, 0);
      return;
    }
    if (this.uniquebool) {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { 'text': 'Engine Model is already created with same combination', active: this.call_modal };
      }, 0);
      return;
    }
    if (this.datavalidate(this.REF_ID) != '') {
      dataObj = {
        tuple: {
          old: {
            FD_HL_ENGINE_MODEL_M: {
              ENGINE_M_REF_ID: this.datavalidate(this.REF_ID)
            }
          },
          new: {
            FD_HL_ENGINE_MODEL_M: {
              'APPLICATION_TYPE': this.datavalidate(this.engineModelForm.controls['APPLICATION_TYPE'].value),
              'PLATFORM': this.datavalidate(this.engineModelForm.controls['PLATFORM'].value),
              'FIE': this.datavalidate(this.engineModelForm.controls['FIE'].value),
              'DISPLACEMENT_L': this.datavalidate(this.engineModelForm.controls['DISPLACEMENT_L'].value),
              'ASPIRATION_TYPE': this.datavalidate(this.engineModelForm.controls['ASPIRATION_TYPE'].value),
              'POWER_HP': this.datavalidate(this.engineModelForm.controls['POWER_HP'].value),
              'EMISSION_COMPLIANCE': this.datavalidate(this.engineModelForm.controls['EMISSION_COMPLIANCE'].value),
              // 'PARENT_ENGINE': this.datavalidate(this.engineModelForm.controls['PARENT_ENGINE'].value),
              'VARIANT': this.datavalidate(this.engineModelForm.controls['VARIANT'].value),
              'ENGINE_FAMILY_NO': this.datavalidate(this.engineFamilyNo),
              'MODIFIED_BY': this.loginUserID,
              'MODIFIED_DATE': this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
              'ENGINE_MODEL_NO': this.ENGINE_MODEL_NO,
              'COMPANY': this.datavalidate(this.engineModelForm.controls['MG'].value),
              'ADDITIONAL_INFO': this.datavalidate(this.engineModelForm.controls['addiInform'].value),
              'REMARKS': this.datavalidate(this.engineModelForm.controls['REMARKS'].value)
            }
          }
        }
      }
    }
    else {
      dataObj = {
        tuple: {
          new: {
            FD_HL_ENGINE_MODEL_M: {
              'ENGINE_M_REF_ID': '',
              'APPLICATION_TYPE': this.datavalidate(this.engineModelForm.controls['APPLICATION_TYPE'].value),
              'PLATFORM': this.datavalidate(this.engineModelForm.controls['PLATFORM'].value),
              'FIE': this.datavalidate(this.engineModelForm.controls['FIE'].value),
              'DISPLACEMENT_L': this.datavalidate(this.engineModelForm.controls['DISPLACEMENT_L'].value),
              'ASPIRATION_TYPE': this.datavalidate(this.engineModelForm.controls['ASPIRATION_TYPE'].value),
              'POWER_HP': this.datavalidate(this.engineModelForm.controls['POWER_HP'].value),
              'EMISSION_COMPLIANCE': this.datavalidate(this.engineModelForm.controls['EMISSION_COMPLIANCE'].value),
              // 'PARENT_ENGINE': this.datavalidate(this.engineModelForm.controls['PARENT_ENGINE'].value),
              'VARIANT': this.datavalidate(this.engineModelForm.controls['VARIANT'].value),
              'ENGINE_FAMILY_NO': this.datavalidate(this.engineFamilyNo),
              'CREATED_BY': this.loginUserID,
              'CREATION_DATE': this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
              'COMPANY': this.datavalidate(this.engineModelForm.controls['MG'].value),
              'ADDITIONAL_INFO': this.datavalidate(this.engineModelForm.controls['addiInform'].value),
              'REMARKS': this.datavalidate(this.engineModelForm.controls['REMARKS'].value)
            }
          }
        }
      }
    }
    this.service.spinner.next(true);
    this.service.invokeService("UpdateFdHlEngineModelM", dataObj, this.namespace, true, false)
      .then((res: any) => {
        this.service.spinner.next(false);
        this.REF_ID = res[0].ENGINE_M_REF_ID
        this.ENGINE_MODEL_NO = res[0].ENGINE_MODEL_NO
        // alert('data inserted');
        let dObj = { ENGINE_M_REF_ID: this.REF_ID }
        this.service.invokeService("SendFD_HLEngineModelCustomMail", dObj, this.namespace, true, false)
          .then((res: any) => {

          })
        this.call_modal = true;
        let obj: any = { 'text': `New Engine Model Created Succesfully`, 'text1': `Model Name`, 'text2': `${res[0].ENGINE_MODEL_NO}`, active: this.call_modal, from: 'modelSave' };
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
