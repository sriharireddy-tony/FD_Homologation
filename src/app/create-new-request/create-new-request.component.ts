import { DatePipe, Location } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { MenuComponent } from '../menu/menu.component';
import { Services } from '../services/services';
import { Chapter2Component } from './chapter2/chapter2.component';
import { CoveringLetterComponent } from './covering-letter/covering-letter.component';
import { Table12Component } from './table12/table12.component';
import { Table4gComponent } from './table4g/table4g.component';
declare var $: any

@Component({
  selector: 'app-create-new-request',
  templateUrl: './create-new-request.component.html',
  styleUrls: ['./create-new-request.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class CreateNewRequestComponent implements OnInit, OnChanges, OnDestroy {

  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";

  @ViewChild(CoveringLetterComponent) covering: CoveringLetterComponent | undefined;
  @ViewChild(Table4gComponent) table4g: Table4gComponent | undefined;
  @ViewChild(Chapter2Component) chapter2: Chapter2Component | undefined;
  @ViewChild(Table12Component) table12: Table12Component | undefined;
  @Input() requestIDClone: any;
  @Input() cloneHRNo: any;

  displayPopup: string = 'none';
  DOC_REF_NO: string = '';
  loginUserID: string = '';
  isSubmitted: boolean = false;
  HR_REF_NO: string = '';
  REQUEST_NO: string = ''
  instance_id: string = '';
  taskId: string = '';
  openAs: string = '';
  actRole: string = '';
  actStage: string = '';
  AAHPopup: string = 'none';
  AAHArr: any = [];
  engineVarient: any = []
  dis2: boolean = false
  call_modal: Boolean = false;
  documentsArr: any = [];
  checkedRows: any = [];
  data_send: any;
  maindocArr: any = [];
  ENGINE_FAMILY_NO_Arr: any = []
  ReportName: any = []
  isSubmitted1: boolean = false;
  subscription: Subscription | undefined;
  routeName: string = '';
  CLONE_REQUEST_NO: string = '';
  remarks: string = '';
  remarkSubmit: boolean = false;
  loginUserName: string = '';
  anexureArr: any = [];

  constructor(private service: Services, private datepipe: DatePipe, private fb: FormBuilder, private activatedRoute: ActivatedRoute, private location: Location,
    public menuComp: MenuComponent, private router: Router, private confirmationService: ConfirmationService) {
    this.getEngineFamily();
    this.loadPage();
    this.callReqManagementEmpty();
    this.service.lovMasaterList.subscribe((lovMasaterList: any) => {

    })
    this.service.loginUserID.subscribe((loginUserID: any) => {
      this.loginUserID = loginUserID;
    })
    this.service.loginUserName.subscribe((loginUserName: any) => {
      this.loginUserName = loginUserName;
    })

    this.subscription = this.service.createPageEvents.subscribe((call) => {
      switch (call) {
        case 'save':
          this.saveDetails('save');
          break;
        case 'submit':
          this.saveDetails('submit');
          break;
        case 'obsolete':
          this.completeTask(4, this.openAs, '');
          break;
        case 'clear':
          this.clear();
          break;
        case 'seekClarification':
          this.service.OpenAs.next(false);
          this.completeTask(0, this.openAs, '');
          break;
        case 'reject':
          this.completeTask(3, this.openAs, '');
          break;
        case 'sentToARAI':
          this.sentToARAI();
          break;
        case 'complete':
          this.saveARAI('complete');
          this.service.OpenAs.next(false);
          break;
        case 'docSave':
          this.saveARAI('docsave');
          break;
        case 'clone':
          this.saveDetails('clone');
          break;
        default:
          break;
      }
    })
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.CLONE_REQUEST_NO = this.datavalidate(changes['requestIDClone'].currentValue.REQUEST_NO);
    this.cloneHRNo = this.datavalidate(changes['cloneHRNo'].currentValue);
  }

  ngOnInit(): void {
    this.getReportName();
    this.getRegardsDrop();
    this.getFDHLReportNameAndVersion();
    this.activatedRoute.url.subscribe((urlSegments: any) => {
      this.routeName = urlSegments[0].path;
    })
  }
  reguTable12: string = '';
  reguCovering: string = '';
  reguTable4G: string = '';
  reguChapter2: string = '';
  getFDHLReportNameAndVersion() {
    this.service.invokeService("GetFDHLReportNameAndVersion", null, this.namespace, true, false)
      .then((res: any) => {
        res.forEach((obj: any) => {
          if (obj.REPORT_REF_ID == 1) {
            this.reguTable12 = obj.REPORT_VERSION
          } else if (obj.REPORT_REF_ID == 2) {
            this.reguCovering = obj.REPORT_VERSION
          } else if (obj.REPORT_REF_ID == 3) {
            this.reguTable4G = obj.REPORT_VERSION
          } else if (obj.REPORT_REF_ID == 4) {
            this.reguChapter2 = obj.REPORT_VERSION
          }
        })
      })
  }
 async cloneFdHlRequest() {
    let flag = false;
    this.call_modal = false;
    let obj = {
      HR_REF_NO: this.HR_REF_NO,
      CHR_REF_NO: this.cloneHRNo,
      CLONE_REQUEST_NO: this.CLONE_REQUEST_NO
    }
   await this.service.invokeService("CloneFdHlRequest", obj, this.namespace, true, false)
      .then(async (res: any) => {
        this.service.cloneHRNo.next(this.cloneHRNo)
        this.covering?.getFDHLCoveringLetterDetails();
        this.covering?.getFDHLCLEnClosureDetails();
        this.table12?.getData();
        this.table12?.getFDHLRequestVariantDetails();
      // await Promise.all([this.getFDHLRequestDetails(this.HR_REF_NO)]).then((res) => {
        this.getFDHLRequestDetails(this.HR_REF_NO);
        setTimeout(() => {
          this.call_modal = true;
          this.data_send = { text: `New Request Created Successfully`, 'text1': `Request ID`, 'text2': `${this.REQUEST_NO}`, active: this.call_modal };
        }, 2000);
        // })
      })
  }

  OpenAs: string = '';
  cordInbox: boolean = false;
  getopenAs() {
    let routerName = window.location.href.split('/')[window.location.href.split('/').length - 1];
    if (routerName.includes('?')) {
      if (routerName.includes('openAs')) {
        this.OpenAs = routerName.split('?')[1].split('&')[1].split('=')[1]
      } else {
        this.OpenAs = 'customInboxTask';
        this.cordInbox = true;
      }
      if (this.taskId != '' && this.actStage == '2' || this.OpenAs == 'completed' || this.OpenAs == 'dashboard') {
        this.dis2 = true;
        this.service.OpenAs.next(true)
      }
      else {
        this.dis2 = false;
        this.service.OpenAs.next(false)
      }
    }
  }
  repRefId: number = 0;
  getFdHlAnnexureDetailsByFamily() {
    if (this.emisionComplaince == 'TR4' || this.emisionComplaince == 'CE4') {
      this.repRefId = 3
    } else if (this.emisionComplaince == 'B3A' || this.emisionComplaince == 'CE3') {
      this.repRefId = 4
    }
    let obj = {
      HR_REF_NO: this.HR_REF_NO,
      REPORT_REF_ID: this.repRefId,
      ENGINE_FAMILY_NO: this.createRequestForm.controls['ENGINE_FAMILY_NO'].value
    }
    this.service.invokeService("GetFdHlAnnexureDetailsByFamily", obj, this.namespace, true, false)
      .then((res: any) => {
        this.anexureArr = res;
      })
  }

  // certfileUploadDoc1: any;
  certfile1: any;
  childInd: number = 0;
  AnneUploadFile1(i: number) {
    this.childInd = i
    $("#anneUploadFile1Doc1").click();
  }
  anneUploadFile1Doc1(e: any) {
    this.call_modal = false;
    let fileName = '';
    let fileExt = '';
    this.certfile1 = e.target.files[0]
    if (parseFloat(e.target.files[0].size) / 1024 / 1024 > 5) {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { text: 'Document Size Limit Exceeded,You have total limit upto 5MB !', active: this.call_modal };
      }, 0);
      return;
    }
    fileName = e.target.files[0].name
    fileExt = e.target.files[0].name.split('.')[1]

    this.service.uploadFile("UploadFDHLDocumnets", this.certfile1, ['png', 'jpg', 'jpeg'], this.namespace, false, false)
      .then((resDocPath: any) => {
        this.anexureArr[this.childInd].ANNEXURE_NAME = fileName
        this.anexureArr[this.childInd].ANNEXURE_PATH = resDocPath
        this.anexureArr[this.childInd].ANNEXURE_EXT = fileExt
      })
    // this.certfileUploadDoc1=''
    // }
  }

  deleteImage(i: number) {
    if (this.datavalidate(this.anexureArr[i].HRM_REF_NO) == '') {
      this.anexureArr[i].ANNEXURE_NAME = ''
      this.anexureArr[i].ANNEXURE_PATH = ''
      this.anexureArr[i].ANNEXURE_EXT = ''
    } else {

    }
  }
  annePopup = 'none';
  imgPathUrl: string = '';
  imagePath: string = '';
  imageName: string = '';
  hearderImg: string = '';
  popOpen(path: string, name: string) {
    this.getURL();
    this.imagePath = path;
    this.imageName = name;
    this.hearderImg = name.split('.')[0]
    this.annePopup = 'block';
    this.imgPathUrl = this.imgURL + path;
    const body: any = document.querySelector("body");
    body.style.overflow = "hidden";
  }
  closeannexure() {
    this.annePopup = 'none';
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
  async saveAnnexure(arg: string) {
    this.call_modal = false;
    let reportName = this.repRefId == 3 ? 'table4g' : this.repRefId == 4 ? 'chapter' : ''
    let ParamTuple: {}[] = [];
    var params = {};
    for (var obj of this.anexureArr) {
      if (this.datavalidate(obj.HAD_REF_NO) == "") {
        params = {
          'new': {
            'FD_HL_ANNEXURE_DETAILS': {
              'HR_REF_NO': this.HR_REF_NO,
              'REPORT_REF_ID': this.repRefId,
              'REPORT_NAME': reportName,
              'REPORT_VERSION': obj.REPORT_VERSION,
              'ATTR_REF_ID': obj.ATTR_REF_ID,
              'ATTR_VALUE': obj.ATTR_VALUE,
              'ANNEXURE_NAME': obj.ANNEXURE_NAME,
              'ANNEXURE_PATH': obj.ANNEXURE_PATH,
              'ANNEXURE_EXT': obj.ANNEXURE_EXT,
              'CREATED_BY': obj.CREATED_BY,
              'CREATION_DATE': this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
              'ENGINE_FAMILY_NO': this.createRequestForm.controls['ENGINE_FAMILY_NO'].value
            }
          }
        };
      }
      else {
        params = {
          'old': {
            'FD_HL_ANNEXURE_DETAILS': {
              'HAD_REF_NO': obj.HAD_REF_NO
            }
          },
          'new': {
            'FD_HL_ANNEXURE_DETAILS': {
              'HR_REF_NO': this.HR_REF_NO,
              'REPORT_REF_ID': this.repRefId,
              'REPORT_NAME': reportName,
              'REPORT_VERSION': obj.REPORT_VERSION,
              'ATTR_REF_ID': obj.ATTR_REF_ID,
              'ATTR_VALUE': obj.ATTR_VALUE,
              'ANNEXURE_NAME': obj.ANNEXURE_NAME,
              'ANNEXURE_PATH': obj.ANNEXURE_PATH,
              'ANNEXURE_EXT': obj.ANNEXURE_EXT,
              'MODIFIED_BY': this.loginUserID,
              'MODIFIED_DATE': this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
              'ENGINE_FAMILY_NO': this.createRequestForm.controls['ENGINE_FAMILY_NO'].value
            }
          }
        }
      }
      ParamTuple.push(params);
    }
    // }
    var paramsAll = { 'tuple': ParamTuple };
    this.service.invokeService("UpdateFdHlAnnexureDetails", paramsAll, this.namespace, true, false)
      .then((res: any) => {
        this.getFdHlAnnexureDetailsByFamily();
        if (arg == 'annex') {
          setTimeout(() => {
            this.call_modal = true;
            this.data_send = { text: 'Annexure Updated Succesfully', active: this.call_modal };
          }, 0);
        }
      })
  }

  annexClear() {
    for (let obj of this.anexureArr) {
      obj.ATTR_VALUE = ''
    }
  }

  regardsArr: any[] = [{ data: '' }, { data: '' }, { data: '' }, { data: '' }, { data: '' }];
  regardsResponseArr: any = [];
  regardsDropArr: any = [];
  regards: string = '';

  getRegardsDrop() {
    this.service.invokeService("GetFDHLRegardsDetails", null, this.namespace, true, false)
      .then((res: any) => {
        res.forEach((d: any) => {
          this.regardsResponseArr = res;
          this.regardsDropArr.push(d.CL_REGARDS)
        })
      })
  }
  selectRegards(e: any) {
    this.regardsArr = [];
    this.regardsResponseArr.filter((data: any) => {
      if (data.CL_REGARDS == e.target.value) {
        this.regardsArr.push({ data: data.SIGNATURE })
        this.regardsArr.push({ data: data.REGA_NAME })
        this.regardsArr.push({ data: data.DESIGNATION })
        this.regardsArr.push({ data: data.DEPARTMENT })
        this.regardsArr.push({ data: data.COMPANY_NAME })
      }
    })
    if (e.target.value == '') {
      this.regardsArr = [{ data: '' }, { data: '' }, { data: '' }, { data: '' }, { data: '' }];
    }
  }

  clear() {
    if (this.datavalidate(this.HR_REF_NO) == '') {
      this.createRequestForm.patchValue({
        LOCATION: 'Domestic',
        CERTIFICATION_TYPE: '',
        ENGINE_FAMILY_NO: '',
        WBS: '',
        COST_CENTER: ''
      })
      this.remarks = ''
      this.variantsArr = [];
      this.nameArr = [];
    } else {
      this.createRequestForm.patchValue({
        WBS: '',
        COST_CENTER: ''
      })
      this.remarks = ''
      this.covering?.clear();
      this.table12?.clear();
      this.engineVarient.forEach((obj: any) => {
        if (obj.HRV_REF_NO != '') {
          if (this.emisionComplaince == 'TR4' || this.emisionComplaince == 'CE4') {
            this.table4g?.clear(obj.HRV_REF_NO, obj.VARIANT);
          } else if (this.emisionComplaince == 'B3A' || this.emisionComplaince == 'CE3') {
            this.chapter2?.clear(obj.HRV_REF_NO, obj.VARIANT);
          }
        }
      })
    }
    this.footerClear();
    this.annexClear();
  }

  coveringWordDoc: string = '';
  table12WordDoc: string = '';
  onButtonClick(event: Event, type: string) {
    event.stopPropagation();
    //  if(type='covering'){
    let obj = {
      FDHL_DOC_TYPE: type,
      HR_REF_NO: this.HR_REF_NO,
      HRV_REF_NO: '',
      REPORT_REF_ID: ''
    }
    this.service.invokeService("GenerateFDHlWordDocument", obj, this.namespace, true, false)
      .then((res: any) => {
        this.coveringWordDoc = res[0].generateFDHlWordDocument
        this.service.downloadFile("DownloadDocument", res[0].generateFDHlWordDocument, res[0].generateFDHlWordDocument + ";reportpath", this.namespace, true, false)
      })
  }
  consolidate() {
    let type = '';
    let refId = 0;
    if (this.emisionComplaince == 'TR4' || this.emisionComplaince == 'CE4') {
      type = 'Table 4G'
      refId = 3
    } else if (this.emisionComplaince == 'B3A' || this.emisionComplaince == 'CE3') {
      type = 'Chapter 2'
      refId = 4
    }
    let obj = {
      FDHL_DOC_TYPE: type,
      HR_REF_NO: this.HR_REF_NO,
      HRV_REF_NO: '',
      REPORT_REF_ID: refId
    }
    this.service.invokeService("GenerateFDHlConsolidateReport", obj, this.namespace, true, false)
      .then((res: any) => {
        this.service.downloadFile("DownloadDocument", res[0].generateFDHlConsolidateReport, res[0].generateFDHlConsolidateReport + ";reportpath", this.namespace, true, false)
      })
  }
  ARAIValid() {
    if (this.datavalidate(this.createRequestForm.controls['ARAI'].value) == '') {
      this.isSubmitted1 = true
      this.ARAITrue = false
      return true
    }
    return false;
  }

  ARAITrue: boolean = true;
  sentToARAI() {
    this.call_modal = false;
    if (this.ARAIValid()) {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { 'text': 'Please Enter ARAI Request Number', active: this.call_modal };
      }, 0);
      return;
    }
    let dataObj1 = {}
    if (this.datavalidate(this.HR_REF_NO) != '') {
      dataObj1 = {
        tuple: {
          old: {
            FD_HL_REQUEST_DETAILS: {
              HR_REF_NO: this.HR_REF_NO
            }
          },
          new: {
            FD_HL_REQUEST_DETAILS: {
              'ARAI_NO': this.datavalidate(this.createRequestForm.controls['ARAI'].value),
              'CURRENT_STAGE': this.actStage,
              'REMARKS': this.remarks
            }
          }
        }
      }
    }
    this.service.spinner.next(true);
    this.service.invokeService("UpdateFdHlRequestDetails", dataObj1, this.namespace, true, false)
      .then((res: any) => {
        let dataObj = {
          HR_REF_NO: this.HR_REF_NO,
          from_User: this.loginUserID,
          to_User: '',
          mailType: 'Send to ARAI',
          stage: this.actStage,
          status: 5,
          taskId: this.taskId,
          remarks: this.remarks
        }
        this.service.invokeService("SendFD_HLCustomMailWrapper", dataObj, this.namespace, true, false)
          .then((res: any) => {
            // this.ARAIFlag = res[0].sendFD_HLCustomMailWrapper;
            this.service.spinner.next(false);
            let dataObj = { HR_REF_NO: this.HR_REF_NO }
            this.service.invokeService("GetFDHLRequestDetails", dataObj, this.namespace, true, false).then((res: any) => {
              this.procesStatus = res[0].PROCESS_STATUS
              this.service.ARAIFlag.next(this.procesStatus)
            })
            this.getFD_HLHistoryDetailsByHR_RefNo();
            setTimeout(() => {
              this.call_modal = true;
              this.data_send = { 'text': 'Task Sent to ARAI Successfully', active: this.call_modal };
            }, 0);
          }).catch((err: any) => {
            this.service.spinner.next(false);
          })
      })
  }

  engineFamilyDataArr: any = []
  getEngineFamily() {
    let dataObj = { ENGINE_M_REF_ID: '' }
    this.service.invokeService("GetFDHLEngineFamilyDetails", dataObj, this.namespace, true, false)
      .then((res: any) => {
        this.engineFamilyDataArr = res;
        res.forEach((data: any) => {
          this.ENGINE_FAMILY_NO_Arr.push({ RefNo: data.ENGINE_F_REF_ID, ENGINE_FAMILY_NO: data.ENGINE_FAMILY_NO, EMISSION_COMPLIANCE: data.EMISSION_COMPLIANCE })
        })
        if (this.createRequestForm.controls['ENGINE_FAMILY_NO'].value != '') {
          this.ENGINE_FAMILY_NO_Arr.forEach((d: any) => {
            if (d.ENGINE_FAMILY_NO == this.createRequestForm.controls['ENGINE_FAMILY_NO'].value) {
              this.emisionComplaince = d.EMISSION_COMPLIANCE
            }
          })
        }
      })
  }
  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
  backBtnLink() {
    // if (this.taskId != '' && (this.datavalidate(this.openAs) == '')) {
    //   return true;
    // }
    if (this.HR_REF_NO != '' && (this.datavalidate(this.openAs) != '')) {
      return true;
    }
    if (this.HR_REF_NO == '') {
      return false;
    }
    if (this.HR_REF_NO != '' && (this.datavalidate(this.openAs) == '')) {
      return false;
    }
    return true;
  }

  async validTypeApproval() {
    this.call_modal = false;
    var CERTIFICATION_TYPE = this.createRequestForm.controls['CERTIFICATION_TYPE'].value;
    var ENGINE_FAMILY_NO = this.createRequestForm.controls['ENGINE_FAMILY_NO'].value;

    let obj = { ENGINE_FAMILY_NO: this.createRequestForm.controls['ENGINE_FAMILY_NO'].value };

    try {
      let res: any = await this.service.invokeService("GetFDHLApprovalRequestNo", obj, this.namespace, true, false);

      if (res.length == 0) {
        if (CERTIFICATION_TYPE == 'Amendment' && ENGINE_FAMILY_NO != '') {
          setTimeout(() => {
            this.call_modal = true;
            this.data_send = { text: 'Please Create Type Approval Request', active: this.call_modal };
            this.saveType == 'submit' ? '' : this.createRequestForm.patchValue({ CERTIFICATION_TYPE: '' });
          }, 0);
          return true;
        }
      } else {
        let obj11 = res.some((item: any) => {
          return item.PROCESS_STATUS == '1' && item.CERTIFICATION_TYPE == 'Approval'
        })
        if (!obj11 && CERTIFICATION_TYPE == 'Amendment' && ENGINE_FAMILY_NO != '') {
          setTimeout(() => {
            this.call_modal = true;
            this.data_send = {
              text: 'Please Complete Type Approval Request',
              active: this.call_modal
            };
          }, 0)
          this.createRequestForm.patchValue({ CERTIFICATION_TYPE: '' });
          return true;
        }
        for (let obj of res) {
          if (CERTIFICATION_TYPE == 'Approval' && (obj.PROCESS_STATUS == '1' || obj.PROCESS_STATUS == '2') && obj.CERTIFICATION_TYPE == 'Approval' && this.REQUEST_NO != obj.REQUEST_NO) {
            setTimeout(() => {
              this.call_modal = true;
              this.data_send = {
                text: this.datavalidate(obj.REQUEST_NO) + ' is already created',
                text1: 'For Type Approval with Engine Family No. ' + ENGINE_FAMILY_NO,
                active: this.call_modal
              };
              this.saveType == 'submit' ? '' : this.createRequestForm.patchValue({ CERTIFICATION_TYPE: '' });
            }, 0);
            return true;
          } else if (CERTIFICATION_TYPE == 'Amendment' && obj.PROCESS_STATUS == '2' && obj.CERTIFICATION_TYPE == 'Amendment' && this.REQUEST_NO != obj.REQUEST_NO) {
            setTimeout(() => {
              this.call_modal = true;
              this.data_send = {
                text: 'Type Amendment is already',
                text1: 'Inprogress with ' + obj.REQUEST_NO,
                active: this.call_modal
              };
              this.saveType == 'submit' ? '' : this.createRequestForm.patchValue({ CERTIFICATION_TYPE: '' });
            }, 0);
            return true;
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
    return false;
  }

  back() {
    let variable = this.OpenAs == 'saved' ? 'saved' :
      this.OpenAs == 'customInboxTask' ? 'inbox' : this.OpenAs == 'completed' ? 'completedTasks' : ''
    this.menuComp.menuHideFun();
    this.location.back();
    // this.router.navigate(['inbox']);
    this.service.routeChange.next(variable);
    this.service.createPageEvents.next('');
    this.service.OpenAs.next(false)
  }
  workflowHistory() {
    this.AAHPopup = 'block';
    const body: any = document.querySelector("body");
    body.style.overflow = "hidden";
  }
  closeWorkFlowDoc() {
    this.AAHPopup = 'none';
    const body: any = document.querySelector("body");
    body.style.overflow = "auto";
  }
  getFD_HLHistoryDetailsByHR_RefNo() {
    let dataObj = { HR_RefNo: this.HR_REF_NO }
    this.service.invokeService("GetFD_HLHistoryDetailsByHR_RefNo", dataObj, this.namespace, true, false)
      .then((res: any) => {
        this.AAHArr = res;
      })
  }
  procesStatus: string = '';
  getFDHLRequestDetails(arg: string) {
    this.regardsArr = []
    let dataObj = { HR_REF_NO: arg }
    this.service.invokeService("GetFDHLRequestDetails", dataObj, this.namespace, true, false)
      .then((res: any) => {
        // this.clarificationType = this.datavalidate(res[0].CERTIFICATION_TYPE)
        this.REQUEST_NO = res[0].REQUEST_NO
        this.procesStatus = res[0].PROCESS_STATUS
        this.remarks = this.datavalidate(this.actStage) == this.datavalidate(res[0].CURRENT_STAGE) ? res[0].REMARKS : ''
        this.DOCUMENT_NO = res[0].DOCUMENT_NO
        this.regards = this.datavalidate(res[0].HR_REGARDS)
        this.regardsArr.push({ data: res[0].SIGNATURE })
        this.regardsArr.push({ data: res[0].REGA_NAME })
        this.regardsArr.push({ data: res[0].DESIGNATION })
        this.regardsArr.push({ data: res[0].DEPARTMENT })
        this.regardsArr.push({ data: res[0].COMPANY_NAME })
        this.createRequestForm.patchValue({
          LOCATION: this.datavalidate(res[0].LOCATION),
          CERTIFICATION_TYPE: this.datavalidate(res[0].CERTIFICATION_TYPE),
          ENGINE_FAMILY_NO: this.datavalidate(res[0].ENGINE_FAMILY_NO),
          WBS: this.datavalidate(res[0].WBS),
          COST_CENTER: this.datavalidate(res[0].COST_CENTER),
          ARAI: this.datavalidate(res[0].ARAI_NO),
          APEX: this.datavalidate(res[0].APEX_NO),
        })
        this.getEngineFamily();
        setTimeout(() => {
          this.getFDHLEngineModelsByFamily();
        }, 100);
        // if(this.routeName!='clone'){
        this.service.ARAIFlag.next(this.procesStatus)
        // }
      })
  }
  getFD_HLDocDetailsByHR_RefNo(arg: string) {
    this.documentsArr = []
    this.certdocumentsArr = []
    this.repdocumentsArr = []
    this.appdocumentsArr = []
    this.dradocumentsArr = []
    this.invdocumentsArr = []

    this.initValue = 0
    this.certDocSize = 0;

    let dataObj = { HR_RefNo: arg }
    this.service.invokeService("GetFD_HLDocDetailsByHR_RefNo", dataObj, this.namespace, true, false)
      .then((res: any) => {
        res.filter((doc: any) => {
          switch (doc.DOC_TYPE) {
            case 'Main':
              this.documentsArr.push(doc)
              this.initValue += parseFloat(doc.DOC_SIZE)
              break;
            case 'Certificates':
              this.certdocumentsArr.push(doc)
              this.certDocSize += parseFloat(doc.DOC_SIZE)
              break;
            case 'Reports':
              this.repdocumentsArr.push(doc)
              this.certDocSize += parseFloat(doc.DOC_SIZE)
              break;
            case 'Approved':
              this.appdocumentsArr.push(doc)
              this.certDocSize += parseFloat(doc.DOC_SIZE)
              break;
            case 'Drawings':
              this.dradocumentsArr.push(doc)
              this.certDocSize += parseFloat(doc.DOC_SIZE)
              break;
            case 'Invoice':
              this.invdocumentsArr.push(doc)
              this.certDocSize += parseFloat(doc.DOC_SIZE)
              break;
            default:
              break;
          }
        })
      })
  }
  emisionComplaince: string = '';
  getFDHLEngineModelsByFamily() {
    this.call_modal = false;
    this.variantsArr = []
    this.variantsArr1 = [];
    this.HRV_REF_NOArr = [];
    this.nameArr = [];
    // if (this.datavalidate(this.HR_REF_NO) == '') {
    //   this.callReqManagement1(this.HR_REF_NO);
    // }
    let dataObj = { ENGINE_FAMILY_NO: this.createRequestForm.controls['ENGINE_FAMILY_NO'].value, HR_REF_NO: this.HR_REF_NO }
    this.service.invokeService("GetFDHLEngineModelsByHRFamily", dataObj, this.namespace, true, false)
      .then((res: any) => {
        this.engineVarient = res;
        this.engineVarient.filter((d1: any) => {
          if (this.datavalidate(d1.HRV_REF_NO) != '') {
            // d.HRV_REF_NO = d1.HRV_REF_NO
            this.HRV_REF_NOArr.push({ HRV_REF_NO: d1.HRV_REF_NO, VARIANT: d1.VARIANT })
            this.nameArr.push(d1.VARIANT)
            d1.isChecked = true;
            this.variantsArr.push({ HR_REF_NO: d1.HR_REF_NO, HRV_REF_NO: d1.HRV_REF_NO, LOV_DESC: d1.VARIANT, Table12Arr: [], Measurment: [], Mode: [{ innerArr: [] }] })
            this.variantsArr1.push({ HR_REF_NO: d1.HR_REF_NO, HRV_REF_NO: d1.HRV_REF_NO, LOV_DESC: d1.VARIANT, Table12Arr1: [], Measurment: [], Mode: [{ innerArr: [] }] })
          }
        })
        this.ENGINE_FAMILY_NO_Arr.forEach((d: any) => {
          if (d.ENGINE_FAMILY_NO == this.createRequestForm.controls['ENGINE_FAMILY_NO'].value) {
            this.emisionComplaince = d.EMISSION_COMPLIANCE
          }
        })
        this.variantNamesStr();
        this.callReqManagement(this.HR_REF_NO);
        this.getFdHlAnnexureDetailsByFamily();
        if (this.datavalidate(this.openAs) == '') {
          this.validTypeApproval();
        }
        this.isvarientCheck();
      })
  }
  isvarientCheck() {
    let check = false;
    if (this.engineVarient == 0) {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { text: 'Please create at least one variant', active: this.call_modal };
      }, 0);
      check = true
    }
    return check;
  }

  async loadPage() {
    this.activatedRoute.queryParams.subscribe(async (params: any) => {
      this.service.SaveUpdateHRNo.next('');
      this.HR_REF_NO = params.HR_REF_NO;
      this.taskId = params['taskId'];
      this.openAs = params['openAs'];
      this.service.actStag.next('')
      if (this.taskId) {
        $.cordys.json.defaults.removeNamespacePrefix = true;
        await $.cordys.workflow.getTaskDetails(this.taskId).done((tData: any) => {
          // this.taskState = tData.State;
          this.HR_REF_NO = tData.TaskData.ApplicationData.FD_HL_IP_SchemaFragment.HR_REF_NO;
          this.actRole = tData.TaskData.ApplicationData.FD_HL_IP_SchemaFragment.ACT_ROLE;
          this.actStage = tData.TaskData.ApplicationData.FD_HL_IP_SchemaFragment.STAGE;
          let varObj = this.actRole + ',' + this.actStage
          this.service.roleStage.next(varObj)
          this.service.actStag.next(this.actStage)
          this.service.SaveUpdateHRNo.next(this.HR_REF_NO);
          this.getopenAs();
        })
      }
      if (this.datavalidate(this.HR_REF_NO) != '') {
        let obj = { 'HR_REF_NO': this.HR_REF_NO, 'actRole': this.actRole, 'actStage': this.actStage }
        this.service.sharingData(obj, 'HR_REF_NO');
        this.service.taskPage.next(true);
        this.service.spinner.next(true);
        this.getFDHLRequestDetails(this.HR_REF_NO);
        this.getFD_HLDocDetailsByHR_RefNo(this.HR_REF_NO);
        this.getFD_HLHistoryDetailsByHR_RefNo();
        this.service.SaveUpdateHRNo.next(this.HR_REF_NO);
      }
    })
    this.getopenAs();
  }
  // idArr: any = [];
  nameArr: any = [];
  variantsArr: any = [];
  variantsArr1: any = [];

  async call4gc2() {
    let params = { HR_REF_NO: this.HR_REF_NO, REPORT_REF_ID: 3 };
    await this.service.invokeService("GetFdHlRequestManagement", params, this.namespace, true, false)
      .then((res: any) => {
        this.Table12Arr = res;
        this.getFdHlRequestManagement();
      })
    let params1 = { HR_REF_NO: this.HR_REF_NO, REPORT_REF_ID: 4 };
    await this.service.invokeService("GetFdHlRequestManagement", params1, this.namespace, true, false)
      .then((res: any) => {
        this.chapter2Arr = res;
        this.getFdHlRequestManagement1();
      })
  }

  nameArrStr: string = ''

  async saveVariants() {
    let ParamTuple: {}[] = [];
    var params = {};
    for (var obj of this.engineVarient) {
      // if(obj.isChecked){
      if (this.datavalidate(obj.HRV_REF_NO) == "") {
        params = {
          'new': {
            'FD_HL_REQUEST_VARIANTS': {
              'HR_REF_NO': this.HR_REF_NO,
              'VARIANT': this.datavalidate(obj.VARIANT),
              'ENGINE_MODEL_NO': this.datavalidate(obj.ENGINE_MODEL_NO)
            }
          }
        };
      }
      else {
        params = {
          'old': {
            'FD_HL_REQUEST_VARIANTS': {
              'HRV_REF_NO': obj.HRV_REF_NO
            }
          },
          'new': {
            'FD_HL_REQUEST_VARIANTS': {
              'HR_REF_NO': this.HR_REF_NO,
              'VARIANT': this.datavalidate(obj.VARIANT),
              'ENGINE_MODEL_NO': this.datavalidate(obj.ENGINE_MODEL_NO)
            }
          }
        }
      }
      // }
      if (obj.isChecked) {
        ParamTuple.push(params);
      }
    }
    var paramsAll = { 'tuple': ParamTuple };
    await this.service.invokeService("UpdateFdHlRequestVariants", paramsAll, this.namespace, true, false)
      .then((res: any) => {
        res.forEach((obj: any) => {
          this.HRV_REF_NOArr.push({ HRV_REF_NO: obj.HRV_REF_NO, VARIANT: obj.VARIANT })
        })
        this.engineVarient.filter((d: any) => {
          res.forEach((d1: any) => {
            if (d.VARIANT == d1.VARIANT) {
              d.HRV_REF_NO = d1.HRV_REF_NO
            }
          })
        })
        // this.service.callTable4G.next('table4g');
        // this.service.callTable4G.next('chapter2');
        // this.service.callTable4G.next('table12');
        // this.service.callTable4G.next('covering');
        if (this.saveType != 'clone') {
          if (this.emisionComplaince == 'TR4' || this.emisionComplaince == 'CE4') {
            Promise.all([this.covering?.updateFdHlCoveringLetter(), this.covering?.updateFdHlClEnclosure(), this.table4g?.save(),
            this.table12?.updateFdHlTable12(), this.table12?.updateFdHlTab12SpecChanges(), this.table4g?.saveMode(), this.table4g?.saveMeasurment()]).then((res) => {
              this.saveDocuments();
            }).catch(error => {
              // alert('error: data not saved successfully');
              this.service.spinner.next(false);
            });
          } else if (this.emisionComplaince == 'B3A' || this.emisionComplaince == 'CE3') {
            Promise.all([this.covering?.updateFdHlCoveringLetter(), this.covering?.updateFdHlClEnclosure(), this.chapter2?.save(),
            this.table12?.updateFdHlTable12(), this.table12?.updateFdHlTab12SpecChanges(), this.chapter2?.saveMode(), this.chapter2?.saveMeasurment()]).then((res) => {
              this.saveDocuments();
            }).catch(error => {
              // alert('error: data not saved successfully');
              this.service.spinner.next(false);
            });
          } else {
            Promise.all([this.covering?.updateFdHlCoveringLetter(), this.covering?.updateFdHlClEnclosure(), this.table12?.updateFdHlTable12(), this.table12?.updateFdHlTab12SpecChanges()])
              .then((res) => {
                this.saveDocuments();
              }).catch(error => {
                // alert('error: data not saved successfully');
                this.service.spinner.next(false);
              });
          }
        } else {
          this.cloneFdHlRequest();
        }
      })
  }
  table4gVar: any = [];
  chapter2Var: any = [];
  HRV_REF_NOArr: any = [];
  getReportName() {
    this.service.invokeService("GetFDHLReportNames", null, this.namespace, true, false)
      .then((res: any) => {
        this.ReportName = res;
        res.forEach((d: any) => {
          if (d.REPORT_NAME == 'Table 4G') {
            this.table4gVar.push(d)
          } else if (d.REPORT_NAME == 'Chapter 2') {
            this.chapter2Var.push(d)
          }
        })
      })
  }
  openDoc() {
    this.displayPopup = 'block';
    const body: any = document.querySelector("body");
    body.style.overflow = "hidden";
    // body.style.opacity = '0.85';
  }

  closeDoc() {
    this.displayPopup = 'none';
    const body: any = document.querySelector("body");
    body.style.overflow = "auto";
    // body.style.opacity = '1';
  }

  downloadFile(doc: any) {
    this.service.downloadFile("DownloadDocument", doc.DOC_NAME, doc.DOC_PATH, this.namespace);
  }

  checkAllCheckBox(ev: any) {
    this.documentsArr.forEach((x: { checked: any; }) => x.checked = ev.target.checked)
    ev.target.checked ? this.documentsArr.forEach((x: any) => {
      this.checkedRows.push(x)
    }) : this.checkedRows = []
  }
  isAllCheckBoxChecked() {
    return this.documentsArr.every((p: { checked: any; }) => p.checked);
  }
  tdCheckbox(row: any) {
    row.checked == true ? this.checkedRows.push(row) : this.checkedRows.splice(this.checkedRows.indexOf(row), 1)
  }
  uploadFile() {
    $("#fileUploadDoc").click();
  }

  file: any;
  fileName: any;
  fileUploadDoc: any;
  initValue: number = 0
  gridDocSize: number = 0;
  mainDocSpinner: boolean = false;
  UploadFileDoc(e: any) {
    this.mainDocSpinner = true;
    this.call_modal = false;
    this.file = e.target.files[0]
    this.fileName = e.target.files[0].name
    const record = this.documentsArr.find((item: any) => {
      return item.DOC_NAME == this.fileName
    })
    if (record) {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { text: 'This File Already Exists', active: this.call_modal };
      }, 0);
      this.mainDocSpinner = false;
    } else {
      if (this.initValue + parseFloat(this.file.size) / 1024 / 1024 > 100) {
        setTimeout(() => {
          this.call_modal = true;
          this.data_send = { text: 'Document Size Limit Exceeded,You have total limit upto 100MB !', active: this.call_modal };
        }, 0);
        this.mainDocSpinner = false;
        return;
      } else {
        this.service.uploadFile("UploadFDHLDocumnets", this.file, [], this.namespace, false, false)
          .then((resDocPath: any) => {
            this.mainDocSpinner = false;
            this.initValue = this.initValue + parseFloat(this.file.size) / 1024 / 1024
            this.documentsArr.push({
              'DOC_REF_NO': '',
              'DOC_NAME': this.service.datavalidate(this.fileName),
              "DOC_PATH": resDocPath,
              'DOC_TYPE': 'Main',
              'UPLOADERNAME': this.loginUserID,
              'UPLOADED_ON': this.datepipe.transform(new Date(), 'dd-MM-yyyy'),
              'DOC_SIZE': e.target.files[0].size / 1024 / 1024
            })
            this.fileUploadDoc = ''
          }).catch((err) => {
            this.mainDocSpinner = false;
          })
      }
    }
  }
  certfile: any;
  certfileName: any;
  certfileUploadDoc: any;
  certdocumentsArr: any = [];
  certDocSize: number = 0;
  certSpinner: boolean = false;
  certUploadFile() {
    $("#certfileUploadDoc").click();
  }
  certUploadFileDoc(e: any) {
    this.certSpinner = true;
    this.call_modal = false;
    this.certfile = e.target.files[0]
    this.certfileName = e.target.files[0].name
    const record = this.certdocumentsArr.find((item: any) => {
      return item.DOC_NAME == this.certfileName
    })
    if (record) {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { text: 'This File Already Exists', active: this.call_modal };
      }, 0);
      this.certSpinner = false;
    }
    else {
      if (this.certDocSize + parseFloat(this.certfile.size) / 1024 / 1024 > 200) {
        setTimeout(() => {
          this.call_modal = true;
          this.data_send = { text: 'Document Size Limit Exceeded,You have total limit upto 200MB !', active: this.call_modal };
        }, 0);
        this.certSpinner = false;
        return;
      }
      this.service.uploadFile("UploadFDHLDocumnets", this.certfile, [], this.namespace, false, false)
        .then((resDocPath: any) => {
          this.certSpinner = false;
          this.certDocSize = this.certDocSize + parseFloat(this.certfile.size) / 1024 / 1024
          this.certdocumentsArr.push({
            'DOC_NAME': this.service.datavalidate(this.certfileName),
            "DOC_PATH": resDocPath,
            'UPLOADER_ID': this.loginUserID,
            'UPLOADED_ON': this.datepipe.transform(new Date(), 'dd-MM-yyyy'),
            'DOC_TYPE': 'Certificates',
            'DOC_SIZE': e.target.files[0].size / 1024 / 1024
          })
          this.certfileUploadDoc = ''
        }).catch(error => {
          this.certSpinner = false;
        });
    }
  }
  repfile: any;
  repfileName: any;
  repfileUploadDoc: any;
  repdocumentsArr: any = []
  repDocSize: number = 0;
  repSpinner: boolean = false;
  repUploadFile() {
    $("#repfileUploadDoc").click();
  }
  repUploadFileDoc(e: any) {
    this.repSpinner = true;
    this.call_modal = false;
    this.repfile = e.target.files[0]
    this.repfileName = e.target.files[0].name
    const record = this.repdocumentsArr.find((item: any) => {
      return item.DOC_NAME == this.repfileName
    })
    if (record) {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { text: 'This File Already Exists', active: this.call_modal };
      }, 0);
      this.repSpinner = false;
    }
    else {
      if (this.certDocSize + parseFloat(this.repfile.size) / 1024 / 1024 > 200) {
        setTimeout(() => {
          this.call_modal = true;
          this.data_send = { text: 'Document Size Limit Exceeded,You have total limit upto 200MB !', active: this.call_modal };
        }, 0);
        this.repSpinner = false;
        return;
      }
      this.service.uploadFile("UploadFDHLDocumnets", this.repfile, [], this.namespace, false, false)
        .then((resDocPath: any) => {
          this.repSpinner = false;
          this.certDocSize = this.certDocSize + parseFloat(this.repfile.size) / 1024 / 1024
          this.repdocumentsArr.push({
            'DOC_NAME': this.service.datavalidate(this.repfileName),
            "DOC_PATH": resDocPath,
            'UPLOADER_ID': this.loginUserID,
            'UPLOADED_ON': this.datepipe.transform(new Date(), 'dd-MM-yyyy'),
            'DOC_TYPE': 'Reports',
            'DOC_SIZE': e.target.files[0].size / 1024 / 1024
          })
          this.repfileUploadDoc = ''
        }).catch((err) => {
          this.repSpinner = false;
        })
    }
  }
  appfile: any;
  appfileName: any;
  appfileUploadDoc: any;
  appdocumentsArr: any = []
  appDocSize: number = 0;
  appSpinner: boolean = false;
  appUploadFile() {
    $("#appfileUploadDoc").click();
  }
  appUploadFileDoc(e: any) {
    this.appSpinner = true;
    this.call_modal = false;
    this.appfile = e.target.files[0]
    this.appfileName = e.target.files[0].name
    const record = this.appdocumentsArr.find((item: any) => {
      return item.DOC_NAME == this.appfileName
    })
    if (record) {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { text: 'This File Already Exists', active: this.call_modal };
      }, 0);
      this.appSpinner = false;
    }
    else {
      if (this.certDocSize + parseFloat(this.appfile.size) / 1024 / 1024 > 200) {
        setTimeout(() => {
          this.call_modal = true;
          this.data_send = { text: 'Document Size Limit Exceeded,You have total limit upto 200MB !', active: this.call_modal };
        }, 0);
        this.appSpinner = false;
        return;
      }
      this.service.uploadFile("UploadFDHLDocumnets", this.appfile, [], this.namespace, false, false)
        .then((resDocPath: any) => {
          this.appSpinner = false;
          this.certDocSize = this.certDocSize + parseFloat(this.appfile.size) / 1024 / 1024
          this.appdocumentsArr.push({
            'DOC_NAME': this.service.datavalidate(this.appfileName),
            "DOC_PATH": resDocPath,
            'UPLOADER_ID': this.loginUserID,
            'UPLOADED_ON': this.datepipe.transform(new Date(), 'dd-MM-yyyy'),
            'DOC_TYPE': 'Approved',
            'DOC_SIZE': e.target.files[0].size / 1024 / 1024
          })
          this.appfileUploadDoc = ''
        }).catch((err) => {
          this.appSpinner = false;
        })
    }
  }
  drafile: any;
  drafileName: any;
  drafileUploadDoc: any;
  dradocumentsArr: any = []
  dragDocSize: number = 0;
  dragSpinner: boolean = false;
  draUploadFile() {
    $("#drafileUploadDoc").click();
  }
  draUploadFileDoc(e: any) {
    this.dragSpinner = true;
    this.call_modal = false;
    this.drafile = e.target.files[0]
    this.drafileName = e.target.files[0].name
    const record = this.dradocumentsArr.find((item: any) => {
      return item.DOC_NAME == this.drafileName
    })
    if (record) {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { text: 'This File Already Exists', active: this.call_modal };
      }, 0);
      this.dragSpinner = false;
    }
    else {
      if (this.certDocSize + parseFloat(this.drafile.size) / 1024 / 1024 > 200) {
        setTimeout(() => {
          this.call_modal = true;
          this.data_send = { text: 'Document Size Limit Exceeded,You have total limit upto 200MB !', active: this.call_modal };
        }, 0);
        this.dragSpinner = false;
        return;
      }
      this.service.uploadFile("UploadFDHLDocumnets", this.drafile, [], this.namespace, false, false)
        .then((resDocPath: any) => {
          this.dragSpinner = false;
          this.certDocSize = this.certDocSize + parseFloat(this.drafile.size) / 1024 / 1024
          this.dradocumentsArr.push({
            'DOC_NAME': this.service.datavalidate(this.drafileName),
            "DOC_PATH": resDocPath,
            'UPLOADER_ID': this.loginUserID,
            'UPLOADED_ON': this.datepipe.transform(new Date(), 'dd-MM-yyyy'),
            'DOC_TYPE': 'Drawings',
            'DOC_SIZE': e.target.files[0].size / 1024 / 1024
          })
          this.drafileUploadDoc = ''
        }).catch((err) => {
          this.dragSpinner = false;
        })
    }
  }
  invfile: any;
  invfileName: any;
  invfileUploadDoc: any;
  invdocumentsArr: any = []
  invDocSize: number = 0;
  invSpinner: boolean = false;
  invUploadFile() {
    $("#invfileUploadDoc").click();
  }
  invUploadFileDoc(e: any) {
    this.invSpinner = true;
    this.call_modal = false;
    this.invfile = e.target.files[0]
    this.invfileName = e.target.files[0].name
    const record = this.invdocumentsArr.find((item: any) => {
      return item.DOC_NAME == this.invfileName
    })
    if (record) {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { text: 'This File Already Exists', active: this.call_modal };
      }, 0);
      this.invSpinner = false;
    }
    else {
      if (this.certDocSize + parseFloat(this.invfile.size) / 1024 / 1024 > 200) {
        setTimeout(() => {
          this.call_modal = true;
          this.data_send = { text: 'Document Size Limit Exceeded,You have total limit upto 200MB !', active: this.call_modal };
        }, 0);
        this.invSpinner = false;
        return;
      }
      this.service.uploadFile("UploadFDHLDocumnets", this.invfile, [], this.namespace, false, false)
        .then((resDocPath: any) => {
          this.invSpinner = false;
          this.certDocSize = this.certDocSize + parseFloat(this.invfile.size) / 1024 / 1024
          this.invdocumentsArr.push({
            'DOC_NAME': this.service.datavalidate(this.invfileName),
            "DOC_PATH": resDocPath,
            'UPLOADER_ID': this.loginUserID,
            'UPLOADED_ON': this.datepipe.transform(new Date(), 'dd-MM-yyyy'),
            'DOC_TYPE': 'Invoice',
            'DOC_SIZE': e.target.files[0].size / 1024 / 1024
          })
          this.invfileUploadDoc = ''
        }).catch((err) => {
          this.invSpinner = false;
        })
    }
  }
  certDelete(i: number) {
    if (this.datavalidate(this.certdocumentsArr[i].DOC_REF_NO) != '') {
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete this File?', header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.gridDeleteFile(this.certdocumentsArr[i].DOC_REF_NO);
          this.certDocSize = this.certDocSize - parseFloat(this.certdocumentsArr[i].DOC_SIZE)
          this.certdocumentsArr.splice(i, 1)
        },
        reject: () => { }
      });
    } else {
      this.certDocSize = this.certDocSize - parseFloat(this.certdocumentsArr[i].DOC_SIZE)
      this.certdocumentsArr.splice(i, 1)
    }
  }
  repDelete(i: number) {
    if (this.datavalidate(this.repdocumentsArr[i].DOC_REF_NO) != '') {
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete this File?', header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.gridDeleteFile(this.repdocumentsArr[i].DOC_REF_NO);
          this.certDocSize = this.certDocSize - parseFloat(this.repdocumentsArr[i].DOC_SIZE)
          this.repdocumentsArr.splice(i, 1)
        },
        reject: () => { }
      });
    } else {
      this.certDocSize = this.certDocSize - parseFloat(this.repdocumentsArr[i].DOC_SIZE)
      this.repdocumentsArr.splice(i, 1)
    }
  }
  appDelete(i: number) {
    if (this.datavalidate(this.appdocumentsArr[i].DOC_REF_NO) != '') {
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete this File?', header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.gridDeleteFile(this.appdocumentsArr[i].DOC_REF_NO);
          this.certDocSize = this.certDocSize - parseFloat(this.appdocumentsArr[i].DOC_SIZE)
          this.appdocumentsArr.splice(i, 1)
        },
        reject: () => { }
      });
    } else {
      this.certDocSize = this.certDocSize - parseFloat(this.appdocumentsArr[i].DOC_SIZE)
      this.appdocumentsArr.splice(i, 1)
    }
  }
  draDelete(i: number) {
    if (this.datavalidate(this.dradocumentsArr[i].DOC_REF_NO) != '') {
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete this File?', header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.gridDeleteFile(this.dradocumentsArr[i].DOC_REF_NO);
          this.certDocSize = this.certDocSize - parseFloat(this.dradocumentsArr[i].DOC_SIZE)
          this.dradocumentsArr.splice(i, 1)
        },
        reject: () => { }
      });
    } else {
      this.certDocSize = this.certDocSize - parseFloat(this.dradocumentsArr[i].DOC_SIZE)
      this.dradocumentsArr.splice(i, 1)
    }
  }
  invDelete(i: number) {
    if (this.datavalidate(this.invdocumentsArr[i].DOC_REF_NO) != '') {
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete this File?', header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.gridDeleteFile(this.invdocumentsArr[i].DOC_REF_NO);
          this.certDocSize = this.certDocSize - parseFloat(this.invdocumentsArr[i].DOC_SIZE)
          this.invdocumentsArr.splice(i, 1)
        },
        reject: () => { }
      });
    } else {
      this.certDocSize = this.certDocSize - parseFloat(this.invdocumentsArr[i].DOC_SIZE)
      this.invdocumentsArr.splice(i, 1)
    }
  }
  docSubmit: boolean = false;

  gridDocSave(arg: string) {
    this.service.spinner.next(true);
    this.call_modal = false;
    const concatArr = [this.certdocumentsArr, this.repdocumentsArr, this.appdocumentsArr, this.dradocumentsArr, this.invdocumentsArr].flat();
    let ParamTuple: {}[] = [];
    var params = {};
    for (var save of concatArr) {
      if (save.DOC_REF_NO == undefined || save.DOC_REF_NO == "") {
        params = {
          'new': {
            'FD_HL_DOC_DETAILS': {
              'HR_REF_NO': this.HR_REF_NO,
              'DOC_NAME': this.datavalidate(save.DOC_NAME),
              'DOC_PATH': this.datavalidate(save.DOC_PATH),
              "UPLOADER_ID": save.UPLOADER_ID,
              'DOC_TYPE': save.DOC_TYPE,
              'DOC_SIZE': save.DOC_SIZE
            }
          }
        };
      }
      else {
        params = {
          'old': {
            'FD_HL_DOC_DETAILS': {
              'DOC_REF_NO': save.DOC_REF_NO
            }
          },
          'new': {
            'FD_HL_DOC_DETAILS': {
              'DOC_NAME': this.datavalidate(save.DOC_NAME),
              'DOC_PATH': this.datavalidate(save.DOC_PATH),
              'DOC_TYPE': save.DOC_TYPE,
              'DOC_SIZE': save.DOC_SIZE
            }
          }
        }
      }
      ParamTuple.push(params);
    }
    var paramsAll = { 'tuple': ParamTuple };
    this.service.invokeService("UpdateFdHlDocDetails", paramsAll, this.namespace, true, false)
      .then((res: any) => {
        this.gridDocSplit(res)
        this.service.spinner.next(false);
        if (arg == 'complete') {
          this.completeTask(1, this.openAs, '');
        } else {
          setTimeout(() => {
            this.call_modal = true;
            this.data_send = { 'text': `Saved successfully `, active: this.call_modal };
          }, 0)
        }
      },
        (err: any) => {
          console.log("Error occured while saving Docdata ")
          this.service.spinner.next(false);
        })
  }

  gridDocSplit(doc: any) {
    this.certdocumentsArr = []
    this.repdocumentsArr = []
    this.appdocumentsArr = []
    this.dradocumentsArr = []
    this.invdocumentsArr = []

    doc.forEach((obj: any) => {
      switch (obj.DOC_TYPE) {
        case 'Certificates':
          this.certdocumentsArr.push(obj)
          break;
        case 'Reports':
          this.repdocumentsArr.push(obj)
          break;
        case 'Approved':
          this.appdocumentsArr.push(obj)
          break;
        case 'Drawings':
          this.dradocumentsArr.push(obj)
          break;
        case 'Invoice':
          this.invdocumentsArr.push(obj)
          break;
        default:
          break;
      }
    })
  }
  gridDeleteFile(i: number) {
    this.call_modal = false;
    let dataObj = {
      tuple: {
        old: {
          FD_HL_DOC_DETAILS: {
            DOC_REF_NO: i,
          }
        }
      }
    }
    this.service.invokeService("UpdateFdHlDocDetails", dataObj, this.namespace, true, false).
      then((ajaxResponse: any) => {
        // this.getFD_HLDocDetailsByHR_RefNo(this.HR_REF_NO);
        setTimeout(() => {
          this.call_modal = true;
          this.data_send = { text: 'File Deleted Successfull', active: this.call_modal };
        }, 0);
      })
  }

  createRequestForm = this.fb.group({
    LOCATION: ['Domestic', Validators.required],
    CERTIFICATION_TYPE: ['', Validators.required],
    ENGINE_FAMILY_NO: ['', Validators.required],
    WBS: ['', Validators.required],
    COST_CENTER: ['', Validators.required],
    ARAI: [''],
    APEX: ['']
  })

  gridDocValid(arg: string) {
    if (arg != 'docsave') {
      this.docSubmit = true;
      if (this.datavalidate(this.createRequestForm.controls['ARAI'].value) == '' || this.datavalidate(this.createRequestForm.controls['APEX'].value) == '') {
        return true;
      }
      if (this.certdocumentsArr.length == 0 || this.repdocumentsArr.length == 0 || this.appdocumentsArr.length == 0 || this.dradocumentsArr.length == 0 || this.invdocumentsArr.length == 0) {
        return true
      }
    }
    return false;
  }

  saveARAI(arg: string) {
    this.ARAITrue = true
    // this.isSubmitted1 = true;
    this.call_modal = false;
    if (this.gridDocValid(arg)) {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { text: 'Please enter all mandatory fields', active: this.call_modal, };
      }, 0);
      return;
    }
    let dataObj = {}
    if (this.datavalidate(this.HR_REF_NO) != '') {
      dataObj = {
        tuple: {
          old: {
            FD_HL_REQUEST_DETAILS: {
              HR_REF_NO: this.HR_REF_NO
            }
          },
          new: {
            FD_HL_REQUEST_DETAILS: {
              'ARAI_NO': this.datavalidate(this.createRequestForm.controls['ARAI'].value),
              'APEX_NO': this.datavalidate(this.createRequestForm.controls['APEX'].value),
              'CURRENT_STAGE': this.actStage,
              'REMARKS': this.remarks
            }
          }
        }
      }
    }
    this.service.invokeService("UpdateFdHlRequestDetails", dataObj, this.namespace, true, false)
      .then((res: any) => {
        this.gridDocSave(arg);
      })
  }
  coverLetterObj: any = {};
  table12Obj: any = {};
  receiveData(obj: any) {
    this.coverLetterObj = obj;
  }
  receiveData1(obj: any) {
    this.table12Obj = obj;
  }
  valid: boolean = false;
  isValid() {
    this.valid = false;
    if (true) {
      if (this.datavalidate(this.createRequestForm.controls['WBS'].value) == '' && this.saveType != 'clone' ||
        this.datavalidate(this.createRequestForm.controls['COST_CENTER'].value) == '' && this.saveType != 'clone') {
        this.valid = true;
      }
      if (this.routeName == 'clone' && this.CLONE_REQUEST_NO == '') {
        this.valid = true;
      }
      if (this.saveType != 'clone') {
        if (this.coverLetterObj.enclosureArr.length == 0) {
          this.valid = true;
          this.service.callTable4G.next('covering');
        } else {
          for (let obj of this.coverLetterObj.enclosureArr) {
            if (this.datavalidate(this.coverLetterObj.CL_CONTENT) == '' || this.coverLetterObj.CL_TO == '' || this.datavalidate(obj.ENCLOSURE) == '') {
              this.valid = true;
              this.service.callTable4G.next('covering');
            }
          }
        }
      }
      if (this.saveType != 'clone' && this.datavalidate(this.createRequestForm.controls['CERTIFICATION_TYPE'].value) != 'Approval') {
        if (this.table12Obj.specArr.length == 0) {
          this.valid = true;
          this.service.callTable4G.next('table12');
        } else {
          if (this.datavalidate(this.table12Obj.MANUFACTURER) == '' || this.table12Obj.CMVR_CERTIFICATE_NO == '' || this.datavalidate(this.table12Obj.CMVR_CERTIFICATE_DATE) == '' ||
            this.datavalidate(this.table12Obj.SPECIFICATION_NO) == '' || this.datavalidate(this.table12Obj.EXTENSION_DATE) == '' || this.datavalidate(this.table12Obj.EXTENSION_SPEC_REV) == ''
            || this.datavalidate(this.table12Obj.NATURE_OF_CHANGE) == '') {
            this.valid = true;
            this.service.callTable4G.next('table12');
          } else {
            for (let obj of this.table12Obj.specArr) {
              if (this.datavalidate(obj.ENGINE_MODEL_NAME) == '' || this.datavalidate(obj.SPEC_NO) == '' || this.datavalidate(obj.DESCRIPTION) == '' || this.datavalidate(obj.PARAMETER_EARLIER) == '' || this.datavalidate(obj.PARAMETER_NEW_EXTENSION) == '') {
                this.valid = true;
                this.service.callTable4G.next('table12');
              }
            }
          }
        }
      }
      if (this.saveType != 'clone') {
        for (var obj of this.anexureArr) {
          if (obj.MANDATORY == 'Yes' && (this.datavalidate(obj.ATTR_VALUE) == '' && this.datavalidate(obj.ANNEXURE_PATH) == '')) {
            this.valid = true;
            this.footerSubm = true;
          }
        }
      }
      if (this.saveType != 'clone' && (this.emisionComplaince == 'TR4' || this.emisionComplaince == 'CE4')) {
        for (let i = 0; i < this.variantsArr.length; i++) {
          for (var obj of this.variantsArr[i].Table12Arr) {
            if (obj.MANDATORY == 'Yes' && (this.datavalidate(obj.ATTR_VALUE) == '' && this.datavalidate(obj.ANNEXURE_PATH) == '' && (this.emisionComplaince == 'TR4' || this.emisionComplaince == 'CE4'))) {
              this.valid = true;
              this.service.callTable4G.next('table4g');
            }
          }
          for (let obj1 of this.variantsArr[i].Mode) {
            for (let obj2 of obj1.innerArr) {
              if (this.datavalidate(obj2.ENGINE_SPEED) == '' || this.datavalidate(obj2.GROSS_POWER) == '') {
                this.valid = true;
                this.service.callTable4G.next('table4g');
              }
            }
          }
        }
      }
      if (this.saveType != 'clone' && (this.emisionComplaince == 'B3A' || this.emisionComplaince == 'CE3')) {
        for (let i = 0; i < this.variantsArr1.length; i++) {
          for (var obj of this.variantsArr1[i].Table12Arr1) {
            if (obj.MANDATORY == 'Yes' && (this.datavalidate(obj.ATTR_VALUE) == '' && this.datavalidate(obj.ANNEXURE_PATH) == '' && (this.emisionComplaince == 'B3A' || this.emisionComplaince == 'CE3'))) {
              this.valid = true;
              this.service.callTable4G.next('chapter2');
              //return;
            }
          }
          for (let obj1 of this.variantsArr1[i].Measurment) {
            if (this.datavalidate(obj1.ENGINE_SPEED) == '' || this.datavalidate(obj1.GROSS_POWER) == '') {
              this.valid = true;
              this.service.callTable4G.next('chapter2');
            }
          }
        }
      }
    } else {
      this.valid = false;
    }
    return this.valid;
  }
  footerSubm: boolean = false;
  saveValid() {
    if (this.datavalidate(this.createRequestForm.controls['LOCATION'].value) == '' || this.datavalidate(this.createRequestForm.controls['CERTIFICATION_TYPE'].value) == '' ||
      this.datavalidate(this.createRequestForm.controls['ENGINE_FAMILY_NO'].value) == '' || this.variantsArr.length == 0) {
      return true;
    }
    if ((this.datavalidate(this.regards) == '' || this.datavalidate(this.DOCUMENT_NO) == '') && this.saveType == 'submit') {
      this.footerSubm = true;
      return true;
    }
    return false;
  }

  saveType: string = '';
  isSaveSubm: boolean = false;
  DOCUMENT_NO: string = '';
  savemsg:string = '';
  async saveDetails(arg: string) {
    this.saveType = arg;
    let dataObj = {};
    this.call_modal = false;
    if (this.isvarientCheck() && this.createRequestForm.controls['ENGINE_FAMILY_NO'].value) {
      return;
    }
    if (this.saveValid()) {
      this.isSaveSubm = true;
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { 'text': 'Please Enter All Mandatory Fields', active: this.call_modal };
      }, 0);
      return;
    }
    if (this.documentsArr.length == 0 && arg == 'submit') {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { 'text': 'Please upload at least one document', active: this.call_modal };
      }, 0);
      return;
    }
    if (arg == 'submit' || arg == 'clone') {
      this.isSubmitted = arg == 'submit' ? true : false;
      if (await this.validTypeApproval()) {
        return;
      }
      if (this.isValid()) {
        setTimeout(() => {
          this.call_modal = true;
          this.data_send = { 'text': 'Please Enter All Mandatory Fields', active: this.call_modal };
        }, 0);
        return;
      }
    }

    if (this.isRemarksValid(7) && this.datavalidate(this.taskId) != '' && this.saveType == 'submit') {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { text: 'Please enter remarks', active: this.call_modal };
      }, 0);
      return;
    } else {
      this.remarkSubmit = false;
    }

    if (arg == 'submit' || arg == 'clone') {
      var msg = arg == 'submit' ? ' Are you sure you want to submit this data?' :
        arg == 'clone' ? ' Are you sure you want to Create New Request' : ''
      this.confirmationService.confirm({
        message: msg, header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
        accept: () => {
          if (this.datavalidate(this.HR_REF_NO) != '') {
            dataObj = {
              tuple: {
                old: {
                  FD_HL_REQUEST_DETAILS: {
                    HR_REF_NO: this.HR_REF_NO
                  }
                },
                new: {
                  FD_HL_REQUEST_DETAILS: {
                    'LOCATION': this.datavalidate(this.createRequestForm.controls['LOCATION'].value),
                    'CERTIFICATION_TYPE': this.datavalidate(this.createRequestForm.controls['CERTIFICATION_TYPE'].value),
                    'ENGINE_FAMILY_NO': this.datavalidate(this.createRequestForm.controls['ENGINE_FAMILY_NO'].value),
                    'WBS': this.datavalidate(this.createRequestForm.controls['WBS'].value),
                    'COST_CENTER': this.datavalidate(this.createRequestForm.controls['COST_CENTER'].value),
                    'REQUEST_NO': this.routeName == 'clone' ? this.newREQUEST_NO : this.REQUEST_NO,
                    'CLONE_REQUEST_NO': this.routeName == 'clone' ? this.CLONE_REQUEST_NO : '',
                    'REMARKS': this.remarks,
                    'CURRENT_STAGE': this.actStage,
                    'SIGNATURE': this.regardsArr[0].data,
                    'REGA_NAME': this.regardsArr[1].data,
                    'DESIGNATION': this.regardsArr[2].data,
                    'DEPARTMENT': this.regardsArr[3].data,
                    'COMPANY_NAME': this.regardsArr[4].data,
                    'HR_REGARDS': this.regards,
                    'DOCUMENT_NO': this.DOCUMENT_NO,
                    'REQUEST_DATE': arg == 'submit' ? this.datepipe.transform(new Date(), 'yyyy-MM-dd') : ''
                  }
                }
              }
            }
          }
          else {
            dataObj = {
              tuple: {
                new: {
                  FD_HL_REQUEST_DETAILS: {
                    'HR_REF_NO': '',
                    'LOCATION': this.datavalidate(this.createRequestForm.controls['LOCATION'].value),
                    'CERTIFICATION_TYPE': this.datavalidate(this.createRequestForm.controls['CERTIFICATION_TYPE'].value),
                    'ENGINE_FAMILY_NO': this.datavalidate(this.createRequestForm.controls['ENGINE_FAMILY_NO'].value),
                    'WBS': this.datavalidate(this.createRequestForm.controls['WBS'].value),
                    'COST_CENTER': this.datavalidate(this.createRequestForm.controls['COST_CENTER'].value),
                    'INITIATOR_ID': this.loginUserID,
                    'INITIATION_DATE': this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
                    'PROCESS_STATUS': '0',
                    'CLONE_REQUEST_NO': this.routeName == 'clone' ? this.CLONE_REQUEST_NO : '',
                    'REMARKS': this.remarks,
                    'CHAPTER2_REVISION': this.reguChapter2,
                    'CL_REVISION': this.reguCovering,
                    'TABLE4G_REVISION': this.reguTable4G,
                    'TABLE12_REVISION': this.reguTable12,
                    'CURRENT_STAGE': this.actStage,
                    'SIGNATURE': this.regardsArr[0].data,
                    'REGA_NAME': this.regardsArr[1].data,
                    'DESIGNATION': this.regardsArr[2].data,
                    'DEPARTMENT': this.regardsArr[3].data,
                    'COMPANY_NAME': this.regardsArr[4].data,
                    'HR_REGARDS': this.regards,
                    'DOCUMENT_NO': this.DOCUMENT_NO,
                    'REQUEST_DATE': arg == 'submit' ? this.datepipe.transform(new Date(), 'yyyy-MM-dd') : ''
                  }
                }
              }
            }
          }
          this.service.spinner.next(true);
          this.service.invokeService("UpdateFdHlRequestDetails", dataObj, this.namespace, true, false)
            .then((res: any) => {
              this.HR_REF_NO = res[0].HR_REF_NO
              let obj = { 'HR_REF_NO': this.HR_REF_NO, 'actRole': this.actRole, 'actStage': this.actStage }
              this.service.sharingData(obj, 'HR_REF_NO');
              this.service.SaveUpdateHRNo.next(this.HR_REF_NO);
              this.service.createPageEvents.next('');
              this.REQUEST_NO = res[0].REQUEST_NO
              this.newREQUEST_NO = res[0].REQUEST_NO;
              this.saveVariants();
              this.saveAnnexure('');
            },
              (err) => {
                console.log('Error occured! While saving the data')
                this.service.spinner.next(false);
              })
        },
        reject: () => {

        }
      });
    } else if (arg == 'save') {
      if (this.datavalidate(this.HR_REF_NO) != '') {
        this.savemsg = 'Request Updated Successfully';
        dataObj = {
          tuple: {
            old: {
              FD_HL_REQUEST_DETAILS: {
                HR_REF_NO: this.HR_REF_NO
              }
            },
            new: {
              FD_HL_REQUEST_DETAILS: {
                'LOCATION': this.datavalidate(this.createRequestForm.controls['LOCATION'].value),
                'CERTIFICATION_TYPE': this.datavalidate(this.createRequestForm.controls['CERTIFICATION_TYPE'].value),
                'ENGINE_FAMILY_NO': this.datavalidate(this.createRequestForm.controls['ENGINE_FAMILY_NO'].value),
                'WBS': this.datavalidate(this.createRequestForm.controls['WBS'].value),
                'COST_CENTER': this.datavalidate(this.createRequestForm.controls['COST_CENTER'].value),
                'REQUEST_NO': this.routeName == 'clone' ? this.newREQUEST_NO : this.REQUEST_NO,
                'CLONE_REQUEST_NO': this.routeName == 'clone' ? this.CLONE_REQUEST_NO : '',
                'REMARKS': this.remarks,
                'CURRENT_STAGE': this.actStage,
                'SIGNATURE': this.regardsArr[0].data,
                'REGA_NAME': this.regardsArr[1].data,
                'DESIGNATION': this.regardsArr[2].data,
                'DEPARTMENT': this.regardsArr[3].data,
                'COMPANY_NAME': this.regardsArr[4].data,
                'HR_REGARDS': this.regards,
                'DOCUMENT_NO': this.DOCUMENT_NO,
                'REQUEST_DATE': ''
              }
            }
          }
        }
      }
      else {
        this.savemsg = 'New Request Created Successfully';
        dataObj = {
          tuple: {
            new: {
              FD_HL_REQUEST_DETAILS: {
                'HR_REF_NO': '',
                'LOCATION': this.datavalidate(this.createRequestForm.controls['LOCATION'].value),
                'CERTIFICATION_TYPE': this.datavalidate(this.createRequestForm.controls['CERTIFICATION_TYPE'].value),
                'ENGINE_FAMILY_NO': this.datavalidate(this.createRequestForm.controls['ENGINE_FAMILY_NO'].value),
                'WBS': this.datavalidate(this.createRequestForm.controls['WBS'].value),
                'COST_CENTER': this.datavalidate(this.createRequestForm.controls['COST_CENTER'].value),
                'INITIATOR_ID': this.loginUserID,
                'INITIATION_DATE': this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
                'PROCESS_STATUS': '0',
                'CLONE_REQUEST_NO': this.routeName == 'clone' ? this.CLONE_REQUEST_NO : '',
                'REMARKS': this.remarks,
                'CHAPTER2_REVISION': this.reguChapter2,
                'CL_REVISION': this.reguCovering,
                'TABLE4G_REVISION': this.reguTable4G,
                'TABLE12_REVISION': this.reguTable12,
                'CURRENT_STAGE': this.actStage,
                'SIGNATURE': this.regardsArr[0].data,
                'REGA_NAME': this.regardsArr[1].data,
                'DESIGNATION': this.regardsArr[2].data,
                'DEPARTMENT': this.regardsArr[3].data,
                'COMPANY_NAME': this.regardsArr[4].data,
                'HR_REGARDS': this.regards,
                'DOCUMENT_NO': this.DOCUMENT_NO,
                'REQUEST_DATE': ''
              }
            }
          }
        }
      }
      this.service.spinner.next(true);
      this.service.invokeService("UpdateFdHlRequestDetails", dataObj, this.namespace, true, false)
        .then((res: any) => {
          this.HR_REF_NO = res[0].HR_REF_NO
          this.service.SaveUpdateHRNo.next( this.HR_REF_NO);
          let obj = { 'HR_REF_NO': this.HR_REF_NO, 'actRole': this.actRole, 'actStage': this.actStage }
          this.service.sharingData(obj, 'HR_REF_NO');
          this.service.createPageEvents.next('');
          this.REQUEST_NO = res[0].REQUEST_NO
          this.newREQUEST_NO = res[0].REQUEST_NO;
          this.saveVariants();
          this.saveAnnexure('');
        },
          (err) => {
            console.log('Error occured! While saving the data')
            this.service.spinner.next(false);
          })
    }
  }

  saveFooter() {
    this.call_modal = false;
    var dataObj = {
      tuple: {
        old: {
          FD_HL_REQUEST_DETAILS: {
            HR_REF_NO: this.HR_REF_NO
          }
        },
        new: {
          FD_HL_REQUEST_DETAILS: {
            'SIGNATURE': this.regardsArr[0].data,
            'REGA_NAME': this.regardsArr[1].data,
            'DESIGNATION': this.regardsArr[2].data,
            'DEPARTMENT': this.regardsArr[3].data,
            'COMPANY_NAME': this.regardsArr[4].data,
            'HR_REGARDS': this.regards,
            'DOCUMENT_NO': this.DOCUMENT_NO,
            // 'REQUEST_DATE' : this.datepipe.transform(new Date(), 'yyyy-MM-dd')
          }
        }
      }
    }
    this.service.invokeService("UpdateFdHlRequestDetails", dataObj, this.namespace, true, false)
      .then((res: any) => {
        setTimeout(() => {
          this.call_modal = true;
          this.data_send = { 'text': 'Footer Configuration Data Updated Successfully', active: this.call_modal };
        }, 0);
      })
  }
  footerClear() {
    this.regards = '';
    this.DOCUMENT_NO = '';
    let obj = { target: { value: '' } };
    this.selectRegards(obj);
  }
  newREQUEST_NO: string = '';
  saveDocuments() {
    let ParamTuple: {}[] = [];
    var params = {};
    for (var save of this.documentsArr) {
      if (save.DOC_REF_NO == undefined || save.DOC_REF_NO == "") {
        params = {
          'new': {
            'FD_HL_DOC_DETAILS': {
              'HR_REF_NO': this.HR_REF_NO,
              'DOC_NAME': this.datavalidate(save.DOC_NAME),
              'DOC_PATH': this.datavalidate(save.DOC_PATH),
              "UPLOADER_ID": save.UPLOADERNAME,
              'DOC_REMARKS': save.DOC_REMARKS,
              'DOC_TYPE': save.DOC_TYPE,
              'DOC_SIZE': save.DOC_SIZE
            }
          }
        };
      }
      else {
        params = {
          'old': {
            'FD_HL_DOC_DETAILS': {
              'DOC_REF_NO': save.DOC_REF_NO
            }
          },
          'new': {
            'FD_HL_DOC_DETAILS': {
              'DOC_NAME': this.datavalidate(save.DOC_NAME),
              'DOC_PATH': this.datavalidate(save.DOC_PATH),
              // "UPLOADER_ID": save.UPLOADERNAME,
              'DOC_REMARKS': save.DOC_REMARKS,
              'DOC_TYPE': save.DOC_TYPE,
              'DOC_SIZE': save.DOC_SIZE
            }
          }
        }
      }
      ParamTuple.push(params);
    }
    var paramsAll = { 'tuple': ParamTuple };
    this.service.invokeService("UpdateFdHlDocDetails", paramsAll, this.namespace, true, false)
      .then((res: any) => {
        this.service.spinner.next(false);
        if (this.saveType == 'submit') {
          if (this.datavalidate(this.taskId) == '') {
            let param = {
              'HR_REF_NO': this.HR_REF_NO,
              'INITIATED_BY': this.loginUserID,
              'REMARKS': this.remarks
            };
            this.service.invokeService("FD_HL_MainProcess", param, "http://schemas.cordys.com/default", true, false).
              then((res: any) => {
                // let dObj = {HR_REF_NO:this.HR_REF_NO}
                // this.service.invokeService("SendFD_HLCustomRequestorMail", dObj, this.namespace, true, false)
                // .then((res: any) => {
                // })
                setTimeout(() => {
                  let modal_from = this.saveType == 'save' ? '' : this.saveType == 'submit' ? 'task' : ''
                  this.call_modal = true;
                  this.data_send = { text: `Request Submitted Successfully`, 'text1': `Request ID`, 'text2': `${this.REQUEST_NO}`, active: this.call_modal, from: modal_from };
                }, 0);
              })
          } else {
            this.completeTask(7, this.openAs, '');
          }
        } else if (this.saveType == 'save') {
          setTimeout(() => {
            let modal_from = this.saveType == 'save' ? '' : this.saveType == 'submit' ? 'task' : ''
            this.call_modal = true;
            this.data_send = { text: this.savemsg, 'text1': `Request ID`, 'text2': `${this.REQUEST_NO}`, active: this.call_modal, from: modal_from };
          }, 0);
        }
        if (res) {
          this.documentsArr = [];
          this.getFD_HLDocDetailsByHR_RefNo(this.HR_REF_NO);
        }
      },
        (err: any) => {
          console.log("Error occured while saving Docdata ")
          this.service.spinner.next(false);
        })
  }

  deleteFile() {
    this.call_modal = false;
    this.confirmationService.confirm({
      message: 'Are you sure  you want to delete this File?', header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
      accept: () => {
        for (let i = 0; i < this.checkedRows.length; i++) {
          this.initValue = this.initValue - parseFloat(this.checkedRows[i].DOC_SIZE)
          if (this.service.datavalidate(this.checkedRows[i].DOC_REF_NO) != "") {
            let dataObj = {
              tuple: {
                old: {
                  FD_HL_DOC_DETAILS: {
                    DOC_REF_NO: this.checkedRows[i].DOC_REF_NO,
                  }
                }
              }
            }
            this.service.invokeService("UpdateFdHlDocDetails", dataObj, this.namespace, true, false).
              then((ajaxResponse: any) => {
                this.documentsArr = this.documentsArr.filter((val: any) => {
                  return this.checkedRows.indexOf(val) === -1;
                })
                this.checkedRows = [];
                setTimeout(() => {
                  this.call_modal = true;
                  this.data_send = { text: 'File Deleted Successfull', active: this.call_modal };
                }, 0);
              })
          } else {
            this.documentsArr = this.documentsArr.filter((val: any) => {
              return this.checkedRows.indexOf(val) === -1;
            })
            this.checkedRows.forEach((d: any) => {
              if (d.DOC_REF_NO == '') {
                this.checkedRows.splice(this.checkedRows.indexOf(d), 1)
              }
            })
          }
        }
      },
      reject: () => { }
    });
  }

  isRemarksValid(arg: number) {
    if (arg == 0 && this.datavalidate(this.remarks) == '' || arg == 3 && this.datavalidate(this.remarks) == '' || 
    arg == 4 && this.datavalidate(this.remarks) == '' || arg == 7 && this.datavalidate(this.remarks) == '') {
      this.remarkSubmit = true;
      return true;
    } else {
      return false;
    }
  }

  completeTask(decision: number, openas: string, remarks: string) {
    this.call_modal = false;
    if (this.isRemarksValid(decision)) {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { text: 'Please enter remarks', active: this.call_modal };
      }, 0);
      return;
    }
    let data = {
      "FD_HL_OPSchemaFragment":
      {
        ApproverDecision: decision,
        ApprovedBy: this.loginUserID,
        Remarks: this.remarks
      }
    };
    this.call_modal = false;
    var titlest = decision == 1 ? "Task Completed Successfully" : decision == 0 ? "Task Seek Clarification Successfully" :
      decision == 7 ? "Task Submitted Successfully" : decision == 4 ? "Task Obsoleted Successfully" : decision == 3 ? "Task Rejected Successfully" : "";
    let _this = this;
    $.cordys.workflow.completeTask(this.taskId, data, { dataType: 'xml' }).done(() => {
      setTimeout(() => {
        this.call_modal = true;
        this.data_send = { text: titlest, active: this.call_modal, from: 'task' };
      }, 0);
      // _this.closeTask(openas);
    });
  }

  closeTask(openas: string) {
    this.actStage = "view";
    if (openas == 'customInboxTask') {
      this.router.navigate(['/inbox']);
    }

    else if (openas == 'mail') {
      window.close();
    }

    else {

    }
  }

  variantNamesStr(){
    let tempArr:any = [];
    this.nameArrStr = '';
    if (this.emisionComplaince == 'TR4' || this.emisionComplaince == 'CE4') {
      this.variantsArr.forEach((data:any)=>{
        if(data.HRV_REF_NO !=''){
          tempArr.push(data.LOV_DESC);
        }
       })
       this.nameArrStr = tempArr.toString();
    } else if (this.emisionComplaince == 'B3A' || this.emisionComplaince == 'CE3'){
      this.variantsArr.forEach((data:any)=>{
        if(data.HRV_REF_NO !=''){
          tempArr.push(data.LOV_DESC);
        }
       })
       this.nameArrStr = tempArr.toString();
    }
  }

  variantSelect(obj: any) {
    if (!obj.isChecked) {
      // this.idArr.splice(this.idArr.indexOf(obj.LOV_ID), 1)
      this.nameArr.splice(this.nameArr.indexOf(obj.VARIANT), 1)
      if (this.datavalidate(obj.HRV_REF_NO) == '') {
      } else {
        this.confirmationService.confirm({
          message: 'Probably loss the saved data. Do you want to proceed?', header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
          accept: () => {
            let param = {
              'HRV_REF_NO': obj.HRV_REF_NO,
              'HR_REF_NO': this.HR_REF_NO
            }
            this.service.invokeService("DeleteFDHLRequestVariant", param, this.namespace, true, false)
              .then((res: any) => {
                for (let item of this.engineVarient) {
                  if (item.HRV_REF_NO == obj.HRV_REF_NO && obj.HRV_REF_NO != '') {
                    this.HRV_REF_NOArr.splice(this.HRV_REF_NOArr.indexOf(obj.HRV_REF_NO), 1)
                    item.HRV_REF_NO = '';
                    item.isChecked = false;
                  }
                }
              })
          },
          reject: () => {
            obj.isChecked = true;
            this.nameArr.push(obj.VARIANT)
            let temp = { HRV_REF_NO: obj.HRV_REF_NO, LOV_DESC: obj.VARIANT, Table12Arr: [], Measurment: [], Mode: [{ innerArr: [] }] }
            let temp1 = { HRV_REF_NO: obj.HRV_REF_NO, LOV_DESC: obj.VARIANT, Table12Arr1: [], Measurment: [], Mode: [{ innerArr: [] }] }
            this.variantsArr.push(temp)
            this.variantsArr1.push(temp1)

            this.nameArrStr = [...new Set(this.nameArr)].toString();
            this.variantsArr = [...new Set(this.variantsArr)];
            this.variantsArr1 = [...new Set(this.variantsArr1)];
            setTimeout(() => {
              this.call4gc2();
            }, 0);
          }
        });
      }
      this.variantsArr.forEach((d: any) => {
        if (d.LOV_DESC == obj.VARIANT) {
          this.variantsArr.splice(this.variantsArr.indexOf(d), 1)
        }
      })
      this.variantsArr1.forEach((d1: any) => {
        if (d1.LOV_DESC == obj.VARIANT) {
          this.variantsArr1.splice(this.variantsArr1.indexOf(d1), 1)
        }
      })
    } else {
      // this.idArr.push(obj.VARIANT)
      this.nameArr.push(obj.VARIANT)
      let temp = { HRV_REF_NO: obj.HRV_REF_NO, LOV_DESC: obj.VARIANT, Table12Arr: [], Measurment: [], Mode: [{ innerArr: [] }] }
      let temp1 = { HRV_REF_NO: obj.HRV_REF_NO, LOV_DESC: obj.VARIANT, Table12Arr1: [], Measurment: [], Mode: [{ innerArr: [] }] }
      this.variantsArr.push(temp)
      this.variantsArr1.push(temp1)
    }
    // this.idArrStr = this.idArr.toString();
    this.nameArrStr = [...new Set(this.nameArr)].toString();
    this.variantsArr = [...new Set(this.variantsArr)];
    this.variantsArr1 = [...new Set(this.variantsArr1)];
    // this.getFdHlRequestManagement();
    // this.getFdHlRequestManagement1();
    this.ENGINE_FAMILY_NO_Arr.forEach((d: any) => {
      if (d.ENGINE_FAMILY_NO == this.createRequestForm.controls['ENGINE_FAMILY_NO'].value) {
        this.emisionComplaince = d.EMISSION_COMPLIANCE
      }
    })
    if (this.datavalidate(obj.HRV_REF_NO) == '' && obj.isChecked) {
      this.pushEmpty();
    }
  }

  pushEmpty() {
    this.Table12EmptyArr.forEach((d1: any) => {
      this.variantsArr[this.variantsArr.length - 1].Table12Arr.push({
        ATTR_VALUE: d1.ATTR_VALUE, ANNEXURE_EXT: d1.ANNEXURE_EXT, ANNEXURE_NAME: d1.ANNEXURE_NAME, ANNEXURE_PATH: d1.ANNEXURE_PATH, ATTR_DESC: d1.ATTR_DESC, ATTR_HIGHLIGHT: d1.ATTR_HIGHLIGHT,
        ATTR_NAME: d1.ATTR_NAME, ATTR_CHARACTERISTICS: d1.ATTR_CHARACTERISTICS, ATTR_REF_ID: d1.ATTR_REF_ID[0], AUDIT_TYPE: d1.AUDIT_TYPE, CREATED_BY: d1.CREATED_BY[0],
        CREATION_DATE: d1.CREATION_DATE[0], DOUMENT_NAME: d1.DOUMENT_NAME, HRM_REF_NO: d1.HRM_REF_NO, HRV_REF_NO: d1.HRV_REF_NO, HR_REF_NO: d1.HR_REF_NO, MANDATORY: d1.MANDATORY,
        REPORT_NAME: d1.REPORT_NAME, REPORT_REF_ID: d1.REPORT_REF_ID[0], REPORT_VERSION: d1.REPORT_VERSION, VISIBLE: d1.VISIBLE, MODIFIED_BY: d1.MODIFIED_BY[0], MODIFIED_DATE: d1.MODIFIED_DATE[0]
      })
    })
    this.chapter2EmptyArr.forEach((d1: any) => {
      this.variantsArr1[this.variantsArr1.length - 1].Table12Arr1.push({
        ATTR_VALUE: d1.ATTR_VALUE, ANNEXURE_EXT: d1.ANNEXURE_EXT, ANNEXURE_NAME: d1.ANNEXURE_NAME, ANNEXURE_PATH: d1.ANNEXURE_PATH, ATTR_DESC: d1.ATTR_DESC, ATTR_HIGHLIGHT: d1.ATTR_HIGHLIGHT,
        ATTR_NAME: d1.ATTR_NAME, ATTR_CHARACTERISTICS: d1.ATTR_CHARACTERISTICS, ATTR_REF_ID: d1.ATTR_REF_ID[0], AUDIT_TYPE: d1.AUDIT_TYPE, CREATED_BY: d1.CREATED_BY[0],
        CREATION_DATE: d1.CREATION_DATE[0], DOUMENT_NAME: d1.DOUMENT_NAME, HRM_REF_NO: d1.HRM_REF_NO, HRV_REF_NO: d1.HRV_REF_NO, HR_REF_NO: d1.HR_REF_NO, MANDATORY: d1.MANDATORY,
        REPORT_NAME: d1.REPORT_NAME, REPORT_REF_ID: d1.REPORT_REF_ID[0], REPORT_VERSION: d1.REPORT_VERSION, VISIBLE: d1.VISIBLE, MODIFIED_BY: d1.MODIFIED_BY[0], MODIFIED_DATE: d1.MODIFIED_DATE[0]
      });
    })
  }

  callReqManagement(arg: string) {
    if (this.emisionComplaince == 'TR4' || this.emisionComplaince == 'CE4') {
      // table4g
      let addParam = { HR_REF_NO: arg, REPORT_REF_ID: 3, atcStage: this.actStage };
      this.service.invokeService("GetFdHlAdditionalAttributes", addParam, this.namespace, true, false)
        .then((res: any) => {
          let params = { HR_REF_NO: arg, REPORT_REF_ID: 3 };
          this.service.invokeService("GetFdHlRequestManagement", params, this.namespace, true, false)
            .then((res: any) => {
              this.Table12Arr = res;
              this.getFdHlRequestManagement();
            })
        })
    } else if (this.emisionComplaince == 'B3A' || this.emisionComplaince == 'CE3') {
      // chapter2
      let addParam1 = { HR_REF_NO: arg, REPORT_REF_ID: 4, atcStage: this.actStage };
      this.service.invokeService("GetFdHlAdditionalAttributes", addParam1, this.namespace, true, false)
        .then((res: any) => {
          let params1 = { HR_REF_NO: arg, REPORT_REF_ID: 4 };
          this.service.invokeService("GetFdHlRequestManagement", params1, this.namespace, true, false)
            .then((res: any) => {
              this.chapter2Arr = res;
              this.getFdHlRequestManagement1();
            })
        })
    }
  }

  Table12EmptyArr = [];
  chapter2EmptyArr = [];
  async callReqManagementEmpty() {
    let params = { HR_REF_NO: '', REPORT_REF_ID: 3 };
    await this.service.invokeService("GetFdHlRequestManagement", params, this.namespace, true, false)
      .then((res: any) => {
        this.Table12EmptyArr = res;
      })
    let params1 = { HR_REF_NO: '', REPORT_REF_ID: 4 };
    await this.service.invokeService("GetFdHlRequestManagement", params1, this.namespace, true, false)
      .then((res: any) => {
        this.chapter2EmptyArr = res;
      })
  }


  Table12Arr: any = [];
  async getFdHlRequestManagement() {
    this.variantsArr.forEach((d: any) => {
      d.Table12Arr = [];
      if (this.datavalidate(d.HRV_REF_NO) == '') {
        this.Table12EmptyArr.forEach((d1: any) => {
          d.Table12Arr.push({
            ATTR_VALUE: d1.ATTR_VALUE, ANNEXURE_EXT: d1.ANNEXURE_EXT, ANNEXURE_NAME: d1.ANNEXURE_NAME, ANNEXURE_PATH: d1.ANNEXURE_PATH, ATTR_DESC: d1.ATTR_DESC, ATTR_HIGHLIGHT: d1.ATTR_HIGHLIGHT,
            ATTR_NAME: d1.ATTR_NAME, ATTR_CHARACTERISTICS: d1.ATTR_CHARACTERISTICS, ATTR_REF_ID: d1.ATTR_REF_ID[0], AUDIT_TYPE: d1.AUDIT_TYPE, CREATED_BY: d1.CREATED_BY[0],
            CREATION_DATE: d1.CREATION_DATE[0], DOUMENT_NAME: d1.DOUMENT_NAME, HRM_REF_NO: d1.HRM_REF_NO, HRV_REF_NO: d1.HRV_REF_NO, HR_REF_NO: d1.HR_REF_NO, MANDATORY: d1.MANDATORY,
            REPORT_NAME: d1.REPORT_NAME, REPORT_REF_ID: d1.REPORT_REF_ID[0], REPORT_VERSION: d1.REPORT_VERSION, VISIBLE: d1.VISIBLE, MODIFIED_BY: d1.MODIFIED_BY[0], MODIFIED_DATE: d1.MODIFIED_DATE[0]
          });
        })
      }
      if (this.datavalidate(d.HRV_REF_NO) != '') {
        this.Table12Arr.forEach((d1: any) => {
          if (d.HRV_REF_NO == this.datavalidate(d1.HRV_REF_NO)) {
            d.Table12Arr.push({
              ATTR_VALUE: d1.ATTR_VALUE, ANNEXURE_EXT: d1.ANNEXURE_EXT, ANNEXURE_NAME: d1.ANNEXURE_NAME, ANNEXURE_PATH: d1.ANNEXURE_PATH, ATTR_DESC: d1.ATTR_DESC, ATTR_HIGHLIGHT: d1.ATTR_HIGHLIGHT,
              ATTR_NAME: d1.ATTR_NAME, ATTR_CHARACTERISTICS: d1.ATTR_CHARACTERISTICS, ATTR_REF_ID: d1.ATTR_REF_ID[0], AUDIT_TYPE: d1.AUDIT_TYPE, CREATED_BY: d1.CREATED_BY[0],
              CREATION_DATE: d1.CREATION_DATE[0], DOUMENT_NAME: d1.DOUMENT_NAME, HRM_REF_NO: d1.HRM_REF_NO, HRV_REF_NO: d1.HRV_REF_NO, HR_REF_NO: d1.HR_REF_NO, MANDATORY: d1.MANDATORY,
              REPORT_NAME: d1.REPORT_NAME, REPORT_REF_ID: d1.REPORT_REF_ID[0], REPORT_VERSION: d1.REPORT_VERSION, VISIBLE: d1.VISIBLE, MODIFIED_BY: d1.MODIFIED_BY[0], MODIFIED_DATE: d1.MODIFIED_DATE[0]
            });
          }
        })
      }
    })
    this.service.spinner.next(false);
  }

  chapter2Arr: any = [];
  async getFdHlRequestManagement1() {
    this.variantsArr1.forEach((d: any) => {
      d.Table12Arr1 = []
      if (this.datavalidate(d.HRV_REF_NO) == '') {
        this.chapter2EmptyArr.forEach((d1: any) => {
          d.Table12Arr1.push({
            ATTR_VALUE: d1.ATTR_VALUE, ANNEXURE_EXT: d1.ANNEXURE_EXT, ANNEXURE_NAME: d1.ANNEXURE_NAME, ANNEXURE_PATH: d1.ANNEXURE_PATH, ATTR_DESC: d1.ATTR_DESC, ATTR_HIGHLIGHT: d1.ATTR_HIGHLIGHT,
            ATTR_NAME: d1.ATTR_NAME, ATTR_CHARACTERISTICS: d1.ATTR_CHARACTERISTICS, ATTR_REF_ID: d1.ATTR_REF_ID[0], AUDIT_TYPE: d1.AUDIT_TYPE, CREATED_BY: d1.CREATED_BY[0],
            CREATION_DATE: d1.CREATION_DATE[0], DOUMENT_NAME: d1.DOUMENT_NAME, HRM_REF_NO: d1.HRM_REF_NO, HRV_REF_NO: d1.HRV_REF_NO, HR_REF_NO: d1.HR_REF_NO, MANDATORY: d1.MANDATORY,
            REPORT_NAME: d1.REPORT_NAME, REPORT_REF_ID: d1.REPORT_REF_ID[0], REPORT_VERSION: d1.REPORT_VERSION, VISIBLE: d1.VISIBLE, MODIFIED_BY: d1.MODIFIED_BY[0], MODIFIED_DATE: d1.MODIFIED_DATE[0]
          });
        })
      }
      if (this.datavalidate(d.HRV_REF_NO) != '') {
        this.chapter2Arr.forEach((d1: any) => {
          if (d.HRV_REF_NO == this.datavalidate(d1.HRV_REF_NO)) {
            d.Table12Arr1.push({
              ATTR_VALUE: d1.ATTR_VALUE, ANNEXURE_EXT: d1.ANNEXURE_EXT, ANNEXURE_NAME: d1.ANNEXURE_NAME, ANNEXURE_PATH: d1.ANNEXURE_PATH, ATTR_DESC: d1.ATTR_DESC, ATTR_HIGHLIGHT: d1.ATTR_HIGHLIGHT,
              ATTR_NAME: d1.ATTR_NAME, ATTR_CHARACTERISTICS: d1.ATTR_CHARACTERISTICS, ATTR_REF_ID: d1.ATTR_REF_ID[0], AUDIT_TYPE: d1.AUDIT_TYPE, CREATED_BY: d1.CREATED_BY[0],
              CREATION_DATE: d1.CREATION_DATE[0], DOUMENT_NAME: d1.DOUMENT_NAME, HRM_REF_NO: d1.HRM_REF_NO, HRV_REF_NO: d1.HRV_REF_NO, HR_REF_NO: d1.HR_REF_NO, MANDATORY: d1.MANDATORY,
              REPORT_NAME: d1.REPORT_NAME, REPORT_REF_ID: d1.REPORT_REF_ID[0], REPORT_VERSION: d1.REPORT_VERSION, VISIBLE: d1.VISIBLE, MODIFIED_BY: d1.MODIFIED_BY[0], MODIFIED_DATE: d1.MODIFIED_DATE[0]
            });
          }
        })

      }
    })
    this.service.spinner.next(false);
  }
  datavalidate(data: string | null | undefined) {
    if (data != undefined && data != null && data != "") {
      return data;
    } else {
      return "";
    }
  }
}
