import { Component, OnInit } from '@angular/core';
import { Services } from '../services/services';
declare var $: any

@Component({
  selector: 'app-engine-family',
  templateUrl: './engine-family.component.html',
  styleUrls: ['./engine-family.component.css']
})
export class EngineFamilyComponent implements OnInit {

  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";
  totalLength: number= 0;
   page = 1;
   engineFamilyDetails:any =[];
   enginePlatform:any =[];
   engineFIE:any =[];
   engineAspiration:any =[];

  constructor(private service: Services) { 
    this.service.lovMasaterList.subscribe((lovMasaterList: any) => {
      this.enginePlatform = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_PLATFORM');
      this.engineFIE = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_FIE');
      this.engineAspiration = $.cordys.json.findObjects(lovMasaterList, 'LOV_TYPE', 'ENGINE_ASPIRATION');
    })
  }

  ngOnInit(): void {
    this.getData();
  }

  handlePageChange(event: number) {
    this.page = event;
  }

  getData(){
    let dataObj ={ENGINE_M_REF_ID : ''} 
    this.service.invokeService("GetFDHLEngineFamilyDetails", dataObj, this.namespace,true, false)
      .then((res: any) => {
       this.engineFamilyDetails = res;
      })
  }

exportExcel(){
  let fileURL:string=''
  this.service.invokeService("GetReportURL", null, this.namespace,true, false)
  .then((res: any) => {
    fileURL = res[0].getReportURL.split(',')[0]
  })
  let dataObj ={ENGINE_F_REF_ID : ''} 
  this.service.invokeService("ExcelFDHLEngineFamilyDetails", dataObj, this.namespace,true, false)
    .then((res: any) => {
      this.service.downloadFileByFileContent(res[0].ExcelFDHLEngineFamilyDetails,"FDHLEngineFamilyDetails.xlsx")
    })
}

  clickToView(REF_ID:number){
    let v ='createNewEngineFamily'+','+REF_ID
    this.service.routeChange.next(v);
  }
}
