import { Component, OnInit } from '@angular/core';
import { Services } from '../services/services';
import { DatePipe } from "@angular/common";
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";

  tabsArr: any = [];
  call_modal: Boolean = false;
  data_send: any;
  requestIDArr: any = []
  requestInitiatorArr: any = [];
  ENGINE_FAMILY_NO_Arr: any = []
  requestNameArr: any = []
  AAHPopup: string = 'none';
  AAHArr: any = [];
  searchObj = {
    engineNumber: '',
    engineModel: '',
    status: '',
    stage: '',
    requestIDStr: '',
    fromDate: '',
    toDate: '',
    type: '',
    location: ''
  }
  initiator1: any = '';
  initiator: any = '';
  requestIDStr1: any = ''
  keyword = 'REQUEST_NO';
  keyword1 = 'INITIATOR';
  pagination: any = { itemsPerPage: 10, currentPage: 1 }
  loginUserID: string = '';

  constructor(private service: Services, private datepipe: DatePipe, private router: Router) {
    this.service.tabsArr.subscribe((data: any) => {
      if (data) {
        this.tabsArr = data;
        this.clickHide();
      }
    })
    this.service.loginUserID.subscribe((loginUserID: any) => {
      this.loginUserID = loginUserID;
    })
  }

  ngOnInit(): void {
    this.getFD_HL_RequestNoDetails();
    this.getEngineFamily();
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
  checkedRows: any = []
  dashboardView() {
    if (this.tabsArr.includes('ViewDashboard') && this.tabsArr.includes('Dashboard')) {
      return true;
    } if (this.tabsArr.includes('Dashboard')) {
      return true;
    } if (this.tabsArr.includes('ViewDashboard')) {
      return false;
    }
    return false;
  }

  isDash_ViewDashbrd: boolean = false;
  isDashboard: boolean = false;
  isViewDashbrd: boolean = false;

  clickHide() {
    if (this.tabsArr.includes('ViewDashboard') && this.tabsArr.includes('Dashboard')) {
      this.isDash_ViewDashbrd = true;
    } if (this.tabsArr.includes('Dashboard')) {
      this.isDashboard = true;
    } if (this.tabsArr.includes('ViewDashboard')) {
      this.isViewDashbrd = true;
    }

  }
  mailTrigger(HR_REF_NO: number) {
    this.call_modal = false;
    let dObj = {
      HR_REF_NO: HR_REF_NO,
      userId: this.loginUserID,
      fromUser: this.loginUserID
    }
    this.service.invokeService("SendFDHLDocumentDetailsByHr_Ref_No", dObj, this.namespace, true, false).
      then((res: any) => {
        setTimeout(() => {
          this.call_modal = true;
          this.data_send = { text: 'Mail triggered successfully', active: this.call_modal };
        }, 0);
      })
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
  previndex: any;
  getAAH(arg: any, event: any) {
    if (this.previndex) {
      this.previndex.target.checked = false;
    }
    this.previndex = event;
    if (!event.target.checked) {
      arg = ''
      this.previndex = undefined
    }

    let dataObj = { HR_RefNo: arg }
    this.service.invokeService("GetFD_HLHistoryDetailsByHR_RefNo", dataObj, this.namespace, true, false)
      .then((res: any) => {
        this.AAHArr = res;
      })
  }
  searchedData: any = []
  // requestID=['1','2','3']
  // engineNumber=['1','2','3']
  engineModel: any = []
  processStatus = ['Completed', 'In Progress', 'Obsoleted', 'Rejected', 'Waiting for Certification']
  stage = ['ARAI', 'Requestor', 'CD CoE SPOC']
  // initiator=['1','2','3']

  selectEvent(item: any) {
    this.searchObj.requestIDStr = item.REQUEST_NO;
    this.reqIdFlag = 'selected';
  }
  selectEventInitiator(item: any) {
    this.initiator = item.INITIATOR_ID;
    // this.initiator1 = item.INITIATOR_ID;
    this.initFlag = 'selected'
  }
  clearReqID() {
    this.requestIDStr1 = ''
    this.searchObj.requestIDStr = ''
  }
  clearInitiator() {
    this.initiator1 = ''
    this.initiator = ''
  }
  getEngineModel() {
    this.engineModel = [];
    let obj = { ENGINE_FAMILY_NO: this.searchObj.engineNumber }
    this.service.invokeService("GetFDHLEngineModelsByFamily", obj, this.namespace, true, false)
      .then((res: any) => {
        res.forEach((d: any) => {
          this.engineModel.push(d.ENGINE_MODEL_NO)
        })
      })
  }

  handlePageChange(eve: any) {
    this.pagination.currentPage = eve;
  }
  clear() {
    this.searchObj = {
      engineNumber: '',
      engineModel: '',
      status: '',
      stage: '',
      requestIDStr: '',
      fromDate: '',
      toDate: '',
      type: '',
      location: ''
    }
    this.initiator1 = ''
    this.initiator = ''
    this.requestIDStr1 = ''
    this.searchedData = []
    this.engineModel = [];
  }

  async dateValidation() {
    this.call_modal = false;
    if (Date.parse(this.searchObj.toDate) && Date.parse(this.searchObj.fromDate)) {
      if (Date.parse(this.searchObj.fromDate) > Date.parse(this.searchObj.toDate)) {
        setTimeout(() => {
          this.call_modal = true;
          this.data_send = { text: 'To Date Should be less than From Date', active: this.call_modal };
          this.searchObj.toDate = '';
        }, 0);
        return;
      }
    }
  }

  clickToView(HR_REF_NO: any) {
    this.router.navigate(['/createNewRequest'], { queryParams: { HR_REF_NO: HR_REF_NO, openAs: "dashboard" } });
  }
  checkInit() {
    this.initFlag = 'ngmodel';
  }
  reqIdFlag: string = '';
  initFlag: string = '';
  changeReqId() {
    this.reqIdFlag = 'ngmodel';
  }
  getDetails() {
    this.call_modal = false;
    let obj = {
      requestId: this.convToStr(this.reqIdFlag == 'selected' ? this.searchObj.requestIDStr : this.reqIdFlag == 'ngmodel' ? this.requestIDStr1 : ''),
      engineNo: this.convToStr(this.searchObj.engineNumber),
      engineName: this.convToStr(this.searchObj.engineModel),
      processStatus: this.convToStr(this.searchObj.status) == 'Completed' ? 1 : this.convToStr(this.searchObj.status) == 'In Progress' ? 2 : this.convToStr(this.searchObj.status) == 'Rejected' ? 3 :
      this.convToStr(this.searchObj.status) == 'Obsoleted' ? 4 : this.convToStr(this.searchObj.status) == 'Waiting for Certification' ? 5 : '',
      stage: this.convToStr(this.searchObj.stage) == 'Requestor' ? 1 : this.convToStr(this.searchObj.stage) == 'CD CoE SPOC' ? 2 : this.convToStr(this.searchObj.stage) == 'ARAI' ? 3 : '',
      initiator: this.convToStr(this.initFlag == 'selected' ? this.initiator : this.initFlag == 'ngmodel' ? this.initiator1 : ''),
      from_Date: this.convToStr(this.datepipe.transform(this.searchObj.fromDate, 'dd-MM-yyyy')),
      to_Date: this.convToStr(this.datepipe.transform(this.searchObj.toDate, 'dd-MM-yyyy')),
      location: this.convToStr(this.searchObj.location),
      type: this.convToStr(this.searchObj.type)
    }
    this.service.invokeService("GetFD_HLSearchDetails", obj, this.namespace, true, false)
      .then((res: any) => {
        if (res.length == 0) {
          setTimeout(() => {
            this.call_modal = true;
            this.data_send = { text: 'Data not found', active: this.call_modal };
          }, 0);
        }
        this.searchedData = res;
      })
  }

  getFD_HL_RequestNoDetails() {
    this.service.invokeService("GetFD_HL_RequestNoDetails", null, this.namespace, true, false)
      .then((res: any) => {
        this.requestIDArr = res;
      })
    this.service.invokeService("GetFD_HLRequestorDetails", null, this.namespace, true, false)
      .then((res: any) => {
        this.requestNameArr = res;
      })
  }
  exportExcel() {
    let obj = {
      requestId: this.convToStr(this.searchObj.requestIDStr),
      engineNo: this.convToStr(this.searchObj.engineNumber),
      engineName: this.convToStr(this.searchObj.engineModel),
      processStatus: this.convToStr(this.searchObj.status) == 'Completed' ? 1 : this.convToStr(this.searchObj.status) == 'In Progress' ? 2 : this.convToStr(this.searchObj.status) == 'Rejected' ? 3 :
      this.convToStr(this.searchObj.status) == 'Obsoleted' ? 4 : this.convToStr(this.searchObj.status) == 'Waiting for Certification' ? 5 : '',
      stage: this.convToStr(this.searchObj.stage) == 'Requestor' ? 1 : this.convToStr(this.searchObj.stage) == 'CD CoE SPOC' ? 2 : this.convToStr(this.searchObj.stage) == 'ARAI' ? 3 : '',
      initiator: this.convToStr(this.initiator),
      from_Date: this.convToStr(this.datepipe.transform(this.searchObj.fromDate, 'dd-MM-yyyy')),
      to_Date: this.convToStr(this.datepipe.transform(this.searchObj.toDate, 'dd-MM-yyyy')),
      location: this.convToStr(this.searchObj.location),
      type: this.convToStr(this.searchObj.type)
    }
    this.service.invokeService("ExcelFD_HLSearchDetails", obj, this.namespace, true, false)
      .then((res: any) => {
        this.service.downloadFileByFileContent(res[0].ExcelFD_HLSearchDetails, "FDHLSearchDetails.xlsx")
      })
  }

  convToStr(data: string | null | undefined) {
    //debugger;
    if (data != undefined && data != null && data != "") {
      return data;
    } else {
      return "";
    }
  }
}
