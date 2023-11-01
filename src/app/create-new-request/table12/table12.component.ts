import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Services } from 'src/app/services/services';
declare var $: any

@Component({
  selector: 'app-table12',
  templateUrl: './table12.component.html',
  styleUrls: ['./table12.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class Table12Component implements OnInit, OnDestroy {
  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";

  // @Input() engineVariantStr: any;
  @Input() nameArrStr: any;
  @Input() HR_REF_NO: any;
  @Output() dataEvent = new EventEmitter<string>();
  manufacture: string = '';
  modelName: string = '';
  manufactureArr: any = [];
  CMVRDate: string = ''
  TAB12_REF_NO: string = ''
  engineVarient: any = []
  call_modal: boolean = false;
  data_send = {}
  form:any = {
    MANUFACTURER: '',
    MODEL_VARIANTS: '',
    CMVR_CERTIFICATE_NO: '',
    CMVR_CERTIFICATE_DATE: '',
    SPECIFICATION_NO: '',
    EXTENSION_DATE: '',
    EXTENSION_SPEC_REV: '',
    NATURE_OF_CHANGE: ''
  }
  isSave: string = '';
  openAs: boolean = false;
  subscription: Subscription | undefined;
  isSubmitted: boolean = false;
  actStage: string = '';
  specificationArr = [{ ENGINE_MODEL_NAME: '', SPEC_NO: '', DESCRIPTION: '', PARAMETER_EARLIER: '', PARAMETER_NEW_EXTENSION: '', TAB12_SC_REF_NO: '' }];
  dis2: boolean = false;
  checkValidData: any = {
    MANUFACTURER: '',
    CMVR_CERTIFICATE_NO: '',
    CMVR_CERTIFICATE_DATE: '',
    SPECIFICATION_NO: '',
    EXTENSION_DATE: '',
    EXTENSION_SPEC_REV: '',
    NATURE_OF_CHANGE: '',
    specArr: []
  }

  constructor(private service: Services, private datepipe: DatePipe, private confirmationService: ConfirmationService) {
    this.service.lovMasaterList.subscribe((lovMasaterList: any) => {
      this.engineVarient = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_VARIANT');
    })
    this.service.OpenAs.subscribe((call1) => {
      this.openAs = call1;
    })
    this.service.createPageEvents.subscribe((call1) => {
      this.isSave = call1;
    })
    this.subscription = this.service.callTable4G.subscribe((call: any) => {
      if (this.datavalidate(call) == 'table12') {
        this.isSubmitted = true;
        this.updateFdHlTab12SpecChanges();
        this.updateFdHlTable12();
      }
    })
  }
  ngOnChanges(changes: SimpleChanges): void {
    for (let propName in changes) {
      // if (propName == 'engineVariantStr') {
      //   let chng = changes[propName];
      //   this.engineVariantStr = chng.currentValue;
      // }
      if (propName == 'nameArrStr') {
        let chng = changes[propName];
        this.nameArrStr = chng.currentValue;
        this.form.MODEL_VARIANTS = this.nameArrStr
      }
      if (propName == 'HR_REF_NO') {
        let chng = changes[propName];
        this.HR_REF_NO = chng.currentValue;
        if (this.datavalidate(this.HR_REF_NO) != '') {
          this.getData();
        }
      }
    }
  }

  ngOnInit(): void {
    this.getmanufacureData();
    this.getFDHLRequestVariantDetails();

    this.dataEvent.emit(this.checkValidData);

    this.service.HR_REF_NO.subscribe((obj: any) => {
      this.actStage = this.datavalidate(obj.actStage)
      let routerName = window.location.href.split('/')[window.location.href.split('/').length - 1];
      if (routerName.includes('?')) {
        let OpenAs = routerName.split('?')[1].split('&')[1].split('=')[1]
        if (OpenAs == 'customInboxTask' && this.actStage == '2' || OpenAs == 'completed' || OpenAs == 'dashboard') {
          this.dis2 = true;
        }
        else {
          this.dis2 = false;
        }
      }
    })
  }
  ngAfterViewInit() {

  }
  ngOnDestroy() {
    this.subscription?.unsubscribe()
  }
  clear() {
    this.specificationArr.forEach((obj: any) => {
      obj.ENGINE_MODEL_NAME = null
      obj.SPEC_NO = null
      obj.DESCRIPTION = null
      obj.PARAMETER_EARLIER = null
      obj.PARAMETER_NEW_EXTENSION = null
    })
    this.form = {
      MANUFACTURER: '',
      MODEL_VARIANTS: '',
      CMVR_CERTIFICATE_NO: '',
      CMVR_CERTIFICATE_DATE: '',
      SPECIFICATION_NO: '',
      EXTENSION_DATE: '',
      EXTENSION_SPEC_REV: '',
      NATURE_OF_CHANGE: ''
    }
    this.manufacture = '';
  }
  clearSave() {
    this.call_modal = false;
    Promise.all([this.updateFdHlTable12(), this.updateFdHlTab12SpecChanges()]).then((res) => {
      this.call_modal = true;
      this.data_send = { text: 'Table12 data saved successfully', active: this.call_modal };
    })
  }
  selectManufacture(e: any) {
    this.checkValidData = {
      MANUFACTURER: this.manufacture,
      CMVR_CERTIFICATE_NO: this.form.CMVR_CERTIFICATE_NO,
      CMVR_CERTIFICATE_DATE: this.form.CMVR_CERTIFICATE_DATE,
      SPECIFICATION_NO: this.form.SPECIFICATION_NO,
      EXTENSION_DATE: this.form.EXTENSION_DATE,
      EXTENSION_SPEC_REV: this.form.EXTENSION_SPEC_REV,
      NATURE_OF_CHANGE: this.form.NATURE_OF_CHANGE,
      specArr: this.specificationArr
    }
    this.dataEvent.emit(this.checkValidData);
    this.manufactureArr.filter((data: any) => {
      if (data.ADDR_NAME == e.target.value) {
        this.form.MANUFACTURER = data.ADDRESS
      }
    })
  }
  dataSend() {
    this.checkValidData = {
      MANUFACTURER: this.manufacture,
      CMVR_CERTIFICATE_NO: this.form.CMVR_CERTIFICATE_NO,
      CMVR_CERTIFICATE_DATE: this.form.CMVR_CERTIFICATE_DATE,
      SPECIFICATION_NO: this.form.SPECIFICATION_NO,
      EXTENSION_DATE: this.form.EXTENSION_DATE,
      EXTENSION_SPEC_REV: this.form.EXTENSION_SPEC_REV,
      NATURE_OF_CHANGE: this.form.NATURE_OF_CHANGE,
      specArr: this.specificationArr
    }
    this.dataEvent.emit(this.checkValidData);
  }
  addSpecifications() {
    this.specificationArr.push({ ENGINE_MODEL_NAME: '', SPEC_NO: '', DESCRIPTION: '', PARAMETER_EARLIER: '', PARAMETER_NEW_EXTENSION: '', TAB12_SC_REF_NO: '' })
  }
  updateFdHlTab12SpecChanges() {
    return new Promise((resolve, reject) => {
      let ParamTuple: {}[] = [];
      var params = {};
      for (var obj of this.specificationArr) {
        if (this.datavalidate(obj.TAB12_SC_REF_NO) == "") {
          params = {
            'new': {
              'FD_HL_TAB12_SPEC_CHANGES': {
                'TAB12_SC_REF_NO': '',
                'HR_REF_NO': this.HR_REF_NO,
                'ENGINE_MODEL_NAME': obj.ENGINE_MODEL_NAME,
                'SPEC_NO': obj.SPEC_NO,
                'DESCRIPTION': obj.DESCRIPTION,
                'PARAMETER_EARLIER': obj.PARAMETER_EARLIER,
                'PARAMETER_NEW_EXTENSION': obj.PARAMETER_NEW_EXTENSION
              }
            }
          };
        }
        else {
          params = {
            'old': {
              'FD_HL_TAB12_SPEC_CHANGES': {
                'TAB12_SC_REF_NO': obj.TAB12_SC_REF_NO
              }
            },
            'new': {
              'FD_HL_TAB12_SPEC_CHANGES': {
                'HR_REF_NO': this.HR_REF_NO,
                'ENGINE_MODEL_NAME': obj.ENGINE_MODEL_NAME,
                'SPEC_NO': obj.SPEC_NO,
                'DESCRIPTION': obj.DESCRIPTION,
                'PARAMETER_EARLIER': obj.PARAMETER_EARLIER,
                'PARAMETER_NEW_EXTENSION': obj.PARAMETER_NEW_EXTENSION
              }
            }
          }
        }
        ParamTuple.push(params);
      }
      var paramsAll = { 'tuple': ParamTuple };
      this.service.invokeService("UpdateFdHlTab12SpecChanges", paramsAll, this.namespace, true, false)
        .then((res: any) => {
          this.specificationArr = res;
          resolve('Res success from table12spec');
        }).catch((e) => {
          reject(e);
        });;
    })
  }
  updateFdHlTable12() {
    return new Promise((resolve, reject) => {
      let param = {};
      if (this.datavalidate(this.TAB12_REF_NO) == "") {
        param = {
          'tuple': {
            'new': {
              'FD_HL_TABLE12': {
                'TAB12_REF_NO': '',
                'HR_REF_NO': this.HR_REF_NO,
                'MANUFACTURER': this.manufacture,
                'MODEL_VARIANTS': this.form.MODEL_VARIANTS,
                'CLAUSE_NO': 3.1,
                'CMVR_CERTIFICATE_NO': this.form.CMVR_CERTIFICATE_NO,
                'CMVR_CERTIFICATE_DATE': this.service.dateFilter(this.form.CMVR_CERTIFICATE_DATE),
                'SPECIFICATION_NO': this.form.SPECIFICATION_NO,
                'EXTENSION_DATE': this.service.dateFilter(this.form.EXTENSION_DATE),
                'EXTENSION_SPEC_REV': this.form.EXTENSION_SPEC_REV,
                'NATURE_OF_CHANGE': this.form.NATURE_OF_CHANGE
              }
            }
          }
        };
      }
      else {
        param = {
          'tuple': {
            'old': {
              'FD_HL_TABLE12': {
                'TAB12_REF_NO': this.TAB12_REF_NO
              }
            },
            'new': {
              'FD_HL_TABLE12': {
                'HR_REF_NO': this.HR_REF_NO,
                'MANUFACTURER': this.manufacture,
                'MODEL_VARIANTS': this.form.MODEL_VARIANTS,
                'CLAUSE_NO': 3.1,
                'CMVR_CERTIFICATE_NO': this.form.CMVR_CERTIFICATE_NO,
                'CMVR_CERTIFICATE_DATE': this.service.dateFilter(this.form.CMVR_CERTIFICATE_DATE),
                'SPECIFICATION_NO': this.form.SPECIFICATION_NO,
                'EXTENSION_DATE': this.service.dateFilter(this.form.EXTENSION_DATE),
                'EXTENSION_SPEC_REV': this.form.EXTENSION_SPEC_REV,
                'NATURE_OF_CHANGE': this.form.NATURE_OF_CHANGE
              }
            }
          }
        }
      }

      this.service.invokeService("UpdateFdHlTable12", param, this.namespace, true, false)
        .then((res: any) => {
          this.TAB12_REF_NO = res[0].TAB12_REF_NO
          resolve('Res success from table12');
        }).catch((e) => {
          reject(e);
        });
    })
  }

  getmanufacureData() {
    this.service.invokeService("GetFD_HLAddressDetails", null, this.namespace, true, false)
      .then((res: any) => {
        res.filter((obj: any) => {
          if (obj.ADDR_TYPE == 'MANUFACTURER') {
            this.manufactureArr.push({ ADDRESS: obj.ADDRESS, ADDR_NAME: obj.ADDR_NAME, })
          }
        })
      })
  }
  async getData() {
    setTimeout(async () => {
      var param = { HR_REF_NO: this.HR_REF_NO };
      await this.service.invokeService("GetFDHLTable12Details", param, this.namespace, true, false)
        .then((res: any) => {
          this.TAB12_REF_NO = res[0]?.TAB12_REF_NO
          this.form = {
            MANUFACTURER: '',
            MODEL_VARIANTS: res[0].MODEL_VARIANTS,
            CMVR_CERTIFICATE_NO: res[0].CMVR_CERTIFICATE_NO,
            CMVR_CERTIFICATE_DATE: this.datavalidate(this.datepipe.transform(res[0].CMVR_CERTIFICATE_DATE, 'dd-MM-yyyy')),
            SPECIFICATION_NO: res[0].SPECIFICATION_NO,
            EXTENSION_DATE: this.datavalidate(this.datepipe.transform(res[0].EXTENSION_DATE, 'dd-MM-yyyy')),
            EXTENSION_SPEC_REV: res[0].EXTENSION_SPEC_REV,
            NATURE_OF_CHANGE: res[0].NATURE_OF_CHANGE
          }
          this.manufacture = this.datavalidate(res[0].MANUFACTURER)
          let obj = { target: { value: res[0].MANUFACTURER } }
          this.selectManufacture(obj);
        })
      this.service.invokeService("GetFDHLTable12SpecChangesDetails", param, this.namespace, true, false)
        .then((res: any) => {
          this.specificationArr = res;
          this.checkValidData = {
            MANUFACTURER: this.manufacture,
            CMVR_CERTIFICATE_NO: this.form.CMVR_CERTIFICATE_NO,
            CMVR_CERTIFICATE_DATE: this.form.CMVR_CERTIFICATE_DATE,
            SPECIFICATION_NO: this.form.SPECIFICATION_NO,
            EXTENSION_DATE: this.form.EXTENSION_DATE,
            EXTENSION_SPEC_REV: this.form.EXTENSION_SPEC_REV,
            NATURE_OF_CHANGE: this.form.NATURE_OF_CHANGE,
            specArr: this.specificationArr
          }
          this.dataEvent.emit(this.checkValidData);
        })
    }, 200);
  }

  async getFDHLRequestVariantDetails() {
    var param = { HR_REF_NO: this.HR_REF_NO };
    let VariantNameArr: any = [];
    let VariantIDArr: any = [];
    await this.service.invokeService("GetFDHLRequestVariantDetails", param, this.namespace, true, false)
      .then((res: any) => {
        this.engineVarient.filter((d: any) => {
          res.forEach((d1: any) => {
            if (d.LOV_ID == d1.VARIANT) {
              VariantNameArr.push(d.LOV_DESC)
              VariantIDArr.push(d.LOV_ID)
            }
          })
        })
        // this.form.MODEL_VARIANTS=VariantNameArr.toString();
        // this.engineVariantStr=VariantIDArr.toString();
      })
  }
  deleteSpecification(obj: any) {
    this.call_modal = false;
    if (obj.TAB12_SC_REF_NO != '') {
      this.confirmationService.confirm({
        message: 'Are you sure that you want to delele this?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          let dataObj = {
            tuple: {
              old: {
                FD_HL_TAB12_SPEC_CHANGES: {
                  TAB12_SC_REF_NO: obj.TAB12_SC_REF_NO,
                }
              }
            }
          }
          this.service.invokeService("UpdateFdHlTab12SpecChanges", dataObj, this.namespace, true, false).
            then((ajaxResponse: any) => {
              this.specificationArr.splice(this.specificationArr.indexOf(obj), 1)
            })
        },
        reject: (type: any) => {
          switch (type) {
            case ConfirmEventType.REJECT:
              break;
            case ConfirmEventType.CANCEL:
              break;
          }
        }
      });
    } else {
      this.specificationArr.splice(this.specificationArr.indexOf(obj), 1)
    }
  }
  datavalidate(data: string | null | undefined) {
    if (data != undefined && data != null && data != "") {
      return data;
    } else {
      return "";
    }
  }
}
