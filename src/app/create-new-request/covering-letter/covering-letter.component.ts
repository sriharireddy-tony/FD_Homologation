import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Services } from 'src/app/services/services';
declare var $: any

@Component({
  selector: 'app-covering-letter',
  templateUrl: './covering-letter.component.html',
  styleUrls: ['./covering-letter.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class CoveringLetterComponent implements OnInit, OnChanges, AfterViewInit {
  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";

  obj1: string = ''
  @Input() HR_REF_NO: any;
  @Input() clarificationType: any;
  @Output() dataEvent = new EventEmitter<string>();

  locationArr: any = [];
  address: string = ''
  engineVarient: any = []
  regards: string = '';
  subscription: Subscription | undefined;
  messageService: any;
  call_modal = false;
  data_send: any = {}
  HR_REF_NO1: string = '';
  openAs: boolean = false;
  isSave: string = '';
  CL_REF_NO: string = '';
  TO: string = '';
  // coveringDate: string = '';
  CL_CONTENT: string = '';
  getCoverData: any = [];
  encolosureArr = [{ ENCLOSURE: '', CL_ENC_REF_NO: '' }]
  isSubmitted: boolean = false;
  checkValidData: any = {
    CL_TO: '',
    CL_CONTENT: '',
    CL_REGARDS: '',
    enclosureArr: [],
    Date: ''
  }
  dis2: boolean = false;

  constructor(private service: Services, private datepipe: DatePipe, private confirmationService: ConfirmationService) {
    this.service.OpenAs.subscribe((call1) => {
      this.openAs = call1;
    })
    this.service.HR_REF_NO.subscribe((call) => {
      this.HR_REF_NO1 = call.HR_REF_NO
    })
    this.service.createPageEvents.subscribe((call1) => {
      this.isSave = call1;
    })
    this.service.callTable4G.subscribe((call: any) => {
      if (this.datavalidate(call) == 'covering') {
        this.isSubmitted = true;
      }
    })
    this.getLocation();
    this.service.lovMasaterList.subscribe((lovMasaterList: any) => {
      this.engineVarient = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_VARIANT');
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (let propName in changes) {
      if (propName == 'clarificationType') {
        let chng = changes[propName];
        this.clarificationType = chng.currentValue;
      }
      if (propName == 'HR_REF_NO') {
        let chng = changes[propName];
        this.HR_REF_NO = chng.currentValue;
        if (this.datavalidate(this.HR_REF_NO) != '') {
          setTimeout(() => {
            this.getFDHLCLEnClosureDetails();
            this.getFDHLCoveringLetterDetails();
          }, 1500)
        }
      }
    }
  }

  ngOnInit(): void {
    this.dataEvent.emit(this.checkValidData);

    this.service.HR_REF_NO.subscribe((obj: any) => {
      this.actStage = this.datavalidate(obj.actStage)
      let routerName = window.location.href.split('/')[window.location.href.split('/').length - 1];
      if (routerName.includes('?')) {
        this.OpenAs = routerName.split('?')[1].split('&')[1].split('=')[1]
        if (this.OpenAs == 'customInboxTask' && this.actStage == '2' || this.OpenAs == 'completed' || this.OpenAs == 'dashboard') {
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

  regardsArr: any[] = [{ data: '' }, { data: '' }, { data: '' }, { data: '' }, { data: '' }];
  regardsDropArr: any = [];
  regardsResponseArr: any = []
  OpenAs: string = '';
  actStage: string = '';


  clear() {
    this.encolosureArr.forEach((obj: any) => {
      obj.ENCLOSURE = null;
    })
    this.TO = '';
    // this.coveringDate = '';
    this.CL_CONTENT = '';
    // let ev = {target:{value:''}}
    // this.selectRegards(ev);
    this.regardsArr = [{ data: '' }, { data: '' }, { data: '' }, { data: '' }, { data: '' }];
    this.address = '';
    this.regards = '';
  }
  clearSave() {
    this.call_modal = false;
    Promise.all([this.updateFdHlClEnclosure(), this.updateFdHlCoveringLetter()]).then((res) => {
      this.call_modal = true;
      this.data_send = { text: 'Covering Letter data saved successfully', active: this.call_modal };
    })
  }
  addEnclosure() {
    this.encolosureArr.push({ ENCLOSURE: '', CL_ENC_REF_NO: '' })
  }
  deleteEnclosure(obj: any) {
    this.call_modal = false;
    if (obj.CL_ENC_REF_NO != '') {
      this.confirmationService.confirm({
        message: 'Are you sure that you want to delete enclosure?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          let dataObj = {
            tuple: {
              old: {
                FD_HL_CL_ENCLOSURE: {
                  CL_ENC_REF_NO: obj.CL_ENC_REF_NO,
                }
              }
            }
          }
          this.service.invokeService("UpdateFdHlClEnclosure", dataObj, this.namespace, true, false).
            then((ajaxResponse: any) => {
              this.encolosureArr.splice(this.encolosureArr.indexOf(obj), 1)
              // this.call_modal = true;
              // this.data_send = { text: 'Record deleted successfully', active: this.call_modal};
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
      this.encolosureArr.splice(this.encolosureArr.indexOf(obj), 1)
    }
  }
  updateFdHlClEnclosure() {
    return new Promise((resolve, reject) => {
      let ParamTuple: {}[] = [];
      var params = {};
      for (var obj of this.encolosureArr) {
        if (this.datavalidate(obj.CL_ENC_REF_NO) == "") {
          params = {
            'new': {
              'FD_HL_CL_ENCLOSURE': {
                'HR_REF_NO': this.HR_REF_NO1,
                'ENCLOSURE': this.datavalidate(obj.ENCLOSURE),
              }
            }
          };
        }
        else {
          params = {
            'old': {
              'FD_HL_CL_ENCLOSURE': {
                'CL_ENC_REF_NO': obj.CL_ENC_REF_NO
              }
            },
            'new': {
              'FD_HL_CL_ENCLOSURE': {
                'HR_REF_NO': this.HR_REF_NO1,
                'ENCLOSURE': this.datavalidate(obj.ENCLOSURE),
              }
            }
          }
        }
        ParamTuple.push(params);
      }
      var paramsAll = { 'tuple': ParamTuple };
      this.service.invokeService("UpdateFdHlClEnclosure", paramsAll, this.namespace, true, false)
        .then((res: any) => {
          this.encolosureArr = res;
          resolve('Res success from enclosure');
        }).catch((e) => {
          reject(e);
        });
    })
  }
  async getFDHLCLEnClosureDetails() {
    var param = { HR_REF_NO: this.datavalidate(this.HR_REF_NO) };
    await this.service.invokeService("GetFDHLCLEnClosureDetails", param, this.namespace, true, false)
      .then((res: any) => {
        this.encolosureArr = res;
        this.checkValidData = {
          CL_TO: this.datavalidate(this.TO),
          CL_CONTENT: this.CL_CONTENT,
          CL_REGARDS: this.regards,
          enclosureArr: this.encolosureArr,
          // Date: this.coveringDate
        }
        this.dataEvent.emit(this.checkValidData);
      })
  }

  getLocation() {
    this.service.invokeService("GetFD_HLAddressDetails", null, this.namespace, true, false)
      .then((res: any) => {
        res.filter((obj: any) => {
          if (obj.ADDR_TYPE == 'TO') {
            this.locationArr.push({ ADDRESS: obj.ADDRESS, ADDR_NAME: obj.ADDR_NAME, })
          }
        })
      })
  }

  selectLocation(e: any) {
    this.checkValidData = {
      CL_TO: this.datavalidate(this.TO),
      CL_CONTENT: this.CL_CONTENT,
      CL_REGARDS: this.regards,
      enclosureArr: this.encolosureArr,
      // Date: this.coveringDate
    }
    this.dataEvent.emit(this.checkValidData);
    this.locationArr.filter((d: any) => {
      if (d.ADDR_NAME == e.target.value) {
        this.address = d.ADDRESS
      }
    });
  }
  dataSend() {
    this.checkValidData = {
      CL_TO: this.datavalidate(this.TO),
      CL_CONTENT: this.CL_CONTENT,
      CL_REGARDS: this.regards,
      enclosureArr: this.encolosureArr,
      // Date: this.coveringDate
    }
    this.dataEvent.emit(this.checkValidData);
  }
  
  updateFdHlCoveringLetter() {
    return new Promise((resolve, reject) => {
      let dataObj = {};
      if (this.datavalidate(this.CL_REF_NO) != '') {
        dataObj = {
          tuple: {
            old: {
              FD_HL_COVERING_LETTER: {
                CL_REF_NO: this.CL_REF_NO
              }
            },
            new: {
              FD_HL_COVERING_LETTER: {
                'CL_TO': this.datavalidate(this.TO),
                'CL_ADDRESS': this.datavalidate(this.address),
                // 'CL_DATE': this.service.dateFilter(this.coveringDate),
                'CERTIFICATION_TYPE': this.datavalidate(this.clarificationType),
                'CL_CONTENT': this.CL_CONTENT,
              }
            }
          }
        }
      }
      else {
        dataObj = {
          tuple: {
            new: {
              FD_HL_COVERING_LETTER: {
                'HR_REF_NO': this.datavalidate(this.HR_REF_NO),
                'CL_TO': this.datavalidate(this.TO),
                'CL_ADDRESS': this.datavalidate(this.address),
                // 'CL_DATE': this.service.dateFilter(this.coveringDate),
                'CERTIFICATION_TYPE': this.datavalidate(this.clarificationType),
                'CL_CONTENT': this.CL_CONTENT,
              }
            }
          }
        }
      }
      this.service.invokeService("UpdateFdHlCoveringLetter", dataObj, this.namespace, true, false)
        .then((res: any) => {
          this.CL_REF_NO = res[0].CL_REF_NO
          resolve('Res success from covering');
        }).catch((e) => {
          reject(e);
        });
    })
  }
  async getFDHLCoveringLetterDetails() {
    this.regardsArr = []
    let param = {
      HR_REF_NO: this.HR_REF_NO
    }
    await this.service.invokeService("GetFDHLCoveringLetterDetails", param, this.namespace, true, false)
      .then((res: any) => {
        // let obj={target :{value:res[0].CL_REGARDS}}
        this.getCoverData = res[0]
        this.CL_REF_NO = res[0].CL_REF_NO
        this.TO = this.datavalidate(res[0].CL_TO)
        // this.coveringDate = this.datavalidate(this.datepipe.transform(res[0].CL_DATE, 'dd-MM-yyyy'))
        this.CL_CONTENT = res[0].CL_CONTENT
        this.address = res[0].CL_ADDRESS
        this.checkValidData = {
          CL_TO: this.datavalidate(this.TO),
          CL_CONTENT: this.CL_CONTENT,
          CL_REGARDS: this.regards,
          enclosureArr: this.encolosureArr,
          // Date: this.coveringDate
        }
        this.dataEvent.emit(this.checkValidData);
      })
  }

  datavalidate(data: string | null | undefined) {
    if (data != undefined && data != null && data != "") {
      return data;
    } else {
      return "";
    }
  }
}
