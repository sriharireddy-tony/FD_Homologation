import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Services } from '../services/services';

@Component({
  selector: 'app-create-master',
  templateUrl: './create-master.component.html',
  styleUrls: ['./create-master.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class CreateMasterComponent implements OnInit {
  namespace: string = "http://schemas.cordys.com/FD_HL_WSPackage";

  createMaterData:any=[];
  pagination:any= { itemsPerPage: 10, currentPage: 1 }
  constructor(private service: Services,private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.getSavedData();
  }
  getSavedData(){
    this.service.invokeService("GetFDHLAttributeDetailsByATTR_REF_ID", null, "http://schemas.cordys.com/FD_HL_WSPackage",true, false)
      .then((res: any) => {
       this.createMaterData = res
      })
  }

  handlePageChange(eve:any){
    this.pagination.currentPage = eve; 
  }
  clickToView(REF_ID:number){
    let v ='createmasterform'+','+REF_ID
    this.service.routeChange.next(v);
  }
  deleteMasterAttr(obj:any){
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this attribute?', header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
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
            this.createMaterData.splice(this.createMaterData.indexOf(obj), 1)
            // setTimeout(() => {
            //   this.call_modal = true;
            //   this.data_send = { text: 'File Deleted Successfully!', active: this.call_modal };
            // }, 0);
          })
      },
      reject: () => { }
    });
  }
  exportExcel(){
    let fileURL:string=''
    this.service.invokeService("GetReportURL", null, this.namespace,true, false)
    .then((res: any) => {
      fileURL = res[0].getReportURL.split(',')[0]
    })
    let dataObj ={ATTR_REF_ID : ''} 
    this.service.invokeService("ExcelFDHLAttributeDetailsByATTR_REF_ID", dataObj, this.namespace,true, false)
      .then((res: any) => {
        this.service.downloadFileByFileContent(res[0].ExcelFDHLAttributeDetailsByATTR_REF_ID,"FDHLMasterAttributesDetails.xlsx")
      })
  }
}
