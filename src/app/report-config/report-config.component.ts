import { CdkDragStart, CdkDropList, CdkDropListGroup, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Services } from '../services/services';
import { ElementRef, Renderer2 } from '@angular/core';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-report-config',
  templateUrl: './report-config.component.html',
  styleUrls: ['./report-config.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class ReportConfigComponent implements OnInit, AfterViewInit {

  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";
  tableArr: any = [];
  reportSelectedArr: any = [];
  docNameDropArr: any = [];
  reportName: string = ''
  selectedRepObj: any = {}
  REPORT_CONFIG_REF_ID: string = '';
  call_modal: boolean = true;
  data_send: any = {}
  clickedRow: any;
  repConfigparam: any = {}
  AAHPopup: string = 'none';
  Version: string = '';
  Remarks: string = ''
  REPORT_REF_ID: string = '';
  reportStatus: string = '';
  clickView: boolean = false;
  spinner:boolean = false;

  @ViewChild('tableBody', { static: false }) tableBodyRef!: ElementRef;
  // tableScrollbody: any;
  // currentRowIndexDragging: any;
  // dragging = false;

  subscription: Subscription | undefined;
  constructor(private service: Services, private confirmationService: ConfirmationService, private router: Router) {
    // this.service.spinner.subscribe((bool:any)=>{
    //   this.spinner = bool;
    // })
    this.subscription = this.service.createPageEvents.subscribe((call) => {
      if (call == 'Save') {
        this.openRevision();
      }
      else if (call == 'SaveasDraft') {
        this.saveReportConfig('');
      }
      else if (call == 'Revice') {
        this.revisionClick();
      }
      else if (call == 'AddNewLine') {
        this.addNewLine();
      }
    })
  }

  ngOnInit(): void {
    // this.getData();
    this.GetFDHLReportNames();
  }
  ngAfterViewInit() {

  }
  ngOnDestroy() {
    this.subscription?.unsubscribe()
  }
  openRevision() {
    this.AAHPopup = 'block';
    const body: any = document.querySelector("body");
    body.style.overflow = "hidden";
  }
  closeRevision() {
    this.AAHPopup = 'none';
    const body: any = document.querySelector("body");
    body.style.overflow = "auto";
  }
  isValidReviseStr: string = '';
  async isValidRevise() {
    let obj = { REPORT_REF_ID: this.REPORT_REF_ID, REPORT_VERSION: this.Version }
    try {
      const res: any = await this.service.invokeService("IsFDHLReportVersionAvailable", obj, this.namespace, true, false);
      this.isValidReviseStr = res[0].IsFDHLReportVersionAvailable;
    return( res[0].IsFDHLReportVersionAvailable == 'false' ? true : res[0].IsFDHLReportVersionAvailable == 'true' ? false : false)
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  callVersion() {
    this.reviseSubmitted = false;
  }

  reviseSubmitted: boolean = false;
  revisionSubmit() {
    this.saveReportConfig('flag').then(async (data: any) => {
      this.reviseSubmitted = true;
      this.call_modal = false;
        if (await this.isValidRevise()) {
          let param = {};
          if (this.datavalidate(this.REPORT_REF_ID) == '') {
            param = {
              'tuple': {
                'new': {
                  'FD_HL_REPORT_M': {
                    'REPORT_VERSION': this.Version,
                    'REMARKS': this.Remarks,
                    'STATUS': 1
                  }
                }
              }
            }
          } else {
            param = {
              'tuple': {
                'old': {
                  'FD_HL_REPORT_M': {
                    'REPORT_REF_ID': this.REPORT_REF_ID
                  }
                },
                'new': {
                  'FD_HL_REPORT_M': {
                    'REPORT_VERSION': this.Version,
                    'REMARKS': this.Remarks,
                    'STATUS': 1
                  }
                },
              }
            }
          }
          this.spinner=true;
          this.service.invokeService("UpdateFdHlReportM", param, this.namespace, true, false)
            .then((res: any) => {
              this.spinner=false;
              this.reportStatus = res[0].STATUS;
              this.service.repConfEventCall.next(this.REPORT_REF_ID + "," + 1);
              this.getData();
              setTimeout(() => {
                this.call_modal = true;
                this.data_send = { 'text': 'Data Saved Succssfully', active: this.call_modal };
              }, 0);
              this.closeRevision();
            },(err) => {
              console.log('Error occured! While saving the data')
              this.spinner=false;
            })
        } else {
          this.spinner=false;
        }
    })
  }
  revisionClick() {
    this.call_modal = false;
    let param = {};
    if (this.datavalidate(this.REPORT_REF_ID) != '') {
      param = {
        'tuple': {
          'old': {
            'FD_HL_REPORT_M': {
              'REPORT_REF_ID': this.REPORT_REF_ID
            }
          },
          'new': {
            'FD_HL_REPORT_M': {
              'STATUS': 0
            }
          }
        }
      }
    }
    this.service.invokeService("UpdateFdHlReportM", param, this.namespace, true, false)
      .then((res: any) => {
        this.reportStatus = res[0].STATUS;
        this.getData();
        this.service.repConfEventCall.next(this.REPORT_REF_ID + "," + 0);
        this.clickedRow = null;
        this.revisionClear();
        setTimeout(() => {
          this.call_modal = true;
          this.data_send = { 'text': 'Revision Data Saved Succssfully', active: this.call_modal };
        }, 0);
      })
  }

  revisionClear() {
    this.Version = '';
    this.Remarks = '';
    this.reviseSubmitted = false;
  }
  isDraggingEnabled(obj: any) {
    if (this.reportStatus == '1') {
      return (this.datavalidate(obj.REPORT_CONFIG_REF_ID) == '' ? false : true);
    } else {
      return (this.datavalidate(obj.REPORT_CONFIG_REF_ID) == '' ? true : false);
    }
  };
  drop(e: any) {
    this.reportSelectedArr = []
    moveItemInArray(this.tableArr, e.previousIndex, e.currentIndex);
    this.tableArr.forEach((obj: any) => {
      if (this.datavalidate(obj.REPORT_CONFIG_REF_ID) != '') {
        this.reportSelectedArr.push(obj)
      }
    })
    // this.dragging = false;
    // setTimeout(() => {
    //   e.item.element.nativeElement.classList.remove('draggingRow');
    // }, 400);
  }
  dragStart(event: CdkDragStart<any>) {
   
  }
  GetFDHLReportNames() {
    this.service.invokeService("GetFDHLReportNames", null, this.namespace, true, false)
      .then((res: any) => {
        this.docNameDropArr = res;
      })
  }
  clickToView(obj: any) {
    this.tableArr = [];
    this.clickView = true;
    this.reportStatus = obj.STATUS
    this.reportName = obj.REPORT_NAME;
    this.REPORT_REF_ID = obj.REPORT_REF_ID;
    this.selectedRepObj = obj;
    this.repConfigparam = { REPORT_REF_ID: obj.REPORT_REF_ID, REPORT_NAME: obj.REPORT_NAME };
    this.service.repConfEventCall.next(obj.REPORT_REF_ID + "," + this.reportStatus);
    this.getData();
  }
  getData() {
    this.reportSelectedArr = [];
    this.service.invokeService("GetFdHlReportConfiguration", this.repConfigparam, this.namespace, true, false)
      .then((res: any) => {
        this.tableArr = res;
        if (this.reportStatus == '1') {
          this.tableArr = res.filter((item: any) => this.datavalidate(item.REPORT_CONFIG_REF_ID) != '')
          return;
        }
        res.forEach((obj: any) => {
          if (this.datavalidate(obj.REPORT_CONFIG_REF_ID) != '') {
            this.reportSelectedArr.push(obj)
          }
        })
      })
  }

  back() {
    this.clickView = false;
    this.clickedRow = null;
    this.service.repConfEventCall.next('' + "," + this.reportStatus);
    this.service.addNewLineBtn.next('a');
    this.GetFDHLReportNames();
  }

  reportSelected(obj: any) {
    if (obj.isChecked) {
      this.reportSelectedArr.push(obj)
    } else {
      this.reportSelectedArr.splice(this.reportSelectedArr.indexOf(obj), 1)
    }
  }
  repRowClick(obj: any) {
    if (this.datavalidate(obj.REPORT_CONFIG_REF_ID) != '' && this.reportStatus == '0') {
      this.clickedRow = this.tableArr.indexOf(obj)
      this.service.addNewLineBtn.next(this.clickedRow);
    }
  }
  addNewLine() {
    let emptyObj = {
      REPORT_ATTR_ID: '',
      ATTR_REF_ID: '',
      REPORT_ATTR_DESC: '',
      REPORT_REF_ID: this.repConfigparam.REPORT_REF_ID,
      REPORT_NAME: this.repConfigparam.REPORT_NAME,
      REPORT_CONFIG_REF_ID: ''
    }
    // if (this.datavalidate(this.tableArr[this.clickedRow].REPORT_CONFIG_REF_ID) == '') {
    //   this.service.addNewLineBtn.next('a');
    //   this.clickedRow = null;
    //   return;
    // }
    this.tableArr.splice(this.clickedRow + 1, 0, emptyObj)
    this.reportSelectedArr.splice(this.clickedRow + 1, 0, emptyObj)
    this.clickedRow = null;
    this.service.addNewLineBtn.next('a');
  }

  saveReportConfig(arg: string) {
    return new Promise((resolve, reject) => {
      this.service.spinner.next(true)
      this.spinner=true;
      this.call_modal = false;
      let ParamTuple: {}[] = [];
      var params = {};
      for (var obj of this.reportSelectedArr) {
        if (this.datavalidate(obj.REPORT_CONFIG_REF_ID) == "") {
          params = {
            'new': {
              'FD_HL_REPORT_CONFIG': {
                'REPORT_ATTR_ID': obj.REPORT_ATTR_ID,
                'ATTR_REF_ID': obj.ATTR_REF_ID,
                'REPORT_ATTR_DESC': obj.REPORT_ATTR_DESC,
                'IS_ACTIVE': 1,
                'REPORT_REF_ID': this.selectedRepObj.REPORT_REF_ID,
                'REPORT_NAME': this.selectedRepObj.REPORT_NAME,
                'REPORT_ATTR_ORDER': this.reportSelectedArr.indexOf(obj)
              }
            }
          };
        } else {
          params = {
            'old': {
              'FD_HL_REPORT_CONFIG': {
                'REPORT_CONFIG_REF_ID': obj.REPORT_CONFIG_REF_ID
              }
            },
            'new': {
              'FD_HL_REPORT_CONFIG': {
                'REPORT_ATTR_ID': obj.REPORT_ATTR_ID,
                'ATTR_REF_ID': obj.ATTR_REF_ID,
                'REPORT_ATTR_DESC': obj.REPORT_ATTR_DESC,
                'IS_ACTIVE': 1,
                'REPORT_REF_ID': this.selectedRepObj.REPORT_REF_ID,
                'REPORT_NAME': this.selectedRepObj.REPORT_NAME,
                'REPORT_ATTR_ORDER': this.reportSelectedArr.indexOf(obj)
              }
            }
          }
        }
        ParamTuple.push(params);
      }
      var paramsAll = { 'tuple': ParamTuple };
      this.service.invokeService("UpdateFdHlReportConfig", paramsAll, this.namespace, true, false)
        .then((res: any) => {
          // this.REPORT_CONFIG_REF_ID = res[0].REPORT_CONFIG_REF_ID
          this.spinner=false;
          this.service.spinner.next(false)
          this.reportSelectedArr = [];
          this.clickedRow = null;
          this.reportStatus = '0';
          this.service.addNewLineBtn.next('a');
          this.getData();
          if (arg == '') {
            setTimeout(() => {
              this.call_modal = true;
              this.data_send = { 'text': 'Data Saved Succssfully', active: this.call_modal };
            }, 0);
          }
          resolve('Res success from saving');
        }).catch((e) => {
          reject(e);
          this.spinner=false;
          this.service.spinner.next(false)
        });
    })
  }
  deleteRepRow(obj: any) {
    this.service.addNewLineBtn.next('a');
    this.call_modal = false;
    if (this.datavalidate(obj.REPORT_CONFIG_REF_ID) != '') {
      this.confirmationService.confirm({
        message: 'Are you sure that you want to delete this Attribute?', header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
        accept: () => {
          let dataObj = {
            tuple: {
              old: {
                FD_HL_REPORT_CONFIG: {
                  REPORT_CONFIG_REF_ID: obj.REPORT_CONFIG_REF_ID,
                }
              }
            }
          }
          this.service.invokeService("UpdateFdHlReportConfig", dataObj, this.namespace, true, false)
            .then((res: any) => {
              this.tableArr.splice(this.tableArr.indexOf(obj), 1)
              this.reportSelectedArr.splice(this.reportSelectedArr.indexOf(obj), 1)
              this.getData();
              // setTimeout(() => {
              //   this.call_modal = true;
              //   this.data_send = { text: 'File Deleted Successfully!', active: this.call_modal };
              // }, 0);
            })
        },
        reject: () => { }
      });
    } else {
      if (this.datavalidate(obj.ATTR_REF_ID) != '') {
        this.confirmationService.confirm({
          message: 'Are you sure that you want to delete this Attribute?', header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
          accept: () => {
            let dataObj = {
              tuple: {
                old: {
                  FD_HL_ATTRIBUTES_M: {
                    ATTR_REF_ID: obj.ATTR_REF_ID,
                  }
                }
              }
            }
            this.service.invokeService("UpdateFdHlAttributesM", dataObj, this.namespace, true, false)
              .then((res: any) => {
                this.tableArr.splice(this.tableArr.indexOf(obj), 1)
                // setTimeout(() => {
                //   this.call_modal = true;
                //   this.data_send = { text: 'File Deleted Successfully!', active: this.call_modal };
                // }, 0);
              })
          },
          reject: () => { }
        });
      } else {
        this.tableArr.splice(this.tableArr.indexOf(obj), 1)
        this.reportSelectedArr.splice(this.reportSelectedArr.indexOf(obj), 1)
        // this.reportSelectedArr
      }
    }
  }
  disRepId(obj: any) {
    let flag = false;
    if (this.reportStatus == '1') {
      flag = true;
    } else {
      if (this.datavalidate(obj.REPORT_CONFIG_REF_ID) == '' && !obj.isChecked) {
        flag = true;
      } if (this.datavalidate(obj.REPORT_CONFIG_REF_ID) != '' && (obj.isChecked == undefined || obj.isChecked) && this.datavalidate(obj.REPORT_ATTR_DESC) != '') {
        flag = false;
      } else if (this.datavalidate(obj.REPORT_CONFIG_REF_ID) != '' && obj.isChecked == undefined && this.datavalidate(obj.REPORT_ATTR_DESC) == '') {
        flag = true;
      }
    }
    return flag;
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
