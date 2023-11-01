import { EventEmitter, Injectable, Output } from '@angular/core';
import { ApiResponse } from './bizobjects';
import { NgxUiLoaderService } from "ngx-ui-loader";
import Swal from 'sweetalert2';
import { ServiceRegistory } from './service.registry';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
//import { saveAs } from 'file-saver';

declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class Services {
  actStage!: string;

  constructor(private ngxService: NgxUiLoaderService, private router: Router, private datepipe: DatePipe) {}

  public downloadFileByFileContent(fileContent: string,   fileName: string) {
    let docContent: any = atob(fileContent);
    let contentArray = new Uint8Array(docContent.length);
    for (let lpvar = 0; lpvar < docContent.length; lpvar++) {
        contentArray[lpvar] = docContent.charCodeAt(lpvar);
    }
    let xlBlob = new Blob([contentArray], { type: "application/octet-stream" });
    // saveAs(xlBlob, fileName);
    const a = document.createElement('a')
    const objectUrl = URL.createObjectURL(xlBlob)
    a.href = objectUrl
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(objectUrl);
}

  public downloadFile(methodname: string, fileName: string, fileLink: string, namespace: string = '',
    isAsync: any = undefined, showLoadingIndicator: any = undefined) {

    let fileContent: any;
    let download_req = {};
    if(fileLink.indexOf(";")>=0)
    {
        download_req = {
            "filePath": fileLink.split(";")[0],
            "path": fileLink.split(";")[1]
        };
    }
    else{
        download_req = {
            "filePath": fileLink
        };
    }

    this.fireSoapService(methodname, namespace, download_req, isAsync, showLoadingIndicator)
      .then((response: any) => {

        fileContent = response[0].downloadDocument;
        let docContent: any = atob(fileContent);
        let contentArray = new Uint8Array(docContent.length);
        for (let lpvar = 0; lpvar < docContent.length; lpvar++) {
          contentArray[lpvar] = docContent.charCodeAt(lpvar);
        }
        let xlBlob = new Blob([contentArray], { type: "application/octet-stream" });
        // saveAs(xlBlob, fileName);
        const a = document.createElement('a')
        const objectUrl = URL.createObjectURL(xlBlob)
        a.href = objectUrl
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(objectUrl);
      }).catch((response) => {
        alert(response.responseJSON.faultstring.text);
      });
  
    }
    
  public uploadFile(methodname: string, file: File, fileFormats: any, namespace: string = '',
    isAsync: any = undefined, showLoadingIndicator: any = undefined) {
    let fileContent: any;
    let extension: any;
    let _this = this;
    return new Promise((resolve, reject) => {
      if (file.name.lastIndexOf(".") == -1) {
        Swal.fire(
          'File Format Not Recognized. Please Select Different File.', '', 'error');
        reject("File Format Not Recognized. Please Select Different File.");
      }
      if (file.name.indexOf("@") > -1 || file.name.indexOf("#") > -1) {
        Swal.fire(
          "File must not contain \"@\" or \"#\". Please Remove And Try Again",
          '',
          'error'
        );
        reject("File must not contain \"@\" or \"#\". Please Remove And Try Again");

      }
      if (file.name.length > 100) {
        Swal.fire(
          "File Name should be less than 100 characters", '', 'error');
        reject("File Name should be less than 100 characters");

      }

      extension = file.name.split('.').pop();
      extension = extension.toLowerCase();
      if (fileFormats.length > 0 && fileFormats.indexOf(extension) == -1) {
        Swal.fire('', 'Please Upload ' + fileFormats.toString() + ' format files', 'warning');
        reject('Please Upload ' + fileFormats.toString() + ' format files');
      }

      var reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = function (e: any) {


        fileContent = e.target.result;
        let upload_req = {
          "fileName": file.name,
          "fileContent": fileContent
        };
        _this.fireSoapService(methodname, namespace, upload_req, isAsync, showLoadingIndicator)
          .then((response: any) => {

            resolve(response[0].uploadFDHLDocumnets);
          }).catch((response) => {
            alert(response.responseJSON.faultstring.text);
            reject(response);
          });
      }
    });


  }
  public invokeService(methodname: string, requestBody: any, namespace: string = '',
    isAsync: any = undefined, showLoadingIndicator: any = undefined) {
    let parameters = requestBody;

    $.cordys.json.defaults.removeNamespacePrefix = true;

    return new Promise((resolve, reject) => {
      this.fireSoapService(methodname, namespace, parameters, isAsync, showLoadingIndicator)
        .then((response) => {

          resolve(response);
        }).catch((response) => {
          alert(response.responseJSON.faultstring.text);
          reject(response.responseJSON.faultstring.text);
        });
    });

  }

  public fireSoapService(methodname: string, namespace: string, parameters: any,
    isAsync: any, showLoadingIndicator: any) {
    let _this = this;
    if (!namespace)
      namespace = ServiceRegistory[methodname]?.namespace;
    if (!isAsync)
      isAsync = ServiceRegistory[methodname]?.isAsync;
    if (!showLoadingIndicator)
      showLoadingIndicator = ServiceRegistory[methodname]?.showLoadingIndicator;
    return new Promise((resolve, reject) => {
      $.cordys.ajax({
        method: methodname,
        namespace: namespace,
        parameters: parameters,
        async: isAsync,
        showLoadingIndicator: false,
        success: function (response: any) {
          if (showLoadingIndicator)
            _this.ngxService.stop();
          let apiResponseObj: ApiResponse = new ApiResponse();
          _this.processHttpResponse(methodname, response, apiResponseObj);
          resolve(apiResponseObj.responseBody);
        },
        error: function (response: any, status: any, errorText: any) {
          if (showLoadingIndicator)
            _this.ngxService.stop();
             reject(response);


        }
        ,
        beforeSend: function (xhr: any) {
          if (showLoadingIndicator)
            _this.ngxService.start();
        },
        complete: function () {
          if (showLoadingIndicator)
            _this.ngxService.stop();
        },
        fail: function (response: any) {
          if (showLoadingIndicator)
            _this.ngxService.stop();
        }

      });
    });
  }
  processHttpResponse: any = (methodname: string, httpResponse: any, apiResponseObj: ApiResponse) => {
    apiResponseObj.responseCode = 200;
    let bizObjectName = ServiceRegistory[methodname]?.returnType;
    let occurrence = ServiceRegistory[methodname]?.occurrence;
    if (!occurrence)
      occurrence = "*";


    if (httpResponse.hasOwnProperty("tuple")) {

      if (Array.isArray(httpResponse.tuple)) {
        apiResponseObj.responseBody = [];
        let container = ("new" in httpResponse.tuple[0]) ? "new" : "old";

        bizObjectName = ("any" === bizObjectName || !bizObjectName) ? Object.keys(httpResponse.tuple[0][container])[0] : bizObjectName;
        for (let index = 0; index < httpResponse.tuple.length; index++) {
          apiResponseObj.responseBody.push(httpResponse.tuple[index][container][bizObjectName]);
        }

      }
      else {
        let container = ("new" in httpResponse.tuple) ? "new" : "old";
        bizObjectName = ("any" === bizObjectName || !bizObjectName) ? Object.keys(httpResponse.tuple[container])[0] : bizObjectName;
        if (occurrence === "1") {
          apiResponseObj.responseBody = httpResponse.tuple[container][bizObjectName];

        }
        else {
          apiResponseObj.responseBody = [];
          apiResponseObj.responseBody.push(httpResponse.tuple[container][bizObjectName]);
        }
      }


    }
    else {
      if (httpResponse && Object.keys(httpResponse).length >= 3) {
        apiResponseObj.responseBody = httpResponse;
      }
      else {
        if (occurrence === "1")
          apiResponseObj.responseBody = {};
        else
          apiResponseObj.responseBody = [];
      }
    }


  }

  processHttpServerError: any = (httpResponse: any, status: any, errorText: any, apiResponseObj: ApiResponse) => {
    apiResponseObj.responseCode = 500;
    apiResponseObj.errorMsg.faultCode = httpResponse.responseJSON.faultcode.text;
    apiResponseObj.errorMsg.faultMsg = httpResponse.responseJSON.faultstring.text;
    //apiResponseObj.errorMsg.faultDetails = httpResponse.responseJSON.detail.FaultRelatedException.text;
  }
  datavalidate(data: string | null | undefined) {

    if (data != undefined && data != null && data != "") {
      return data;
    } else {
      return "";
    }
  }

  call_modal:boolean =false;
  data_send:any ={}
  completeTask(taskId: string, data: any, status: string, openas: string) {
    this.call_modal = false;
    var titlest = "Task Completed Successfully";
    let _this = this;
    $.cordys.workflow.completeTask(taskId, data, { dataType: 'xml' }).done( () => {

      // Swal.fire({
      //   title: titlest,
      //   icon: 'success',
      //   allowOutsideClick: false
      // }).then(function () {
      //   _this.closeTask(openas);
      // });
  setTimeout(() => {
          this.call_modal = true;
          this.data_send = { text: titlest, active: this.call_modal};
        }, 0);
    });//End of done Function
  } // End Of Function


  closeTask(openas: string) {
    this.actStage = "view";
    if (openas == 'customInboxTask') // if Custom Inbox
    {
      this.router.navigate(['/inbox']);

    }

    else if (openas == 'mail')// if accessed through mail
    {
      //$scope.viewPage = true;

      window.close();

    }

    else //if Cordys Inbox
    {
      // if(typeof window.parent.parent.parent.system.windows["RightFrame_cordys_notif_MyInboxTask"] != 'undefined')
      // 	{
      // 			window.parent.parent.parent.system.windows["RightFrame_cordys_notif_MyInboxTask"].refreshButton_Click();
      // 			parent.parent.parent.application.container.close();
      // 			return false;
      // 	}
      // else
      // 	{
      // 	parent.parent.parent.application.container.close();
      // 	}

    }

  }

  dateFilter(date:any) {
    let formattedDate;
        if(date != undefined && date != null && date != "") {
          if(typeof(date) == 'object'){
            formattedDate = this.datepipe.transform(new Date( date ), 'YYYY-MM-dd')
          }
          else if(typeof(date) == 'string'){
            formattedDate = date.includes('-') ? date.split('-').reverse().join('-') : date.includes('/') ? date.split('/').reverse().join('/') :
             date.includes('.') ? date.split('.').reverse().join('.'): ''
          }
            return formattedDate;
        } else {
            return '';
        }
}
actStag = new BehaviorSubject<string>('');
ARAIFlag = new Subject();

  callEngineModel = new Subject();
  createPageEvents = new BehaviorSubject<string>('');
  taskPage = new Subject();
  routeChange = new Subject();
  routerName = new Subject();
  repConfEventCall = new Subject();
  addNewLineBtn = new Subject();
  roleStage = new Subject();
  callTable4G = new Subject();
  OpenAs = new BehaviorSubject<boolean>(false);
  spinner = new BehaviorSubject<boolean>(false);
  cloneHRNo = new Subject();
  SaveUpdateHRNo = new Subject();
  // masterAttributes:any = new Subject();

  lovMasaterList = new BehaviorSubject<any>([]);
  loginUserID = new BehaviorSubject<string>('');
  loginUserName = new BehaviorSubject<string>('');
  HR_REF_NO = new BehaviorSubject<any>({});
  ENGINE_FAMILY_NO_Arr = new BehaviorSubject<any>([]);
  tabsArr = new BehaviorSubject<any>([]);

  sharingData(Data: any, Type: string) {
    switch (Type) {
      case 'LovDetails':
        this.lovMasaterList.next(Data)
        break;
      case 'loginUserID':
        this.loginUserID.next(Data)
        break;
      case 'loginUserName':
        this.loginUserName.next(Data)
        break;
        case 'HR_REF_NO':
          this.HR_REF_NO.next(Data)
          break;
          case 'ENGINE_FAMILY_NO_Arr':
          this.ENGINE_FAMILY_NO_Arr.next(Data)
          break;
      default:
        break;
    }
  }
}