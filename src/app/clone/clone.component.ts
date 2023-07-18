import { Component, OnInit } from '@angular/core';
import { Services } from '../services/services';

@Component({
  selector: 'app-clone',
  templateUrl: './clone.component.html',
  styleUrls: ['./clone.component.css']
})
export class CloneComponent implements OnInit {
  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";
  
  requestIDArr:any =[]
  requestIDStr:string='';
  cloneHrNo:string= '';
  familyNo:string ='';
  keyword = 'REQUEST_NO';
  cloneCall:string='';
  constructor(private service: Services) { 
    this.service.createPageEvents.subscribe((call) => {
      if(call=='clone'){
        this.cloneCall = call;
      } else if(call=='clear'){
        
      }
    })
  }

  ngOnInit(): void {
    this.service.cloneHRNo.next('')
    this.getFD_HL_RequestNoDetails();
  }
  selectEvent(item: any) {
    this.requestIDStr= item.REQUEST_NO;
    this.familyNo = item.ENGINE_FAMILY_NO;
    this.cloneHrNo = item.HR_REF_NO
    }
    clearReqID(){
      this.requestIDStr=''
      this.familyNo = ''
    }
  getFD_HL_RequestNoDetails(){
    this.service.invokeService("GetFD_HL_RequestNoDetails", null, this.namespace,true, false)
      .then((res: any) => {
       this.requestIDArr = res;
      })
    }
    toStr(data: string | null | undefined) {
      //debugger;
      if (data != undefined && data != null && data != "") {
        return data;
      } else {
        return "";
      }
    }
}
