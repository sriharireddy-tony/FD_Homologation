import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit, Output, OnDestroy, SimpleChanges, DoCheck, EventEmitter, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription, take } from 'rxjs';
import { Services } from 'src/app/services/services';
declare var $: any

@Component({
  selector: 'app-chapter2',
  templateUrl: './chapter2.component.html',
  styleUrls: ['./chapter2.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class Chapter2Component implements OnInit {
  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";

  @Input() table4gVar: any;
  @Input() variantsArr1: any;
  @Input() HRV_REF_NOArr: any;
  @Input() HR_REF_NO: any;
  // HR_REF_NO: string = '';
  Table12Arr: any;
  ATTR_VALUE0: string = ''
  loginUserID: string = '';
  subscription: Subscription | undefined;
  submitted: boolean = false;
  isSave: string = '';
  openAs: boolean = false;
  call_modal: boolean = false;
  data_send: any = {};

  modeArr = [{ theader1: 'Engine Speed Rpm', theader2: 'Gross Power KW**', innerArr: [{ speed: '', power: '' }] },
  { theader1: 'Engine Speed Rpm', theader2: 'Gross Power KW**', innerArr: [{ speed: '', power: '' }] },
  { theader1: 'Engine Speed Rpm', theader2: 'Gross Power KW**', innerArr: [{ speed: '', power: '' }] }]

  // measurmentArr = [{ HRMM_REF_NO: '', Speed: '', Power: '' }, { HRMM_REF_NO: '', Speed: '', Power: '' }]

  constructor(private service: Services, private datepipe: DatePipe, private confirmationService: ConfirmationService) {
    
    this.service.OpenAs.subscribe((call1) => {
      this.openAs = call1;
    })
    this.service.loginUserID.subscribe((loginUserID: any) => {
      this.loginUserID = loginUserID;
    })
    this.subscription = this.service.callTable4G.subscribe((call: any) => {
      this.service.createPageEvents.subscribe((call1) => {
        this.isSave = call1;
      })
      if (this.datavalidate(call) == 'chapter2') {
        this.save();
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (let propName in changes) {
      if (propName == 'HR_REF_NO') {
        let chng = changes[propName];
        this.HR_REF_NO = chng.currentValue;
        // this.getFdHlRequestManagement();
      }
      if (propName == 'HRV_REF_NOArr') {
        this.HRV_REF_NOArr = [];
        let chng = changes[propName];
        this.HRV_REF_NOArr = chng.currentValue;
      }
      if (propName == 'variantsArr1') {
        this.variantsArr1 = [];
        let chng = changes[propName];
        this.variantsArr1 = chng.currentValue;
        this.getMesurment();
        this.getMode();
      }
    }
  }
  ngOnInit(): void {
    this.getURL();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe()
  }

  chapter2WordDoc: string = '';
  onButtonClick(event: Event, obj1: any) {
    event.stopPropagation();
    let obj = {
      FDHL_DOC_TYPE: 'Chapter 2',
      HR_REF_NO: this.HR_REF_NO,
      HRV_REF_NO: obj1.HRV_REF_NO,
      REPORT_REF_ID: 4
    }
    this.service.invokeService("GenerateFDHlWordDocument", obj, this.namespace, true, false)
      .then((res: any) => {
        this.chapter2WordDoc = res[0].generateFDHlWordDocument;
        this.service.downloadFile("DownloadDocument", res[0].generateFDHlWordDocument, res[0].generateFDHlWordDocument + ";reportpath", "http://schemas.cordys.com/FD_HL_WSPackage", true, false)
      })
  }
  validate() {
    // let HRV_REF_NOArr: any = [...new Set(this.HRV_REF_NOArr)];
    for (let i = 0; i < this.variantsArr1.length; i++) {
      for (var obj of this.variantsArr1[i].Table12Arr1) {
        if (obj.MANDATORY == 'Yes' && (this.datavalidate(obj.ATTR_VALUE) == '' && this.datavalidate(obj.ANNEXURE_PATH) == '')) {
          return true;
        }
      }
      for(let obj1 of this.variantsArr1[i].Measurment){
        if(this.datavalidate(obj1.ENGINE_SPEED) == '' || this.datavalidate(obj1.GROSS_POWER) == ''){
          return true;
        }
      }
    }
    return false;
  }
  modeDelBtnHide(parrent: number, obj: any) {
    if (this.variantsArr1[parrent].Mode.length == 1) {
      return false;
    } else if (this.variantsArr1[parrent].Mode.length - 1 == this.variantsArr1[parrent].Mode.indexOf(obj)) {
      return true;
    }
    return;
  }

  save() {
    return new Promise((resolve, reject) => {
      if (this.isSave == 'submit') {
        this.submitted = true;
        if (this.validate()) {
          return;
        }
      }
      let HRV_REF_NOArr: any = [...new Set(this.HRV_REF_NOArr)];
      let ParamTuple: {}[] = [];
      var params = {};
      // for (let i = 0; i < HRV_REF_NOArr.length; i++) {
        // this.variantsArr1[i].HRV_REF_NO = HRV_REF_NOArr[i]
        for (var obj1 of this.variantsArr1) {
          var flagArr = HRV_REF_NOArr.filter((filter:any)=> filter.VARIANT == obj1.LOV_DESC)
          obj1.HRV_REF_NO = flagArr[0].HRV_REF_NO
          for (var obj of obj1.Table12Arr1){
          if (this.datavalidate(obj.HRM_REF_NO) == "") {
            params = {
              'new': {
                'FD_HL_REQUEST_MANAGMENET': {
                  'HR_REF_NO': this.HR_REF_NO,
                  'REPORT_REF_ID': this.table4gVar[0].REPORT_REF_ID,
                  'REPORT_NAME': this.table4gVar[0].REPORT_NAME,
                  'REPORT_VERSION': this.table4gVar[0].REPORT_VERSION,
                  'ATTR_REF_ID': obj.ATTR_REF_ID,
                  'ATTR_VALUE': obj.ATTR_VALUE,
                  'ANNEXURE_NAME': obj.ANNEXURE_NAME,
                  'ANNEXURE_PATH': obj.ANNEXURE_PATH,
                  'ANNEXURE_EXT': obj.ANNEXURE_EXT,
                  'CREATED_BY': obj.CREATED_BY,
                  'CREATION_DATE': this.datepipe.transform(obj.CREATION_DATE, 'yyyy-MM-dd'),
                  'AUDIT_TYPE': obj.AUDIT_TYPE,
                  'HRV_REF_NO':obj1.HRV_REF_NO
                }
              }
            };
          }
          else {
            params = {
              'old': {
                'FD_HL_REQUEST_MANAGMENET': {
                  'HRM_REF_NO': obj.HRM_REF_NO
                }
              },
              'new': {
                'FD_HL_REQUEST_MANAGMENET': {
                  'HR_REF_NO': this.HR_REF_NO,
                  'REPORT_REF_ID': this.table4gVar[0].REPORT_REF_ID,
                  'REPORT_NAME': this.table4gVar[0].REPORT_NAME,
                  'REPORT_VERSION': this.table4gVar[0].REPORT_VERSION,
                  'ATTR_REF_ID': obj.ATTR_REF_ID,
                  'ATTR_VALUE': obj.ATTR_VALUE,
                  'ANNEXURE_NAME': obj.ANNEXURE_NAME,
                  'ANNEXURE_PATH': obj.ANNEXURE_PATH,
                  'ANNEXURE_EXT': obj.ANNEXURE_EXT,
                  'MODIFIED_BY': this.loginUserID,
                  'MODIFIED_DATE': this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
                  'AUDIT_TYPE': obj.AUDIT_TYPE,
                  'HRV_REF_NO': obj1.HRV_REF_NO
                }
              }
            }
          }
          ParamTuple.push(params);
        }
      }
      var paramsAll = { 'tuple': ParamTuple };
      this.service.invokeService("UpdateFdHlRequestManagmenet", paramsAll, this.namespace, true, false)
        .then((res: any) => {
          this.getData();
          resolve('Res success from chapter2');
        }).catch((e) => {
          reject(e);
        });;
    })
  }

  getData() {
    let params = { HR_REF_NO: this.HR_REF_NO, REPORT_REF_ID: 4 };
    this.service.invokeService("GetFdHlRequestManagement", params, this.namespace, true, false)
      .then((res: any) => {
        this.variantsArr1.forEach((d: any) => {
          d.Table12Arr1 = []
          res.forEach((tData: any) => {
            if (d.HRV_REF_NO == tData.HRV_REF_NO) {
              d.Table12Arr1.push(tData)
            }
          })
        })
      })
  }
  certfile: any;
  // certfileUploadDoc1: any;
  parrentInd: number = 0
  childInd: number = 0;
  certUploadFile(parrent: number, child: number) {
    this.parrentInd = parrent
    this.childInd = child
    $("#certfileUploadDoc1").click();
  }
  certUploadFileDoc1(e: any) {
    this.call_modal = false;
    let fileName = '';
    let fileExt = '';
    this.certfile = e.target.files[0]
    fileName = e.target.files[0].name
    if (parseFloat(e.target.files[0].size) / 1024 / 1024 > 5) {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { text: 'Document Size Limit Exceeded,You have total limit upto 5MB !', active: this.call_modal };
      }, 0);
      return;
    }
    fileExt = e.target.files[0].name.split('.')[1]
    this.service.uploadFile("UploadFDHLDocumnets", this.certfile, ['png', 'jpg', 'jpeg'], this.namespace, false, false)
      .then((resDocPath: any) => {
        this.variantsArr1[this.parrentInd].Table12Arr1[this.childInd].ANNEXURE_NAME = fileName
        this.variantsArr1[this.parrentInd].Table12Arr1[this.childInd].ANNEXURE_PATH = resDocPath
        this.variantsArr1[this.parrentInd].Table12Arr1[this.childInd].ANNEXURE_EXT = fileExt
      })
    // this.certfileUploadDoc1 = ''
    // }
  }
  AAHPopup = 'none';
  imgPathUrl: string = '';
  imagePath: string = '';
  imageName: string = '';
  hearderImg: string = '';
  popOpen(path: string, name: string) {
    this.imagePath = path;
    this.imageName = name;
    this.hearderImg = name.split('.')[0]
    this.AAHPopup = 'block';
    this.imgPathUrl = this.imgURL + path;
    const body: any = document.querySelector("body");
    body.style.overflow = "hidden";
  }
  closeWorkFlowDoc() {
    this.AAHPopup = 'none';
    const body: any = document.querySelector("body");
    body.style.overflow = "auto";
  }
  imgURL: string = '';
  getURL() {
    this.service.invokeService("GetReportURL", null, this.namespace, true, false)
      .then((res: any) => {
        this.imgURL = res[0].getReportURL.split(',')[1]
      })
  }
  deleteImage(parent: number, child: number) {
    if (this.datavalidate(this.variantsArr1[parent].Table12Arr1[child].HRM_REF_NO) == '') {
      this.variantsArr1[parent].Table12Arr1[child].ANNEXURE_NAME = ''
      this.variantsArr1[parent].Table12Arr1[child].ANNEXURE_PATH = ''
      this.variantsArr1[parent].Table12Arr1[child].ANNEXURE_EXT = ''
    } else {
      this.confirmationService.confirm({
        message: 'Are you sure that you want to delete this Image?', header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
        accept: () => {
          let params = {
            'tuple': {
              'old': {
                'FD_HL_REQUEST_MANAGMENET': {
                  'HRM_REF_NO': this.variantsArr1[parent].Table12Arr1[child].HRM_REF_NO
                }
              },
              'new': {
                'FD_HL_REQUEST_MANAGMENET': {
                  'ANNEXURE_NAME': '',
                  'ANNEXURE_PATH': '',
                  'ANNEXURE_EXT': ''
                }
              }
            }
          }
          this.service.invokeService("UpdateFdHlRequestManagmenet", params, this.namespace, true, false)
            .then((res: any) => {
              this.variantsArr1[parent].Table12Arr1[child].ANNEXURE_NAME = ''
              this.variantsArr1[parent].Table12Arr1[child].ANNEXURE_PATH = ''
              this.variantsArr1[parent].Table12Arr1[child].ANNEXURE_EXT = ''
            })
        },
        reject: () => { }
      });
    }
  }
  downloadFile() {
    this.service.downloadFile("DownloadDocument", this.imageName, this.imagePath, this.namespace);
  }
  addMesurment(i: number) {
    this.variantsArr1[i].Measurment.push({ HRMM_REF_NO: '', ENGINE_SPEED: '', GROSS_POWER: '' })
  }
  deleteMesurment(i1: number, i: number) {
    if (this.variantsArr1[i1].Measurment[i].HRMM_REF_NO == '') {
      this.variantsArr1[i1].Measurment.splice(i, 1)
    } else {
      this.confirmationService.confirm({
        message: 'Are you sure that you want to delete measurment?', header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
        accept: () => {
          let dataObj = {
            'tuple': {
              'old': {
                'FD_HL_REQUEST_MEASUREMENTS': {
                  'HRMM_REF_NO': this.variantsArr1[i1].Measurment[i].HRMM_REF_NO
                }
              }
            }
          }
          this.service.invokeService("UpdateFdHlRequestMeasurements", dataObj, this.namespace, true, false)
            .then((res: any) => {
              this.variantsArr1[i1].Measurment.splice(i, 1)
            })
        },
        reject: () => { }
      });
    }
  }
  deleteRow(i1: number, i: number, obj: any) {
    let dataObj = {};
    let ParamTuple: {}[] = [];
    if (obj.HRMD_REF_NO == '') {
      this.variantsArr1[i1].Mode.forEach((obj: any, i2: number) => {
        obj.innerArr.splice(i, 1)
      })
    } else {
      this.variantsArr1[i1].Mode.forEach((obj: any, i2: number) => {
        dataObj = {
          'old': {
            'FD_HL_REQUEST_MODES': {
              'HRMD_REF_NO': obj.innerArr[i].HRMD_REF_NO
            }
          }
        }
        ParamTuple.push(dataObj);
      })
      var paramsAll = { 'tuple': ParamTuple };
      this.confirmationService.confirm({
        message: 'Are you sure that you want to delete Mode row?', header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.service.invokeService("UpdateFdHlRequestModes", paramsAll, this.namespace, true, false)
            .then((res: any) => {
              this.variantsArr1[i1].Mode.forEach((obj: any, i2: number) => {
                obj.innerArr.splice(i, 1)
              })
            })
        },
        reject: () => { }
      });
    }
  }
  addRow(i1: number, i: number) {
    this.variantsArr1[i1].Mode.forEach((obj: any, i: number) => {
      this.variantsArr1[i1].Mode[i].innerArr.push({ ENGINE_SPEED: '', GROSS_POWER: '', HRMD_REF_NO: '' })
    })
  }
  addTable(i1: number) {
    // let length = this.variantsArr[i1].Mode[0].innerArr.length
    let modeArrLength = this.variantsArr1[i1].Mode.length
    this.variantsArr1[i1].Mode.push({ theader1: 'Engine Speed Rpm', theader2: 'Gross Power KW**', innerArr: [] })
    // for(let obj in this.modeArr[0].innerArr.length)
    for (let j = 0; j < this.variantsArr1[i1].Mode[0].innerArr.length; j++) {
      this.variantsArr1[i1].Mode[modeArrLength].innerArr.push({ ENGINE_SPEED: '', GROSS_POWER: '', HRMD_REF_NO: '' })
    }
  }
  deleteTable(i1: number, i: number, obj: any) {
    let dataObj = {};
    let ParamTuple: {}[] = [];
    if (this.variantsArr1[i1].Mode[i].innerArr[0].HRMD_REF_NO == '') {
      this.variantsArr1[i1].Mode.splice(i, 1)
    } else {
      this.variantsArr1[i1].Mode[i].innerArr.forEach((obj: any, i2: number) => {
        dataObj = {
          'old': {
            'FD_HL_REQUEST_MODES': {
              'HRMD_REF_NO': obj.HRMD_REF_NO
            }
          }
        }
        ParamTuple.push(dataObj);
      })
      var paramsAll = { 'tuple': ParamTuple };
      this.confirmationService.confirm({
        message: 'Are you sure that you want to delete Mode?', header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.service.invokeService("UpdateFdHlRequestModes", paramsAll, this.namespace, true, false)
            .then((res: any) => {
              this.variantsArr1[i1].Mode.splice(i, 1)
            })
        },
        reject: () => { }
      });
    }
  }
  saveMeasurment() {
    let dataObj = {}
    let ParamTuple: {}[] = [];
    for (let i = 0; i < this.variantsArr1.length; i++) {
      for (var obj of this.variantsArr1[i].Measurment) {
        if (this.datavalidate(obj.HRMM_REF_NO) == '') {
          dataObj = {
            'new': {
              'FD_HL_REQUEST_MEASUREMENTS': {
                'HR_REF_NO': this.HR_REF_NO,
                'REPORT_REF_ID': 4,
                'REPORT_NAME': 'Chapter2',
                'ENGINE_SPEED': obj.ENGINE_SPEED,
                'GROSS_POWER': obj.GROSS_POWER,
                'HRV_REF_NO': this.variantsArr1[i].HRV_REF_NO
              }
            }
          };
        } else {
          dataObj = {
            'old': {
              'FD_HL_REQUEST_MEASUREMENTS': {
                'HRMM_REF_NO': obj.HRMM_REF_NO
              }
            },
            'new': {
              'FD_HL_REQUEST_MEASUREMENTS': {
                'HR_REF_NO': this.HR_REF_NO,
                'REPORT_REF_ID': 4,
                'REPORT_NAME': 'Chapter2',
                'ENGINE_SPEED': obj.ENGINE_SPEED,
                'GROSS_POWER': obj.GROSS_POWER,
                'HRV_REF_NO': this.variantsArr1[i].HRV_REF_NO
              }
            }
          }
        }
        ParamTuple.push(dataObj);
      }
    }
    var paramsAll = { 'tuple': ParamTuple };
    this.service.invokeService("UpdateFdHlRequestMeasurements", paramsAll, this.namespace, true, false)
      .then((res: any) => {
        this.getMesurment();
      })
  }
  getMesurment() {
    let obj = {
      HR_REF_NO: this.HR_REF_NO,
      REPORT_REF_ID: 4
    }
    this.service.invokeService("GetFdHlRequestMeasurements", obj, this.namespace, true, false)
      .then((res: any) => {
        if (res.length == 0) {
          this.variantsArr1.forEach((d: any) => {
            d.Measurment = [{ HRMM_REF_NO: '', ENGINE_SPEED: '', GROSS_POWER: '' }]
          })
        } else {
          this.variantsArr1.forEach((d: any) => {
            d.Measurment = [];
            if (d.HRV_REF_NO == '') {
              d.Measurment = [{ HRMM_REF_NO: '', ENGINE_SPEED: '', GROSS_POWER: '' }]
            } else {
              res.forEach((d1: any) => {
                if (d.HRV_REF_NO == d1.HRV_REF_NO) {
                  d.Measurment.push(d1)
                }
              })
            }
          })
        }
        this.variantsArr1.forEach((d: any) => {
          if (d.Measurment.length == 0) {
            d.Measurment = [{ HRMM_REF_NO: '', ENGINE_SPEED: '', GROSS_POWER: '' }]
          }
        })
      })
  }
  getMode() {
    let obj = {
      HR_REF_NO: this.HR_REF_NO,
      REPORT_REF_ID: 4
    }
    this.service.invokeService("GetFdHlRequestModes", obj, this.namespace, true, false)
      .then((res: any) => {
        if (res.length == 0) {
          this.variantsArr1.forEach((d: any) => {
            d.Mode = [{ theader1: 'Engine Speed Rpm', theader2: 'Gross Power KW**', innerArr: [{ ENGINE_SPEED: '', GROSS_POWER: '', HRMD_REF_NO: '' }] },
            { theader1: 'Engine Speed Rpm', theader2: 'Gross Power KW**', innerArr: [{ ENGINE_SPEED: '', GROSS_POWER: '', HRMD_REF_NO: '' }] },
            { theader1: 'Engine Speed Rpm', theader2: 'Gross Power KW**', innerArr: [{ ENGINE_SPEED: '', GROSS_POWER: '', HRMD_REF_NO: '' }] }]
          })
        } else {
          this.variantsArr1.forEach((d: any, i: number) => {
            d.Mode = [];
            if (d.HRV_REF_NO == '') {
              d.Mode = [{ theader1: 'Engine Speed Rpm', theader2: 'Gross Power KW**', innerArr: [{ ENGINE_SPEED: '', GROSS_POWER: '', HRMD_REF_NO: '' }] },
              { theader1: 'Engine Speed Rpm', theader2: 'Gross Power KW**', innerArr: [{ ENGINE_SPEED: '', GROSS_POWER: '', HRMD_REF_NO: '' }] },
              { theader1: 'Engine Speed Rpm', theader2: 'Gross Power KW**', innerArr: [{ ENGINE_SPEED: '', GROSS_POWER: '', HRMD_REF_NO: '' }] }]
            } else {
              res.forEach((d1: any) => {
                if (d.HRV_REF_NO == d1.HRV_REF_NO) {
                  if (this.variantsArr1[i].Mode[d1.MODES - 1] == undefined) {
                    this.variantsArr1[i].Mode[d1.MODES - 1] = { theader1: 'Engine Speed Rpm', theader2: 'Gross Power KW**', innerArr: [] };
                  }
                  this.variantsArr1[i].Mode[d1.MODES - 1].innerArr.push({ ENGINE_SPEED: d1.ENGINE_SPEED, GROSS_POWER: d1.GROSS_POWER, HRMD_REF_NO: d1.HRMD_REF_NO })
                }
              })
            }
          })
        }
        this.variantsArr1.forEach((d: any) => {
          if (d.Mode.length == 0) {
            d.Mode = [{ theader1: 'Engine Speed Rpm', theader2: 'Gross Power KW**', innerArr: [{ ENGINE_SPEED: '', GROSS_POWER: '', HRMD_REF_NO: '' }] },
            { theader1: 'Engine Speed Rpm', theader2: 'Gross Power KW**', innerArr: [{ ENGINE_SPEED: '', GROSS_POWER: '', HRMD_REF_NO: '' }] },
            { theader1: 'Engine Speed Rpm', theader2: 'Gross Power KW**', innerArr: [{ ENGINE_SPEED: '', GROSS_POWER: '', HRMD_REF_NO: '' }] }]
          }
        })
      })
  }
  saveMode() {
    let dataObj = {}
    let ParamTuple: {}[] = [];
    for (let i = 0; i < this.variantsArr1.length; i++) {
      for (var obj of this.variantsArr1[i].Mode) {
        for (var obj1 of obj.innerArr) {
          if (this.datavalidate(obj1.HRMD_REF_NO) == '') {
            dataObj = {
              'new': {
                'FD_HL_REQUEST_MODES': {
                  'HR_REF_NO': this.HR_REF_NO,
                  'REPORT_REF_ID': 4,
                  'REPORT_NAME': 'Chapter2',
                  'ENGINE_SPEED': obj1.ENGINE_SPEED,
                  'GROSS_POWER': obj1.GROSS_POWER,
                  'HRV_REF_NO': this.variantsArr1[i].HRV_REF_NO,
                  'ROW_NO': obj.innerArr.indexOf(obj1) + 1,
                  'MODES': this.variantsArr1[i].Mode.indexOf(obj) + 1
                }
              }
            };
          } else {
            dataObj = {
              'old': {
                'FD_HL_REQUEST_MODES': {
                  'HRMD_REF_NO': obj1.HRMD_REF_NO
                }
              },
              'new': {
                'FD_HL_REQUEST_MODES': {
                  'HR_REF_NO': this.HR_REF_NO,
                  'REPORT_REF_ID': 4,
                  'REPORT_NAME': 'Chapter2',
                  'ENGINE_SPEED': obj1.ENGINE_SPEED,
                  'GROSS_POWER': obj1.GROSS_POWER,
                  'HRV_REF_NO': this.variantsArr1[i].HRV_REF_NO,
                  'ROW_NO': obj.innerArr.indexOf(obj1) + 1,
                  'MODES': this.variantsArr1[i].Mode.indexOf(obj) + 1
                }
              }
            }
          }
          ParamTuple.push(dataObj);
        }
      }
    }
    var paramsAll = { 'tuple': ParamTuple };
    this.service.invokeService("UpdateFdHlRequestModes", paramsAll, this.namespace, true, false)
      .then((res: any) => {
        this.getMode();
      })
  }
  clear(HRV_REF_NO: string, variant: string) {
    // if (HRV_REF_NO == '') {
    this.variantsArr1.forEach((d: any) => {
      if (d.LOV_DESC == variant) {
        d.Table12Arr1.forEach((obj: any) => {
          obj.ATTR_VALUE = null
          obj.ANNEXURE_EXT = null
          obj.ANNEXURE_NAME = null
          obj.ANNEXURE_PATH = null
        })
        d.Measurment.forEach((obj: any) => {
          obj.ENGINE_SPEED = null
          obj.GROSS_POWER = null
        })
        d.Mode.forEach((obj: any) => {
          obj.innerArr.forEach((obj1: any) => {
            obj1.ENGINE_SPEED = null
            obj1.GROSS_POWER = null
          })
        })
      }
    })
  }
  clearSave(obj: any) {
    this.call_modal = false;
    Promise.all([this.clearSaveMesurment(obj), this.clearSaveMode(obj), this.clearSaveChapter2(obj)]).then((d: any) => {
      this.call_modal = true;
      this.data_send = { text: `Chapter2(${obj.LOV_DESC}) data saved successfully`, active: this.call_modal };
    })
  }
  clearSaveChapter2(obj1: any) {
    return new Promise((resolve, reject) => {
      this.submitted = false;
      // let HRV_REF_NOArr: any = [...new Set(this.HRV_REF_NOArr)];
      let ParamTuple: {}[] = [];
      var params = {};
      // for (let i = 0; i < HRV_REF_NOArr.length; i++) {
      //   this.variantsArr1[i].HRV_REF_NO = HRV_REF_NOArr[i]
      for (var obj of obj1.Table12Arr1) {
        if (this.datavalidate(obj.HRM_REF_NO) == "") {
          params = {
            'new': {
              'FD_HL_REQUEST_MANAGMENET': {
                'HR_REF_NO': this.HR_REF_NO,
                'REPORT_REF_ID': this.table4gVar[0].REPORT_REF_ID,
                'REPORT_NAME': this.table4gVar[0].REPORT_NAME,
                'REPORT_VERSION': this.table4gVar[0].REPORT_VERSION,
                'ATTR_REF_ID': obj.ATTR_REF_ID,
                'ATTR_VALUE': obj.ATTR_VALUE,
                'ANNEXURE_NAME': obj.ANNEXURE_NAME,
                'ANNEXURE_PATH': obj.ANNEXURE_PATH,
                'ANNEXURE_EXT': obj.ANNEXURE_EXT,
                'CREATED_BY': obj.CREATED_BY,
                'CREATION_DATE': this.datepipe.transform(obj.CREATION_DATE, 'yyyy-MM-dd'),
                'AUDIT_TYPE': obj.AUDIT_TYPE,
                'HRV_REF_NO': obj1.HRV_REF_NO
              }
            }
          };
        }
        else {
          params = {
            'old': {
              'FD_HL_REQUEST_MANAGMENET': {
                'HRM_REF_NO': obj.HRM_REF_NO
              }
            },
            'new': {
              'FD_HL_REQUEST_MANAGMENET': {
                'HR_REF_NO': this.HR_REF_NO,
                'REPORT_REF_ID': this.table4gVar[0].REPORT_REF_ID,
                'REPORT_NAME': this.table4gVar[0].REPORT_NAME,
                'REPORT_VERSION': this.table4gVar[0].REPORT_VERSION,
                'ATTR_REF_ID': obj.ATTR_REF_ID,
                'ATTR_VALUE': obj.ATTR_VALUE,
                'ANNEXURE_NAME': obj.ANNEXURE_NAME,
                'ANNEXURE_PATH': obj.ANNEXURE_PATH,
                'ANNEXURE_EXT': obj.ANNEXURE_EXT,
                'MODIFIED_BY': this.loginUserID,
                'MODIFIED_DATE': this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
                'AUDIT_TYPE': obj.AUDIT_TYPE,
                'HRV_REF_NO': obj1.HRV_REF_NO
              }
            }
          }
        }
        ParamTuple.push(params);
      }
      // }
      var paramsAll = { 'tuple': ParamTuple };
      this.service.invokeService("UpdateFdHlRequestManagmenet", paramsAll, this.namespace, true, false)
        .then((res: any) => {
          this.getData();
          resolve('Res success from chapter2');
        }).catch((e) => {
          reject(e);
        });;
    })
  }
  clearSaveMode(obj2: any) {
    return new Promise((resolve, reject) => {
      let dataObj = {}
      let ParamTuple: {}[] = [];
      // for (let i = 0; i < this.variantsArr1.length; i++) {
      for (var obj of obj2.Mode) {
        for (var obj1 of obj.innerArr) {
          if (this.datavalidate(obj1.HRMD_REF_NO) == '') {
            dataObj = {
              'new': {
                'FD_HL_REQUEST_MODES': {
                  'HR_REF_NO': this.HR_REF_NO,
                  'REPORT_REF_ID': 4,
                  'REPORT_NAME': 'Chapter2',
                  'ENGINE_SPEED': obj1.ENGINE_SPEED,
                  'GROSS_POWER': obj1.GROSS_POWER,
                  'HRV_REF_NO': obj2.HRV_REF_NO,
                  'ROW_NO': obj.innerArr.indexOf(obj1) + 1,
                  'MODES': obj2.Mode.indexOf(obj) + 1
                }
              }
            };
          } else {
            dataObj = {
              'old': {
                'FD_HL_REQUEST_MODES': {
                  'HRMD_REF_NO': obj1.HRMD_REF_NO
                }
              },
              'new': {
                'FD_HL_REQUEST_MODES': {
                  'HR_REF_NO': this.HR_REF_NO,
                  'REPORT_REF_ID': 4,
                  'REPORT_NAME': 'Chapter2',
                  'ENGINE_SPEED': obj1.ENGINE_SPEED,
                  'GROSS_POWER': obj1.GROSS_POWER,
                  'HRV_REF_NO': obj2.HRV_REF_NO,
                  'ROW_NO': obj.innerArr.indexOf(obj1) + 1,
                  'MODES': obj2.Mode.indexOf(obj) + 1
                }
              }
            }
          }
          ParamTuple.push(dataObj);
        }
      }
      // }
      var paramsAll = { 'tuple': ParamTuple };
      this.service.invokeService("UpdateFdHlRequestModes", paramsAll, this.namespace, true, false)
        .then((res: any) => {
          this.getMode();
          resolve('Res success from table4gmode');
        }).catch((e) => {
          reject(e);
        });
    })
  }
  clearSaveMesurment(obj1: any) {
    return new Promise((resolve, reject) => {
      let dataObj = {}
      let ParamTuple: {}[] = [];
      // for (let i = 0; i < this.variantsArr1.length; i++) {
      for (var obj of obj1.Measurment) {
        if (this.datavalidate(obj.HRMM_REF_NO) == '') {
          dataObj = {
            'new': {
              'FD_HL_REQUEST_MEASUREMENTS': {
                'HR_REF_NO': this.HR_REF_NO,
                'REPORT_REF_ID': 4,
                'REPORT_NAME': 'Chapter2',
                'ENGINE_SPEED': obj.ENGINE_SPEED,
                'GROSS_POWER': obj.GROSS_POWER,
                'HRV_REF_NO': obj1.HRV_REF_NO
              }
            }
          };
        } else {
          dataObj = {
            'old': {
              'FD_HL_REQUEST_MEASUREMENTS': {
                'HRMM_REF_NO': obj.HRMM_REF_NO
              }
            },
            'new': {
              'FD_HL_REQUEST_MEASUREMENTS': {
                'HR_REF_NO': this.HR_REF_NO,
                'REPORT_REF_ID': 4,
                'REPORT_NAME': 'Chapter2',
                'ENGINE_SPEED': obj.ENGINE_SPEED,
                'GROSS_POWER': obj.GROSS_POWER,
                'HRV_REF_NO': obj1.HRV_REF_NO
              }
            }
          }
        }
        ParamTuple.push(dataObj);
      }
      // }
      var paramsAll = { 'tuple': ParamTuple };
      this.service.invokeService("UpdateFdHlRequestMeasurements", paramsAll, this.namespace, true, false)
        .then((res: any) => {
          this.getMesurment();
          resolve('Res success from table4gmode');
        }).catch((e) => {
          reject(e);
        });
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
