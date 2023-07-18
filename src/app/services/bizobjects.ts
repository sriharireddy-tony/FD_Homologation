export class ApiResponse {
    responseCode?: number;
    responseBody?: any;
    errorMsg: {faultCode: string,faultMsg: string,faultDetails: string};
   

    constructor()
    {
       
        this.errorMsg = {faultCode: "",faultMsg: "",faultDetails: ""};
    }
}


export interface DCR_EN_LOV_MASTER_AUTO {
	DCR_EN_LMF_ID : string;
	DCR_EN_LMF_DESC : string;
	DCR_EN_LMF_TYPE : string;
	DCR_EN_LMF_APP : string;
	DCR_EN_LMF_IS_ACTIVE : string;
	
}