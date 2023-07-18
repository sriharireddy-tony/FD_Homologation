import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  convertTupleToJson(obj:any, tblName: string){
    let filtered: any | undefined;
 
     if(Array.isArray(obj)){
         filtered =obj.map((obj)=>{
             return obj.old[tblName]; 
         });
     }else if(obj.old){
         const arr =[];
         arr.push(obj.old[tblName]);
         return arr;
     }else if(obj.new){
         const arr =[];
         arr.push(obj.new[tblName]);
         return arr;
     }
    
     //console.log(filtered);
     return filtered;
 }
 datavalidate(data: string | null | undefined) {
     //debugger;
     if(data != undefined && data != null && data != "") {
         return data;
     } else {
         return "";
     }
 }

}
