import { Component, OnInit } from '@angular/core';
import { Services } from '../services/services';

@Component({
  selector: 'app-engine-model',
  templateUrl: './engine-model.component.html',
  styleUrls: ['./engine-model.component.css']
})
export class EngineModelComponent implements OnInit {

  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";
  totalLength: number= 0;
   page = 1;
   engineModelDetails:any =[];

  constructor(private service: Services) { }

  ngOnInit(): void {
    this.getData();
  }

  handlePageChange(event: number) {
    this.page = event;
  }

  getData(){
    let dataObj ={ENGINE_M_REF_ID : ''} 
    this.service.invokeService("GetFDHLEngineModelDetails", dataObj, this.namespace,true, false)
      .then((res: any) => {
       this.engineModelDetails = res;
      })
  }
  clickToView(REF_ID:number){
    let v ='createNewEngineModel'+','+REF_ID
    this.service.routeChange.next(v);
  }
  exportExcel(){
    let fileURL:string=''
    this.service.invokeService("GetReportURL", null, this.namespace,true, false)
    .then((res: any) => {
      fileURL = res[0].getReportURL.split(',')[0]
    })
  
    let fileContent: any;
    let dataObj ={ENGINE_F_REF_ID : ''} 
    this.service.invokeService("ExcelFDHLEngineModelDetails", dataObj, this.namespace,true, false)
      .then((res: any) => {
        // fileContent = res[0].ExcelFDHLEngineFamilyDetails;
        // window.open(fileURL+fileContent);
  
  
        this.service.downloadFileByFileContent(res[0].ExcelFDHLEngineModelDetails,"FDHLEngineModelDetails.xlsx")
      })
  }
}
