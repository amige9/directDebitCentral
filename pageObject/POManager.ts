import { Page } from "playwright"
import LoginPage from "./LoginPage";
import BusinessPage from "./BusinessPage";

class POManager{
    public page:Page;
    public loginPage: LoginPage;
    public businessPage: BusinessPage;

    constructor(page:Page){
        this.page = page;
        this.loginPage = new LoginPage(this.page);
        this.businessPage = new BusinessPage(this.page);
    }

    getLoginPage(){
        return this.loginPage;
    }

    getBusinessPage(){
        return this.businessPage;
    }


}

export default POManager