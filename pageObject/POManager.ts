import { Page } from "playwright"
import LoginPage from "./LoginPage";
import BusinessPage from "./BusinessPage";
import ProductPage from "./ProductPage";

class POManager{
    public page:Page;
    public loginPage: LoginPage;
    public businessPage: BusinessPage;
    public productPage: ProductPage;

    constructor(page:Page){
        this.page = page;
        this.loginPage = new LoginPage(this.page);
        this.businessPage = new BusinessPage(this.page);
        this.productPage = new ProductPage(this.page);
    }

    getLoginPage(){
        return this.loginPage;
    }

    getBusinessPage(){
        return this.businessPage;
    }

    getProductPage(){
        return this.productPage;
    }


}

export default POManager