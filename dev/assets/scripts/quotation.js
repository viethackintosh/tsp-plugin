import { Master, masterModal, masterNotice } from './master.js';
import { Accordion } from  './uxui/accordion.js';
import { createFormItem } from './helpers/formgroup.js'

import { QUOTATION_TEMPLATE_API } from './helpers/const.js';
import { trantlateNumbertoVNString } from "./helpers/numbytext.js";

const Quotation = function() {
    let qt = new Master();
    qt.storageName = 'quotation';
   // let init = qt.init; 
    qt.title ='Bảng báo giá';
    // tạo lại phần khởi tạo đặt thù của quotation
    let layoutMethod = qt.onMainPage;

    // thêm dữ liệu vào template
    qt.onMainPage = ({layout, data}) => {
        let tempLayout = layoutMethod({layout, data});     
        tempLayout = qt.pushVATTocurrentLayout({vat: data?.vat, layout });
        tempLayout = qt.pushEnablePrintVATLayout({layout});
        return tempLayout;
    }

    qt.nextMethod = ({quotation}) => {
        quotation.vat.data = qt.updateVAT({products: quotation.products});        
        qt.pushVATToController({vat: quotation.vat });
    }

    // 
    qt.otherPage = () => {
        let buttons = qt.listButtons();
        console.log(buttons)
        Array.from(buttons).map(button => {
            let ownData = JSON.parse(button.getAttribute('data'));
            Object.assign(button, {
                ownData, 
                onclick: event => qt.updateQuotation(event)});
            });
          
        qt.setAddQuotaionButtons();
    }
    
    // sự kiện thêm 1 nguồn dữ liệu vào báo giá xảy ra
    qt.updateQuotation = event => {
        event.preventDefault();
        const target = event.target.closest('a');    
        console.log([target]);
        let { type, ...other } = target.ownData;        
        return qt[`updateQuotation${type}`]({...other, quotation: qt.data});
    }

    // thêm sản phẩm vào báo giá
    qt.updateQuotationProduct = ({ID,  parentID,  quotation}) => {
        // ID lúc này là của sản phẩm
        // parentID != 0 => kiểm 
        //console.log(ID,  parentID) // parent == có thể là single 
        let exist = parentID !== 0?  
            qt.checkExistProductVariation({quotation, ID, })
            :qt.checkExistProductVariable({
                quotation, ID,
            }); // nếu là sản phẩm biến thể dùng parentID kiểm tra
        if (exist) {
            // gọi modal khi đã tồn tại sản phẩm                        
            masterModal.open({ config: {
                    title:'Cảnh báo đã có sản phẩm trong báo giá',
                    content: qt.updateProductVariableForm({product: exist, ID, parentID, quotation}),

                }
            }); 

        } else {
            // chưa có sản phẩm cha
            // có sản phẩm cha, chưa có sản phẩm con
            qt.updateProductInQuotation ({ID, parentID, quotation, update: false});
        }        
    }    

    // kiểm tra đã tồn tại thì update chưa thì thêm vào
    qt.updateProductInQuotation = async ({ID, parentID, quotation, update}) => {
        // tính toán cộng, vat, thành tiền, số tiền bằng chữ
        try {             
            let product = await qt.getProduct({ID});            
            let findID = parentID !== 0? parentID: ID;
            let existProduct = quotation.products? quotation.products.find(pro => pro.parentID == findID): undefined; 
            if ( ! update) { // thêm sản phẩm mới
                /* 1. chọn sản phẩm cha -> chưa có trong báo giá
                    // kiểm tra parentID = 0, thêm sản phẩm cha vào báo giá 
                //2. chọn sản phẩm con -> cha chưa có trong báo giá
                    // kiểm tra parentID != 0, tìm sản phẩm cha trong báo giá -> chưa có thêm tất cả sản phẩm vào báo giá
                //3. chọn sản phẩm con -> sản phẩm con chưa có trong sản phẩm cha
                    // kiểm tra parentID != 0, tìm sản phẩm cha trong báo giá -> thêm sản phẩm con vào sản phẩm cha */
                if (parentID == 0 || ! existProduct) quotation.products = ! quotation.products? [product]: [...quotation.products, product];
                else existProduct.prices = [...existProduct.prices, ...product.prices];                

            } else { // cập nhật lại sản phẩm
                //1. chọn sản phẩm cha -> thay thế sản phẩm cha mới
                //2. chọn sản phẩm con -> tìm sản phẩm con -> thay thế
                let index = quotation.products.findIndex(pro => pro.parentID == existProduct.parentID);                
                if (parentID == 0) quotation.products[index] = product;
                else  {
                    let proIndex = quotation.products[index].prices.findIndex(pri => pri.productID == product.prices[0].productID);
                    quotation.products[index].prices[proIndex] = product.prices[0];
                } 
            }
            // cập nhật lại VAT        
            let vat = qt.updateVAT({products: quotation.products});                           
            quotation.vat = ! quotation.vat ? { data:vat, status: true }: {...quotation.vat, data:vat};
            
            // lưu vào localstorage
            localStorage.setItem(qt.storageName, JSON.stringify(quotation));

            masterModal.close({ clear: true});
            masterNotice.open( {
                message:`Đã ${update ===true ? 'Cập nhật': 'thêm mới' } sản phẩm vào báo giá`,
                icon: true,
                style: 'info',
                timer: 1500
            });
        } catch { }          
    
    }
    // thêm sản phẩm vào báo giá
     /**
     * xử lý phím bấm trong user
     */
     
    qt.updateQuotationUser = async ({ID, quotation}) => {
        // ID lúc này của user               
        try {
            let user = await qt.getUser({user: ID});
            quotation.user = user.user;            
            // làm động tác kiểm tra thêm mới hoặc cập nhật user vào quotations             
            localStorage.setItem(qt.storageName, JSON.stringify(quotation));

        } catch {
            
        } finally {
            masterNotice.open( {
                message:'Đã thêm người dùng vào báo giá',
                icon: true, 
                style: 'info',
                timer: 1500
            })
            
        }
    }

    //
    qt.updateQuotationOrder = async ({ID, quotation}) => {
        // ID lúc này của Order
       // console.log(ID, quotation);
        try {
            let order = await qt.getOrder({orderId: ID});
            let quotationOut = {...quotation, ...order};            
         
            quotationOut.vat = {
                data: qt.updateVAT({products: quotationOut.products }),
                status: true,
            }
            // lưu vào localstorage
            localStorage.setItem(qt.storageName, JSON.stringify(quotationOut));

            masterNotice.open( {
                message:`Đã tạo lại báo giá của đơn hàng #${ID}`,
                icon: true,
                style: 'info',
                timer: 1500
            })
        } catch {}
        
    }    
        
    // load dữ liệu lần đầu
    qt.pushVATTocurrentLayout = ({vat, layout}) => {
        if (! vat ) return layout;
        if (vat.data)
            vat.data.forEach(({vatName, vatValue}) => layout.querySelector(`.${vatName}`).innerHTML = vatValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));               

        let vatRow = layout.querySelector('.products__vat');
        let status = vat?.status ?? false;

        if ( status === false ) vatRow = qt.markNoprintVAT({vatRow, target: 'products__vat'});
        return layout;       
    }


    // tạo nút bỏ in tại các dòng vat
    qt.pushEnablePrintVATLayout = ({layout}) => {
        if (! layout) return layout;
        let vatEnablePrint = layout.querySelector('.products__vat .enableprint');
        let enableprint =  qt.createEnablePrint({           
            ID: 'products__vat',
            forProduct: false,
            onclickMethod: qt.noprintVAT,            
        });
        vatEnablePrint.append(...enableprint);
        return layout;
    }

    qt.markNoprintVAT = ({vatRow, target}) => {
        vatRow.classList.add('noprint');
        let overlay = qt.createOverlay({target, message:'Dòng thành tiền, không được in. Bạn muốn ',restore: qt.restoreVAT });   
        vatRow.append(overlay);
        return vatRow;
    }

    //
    qt.noprintVAT = ({event, quotation}) => {
        let target = event.target.closest('a').target;
        let status = false;
        
        if (! quotation || ! quotation.vat ) quotation.vat = {status};
        else quotation.vat.status = status;

        let productVat = document.querySelector(`.${target}`);
        productVat = qt.markNoprintVAT({vatRow: productVat, target});                    
        localStorage.setItem(qt.storageName,JSON.stringify(quotation));
    }

    // khôi phục lại in các dòng thuế VAT
    qt.restoreVAT = ({event, quotation}) => {
        let target = event.target.closest('a').target;       
        let status = true;        
        quotation.vat.status = status;

        let proVat = document.querySelector(`.${target}`);
        proVat.classList.remove('noprint');
        proVat.querySelector('.overlay').remove();
        localStorage.setItem(qt.storageName, JSON.stringify(quotation));
    }
   

    qt.createSpecificationsProduct = ({parentID, productName, attributes}) => [
        qt.productName({ productName, data:{ ID: parentID, field: 'productName'},}),       
        ... ! attributes? []: qt.createAttribute({parentID, attributes})
    ]        
  
    /**
     * khai báo xử lý list buttons      *   
     */
    qt.listButtons = () =>  document.querySelectorAll('.updateQuotation');   
    
    // thêm sự kiện cho các link thêm dữ liệu vào quotation
    qt.setAddQuotaionButtons = () => { 
        // box variable_product_options thay đổi thông tin
        let varProuctOptions = document.querySelector('#variable_product_options');
        if (varProuctOptions) varProuctOptions.onchange = event => qt.varProductOptionChange(event);        
        
    }

    // box tab variations change 
    qt.varProductOptionChange = event => { 
        let buttons = qt.listButtons();
        Array.from(buttons).map(button => {
            let ownData = JSON.parse(button.getAttribute('data'));
            Object.assign(button, {
                ownData, 
                onclick: event => qt.updateQuotation(event)});
            });        
    }
   
    /**
     * 
     * @param {*} event 
     * xử lý click trong oder
     */
    qt.quotationOder = async (event) => {
        event.preventDefault();
        let orderId = JSON.parse(event.target.getAttribute('data')).productID;
        try {
            let order = await qt.getOrder({orderId});
            order.user = qt.filterCustomerFields(order.user);
        } catch {

        }
    }

    /**
     * 
     * @param {*} event 
     * xử lý phím bấm trong list product
     */   
  
    // kiểm tra sản phẩm có biến thể (sản phẩm cha) hoặc sản đơn
    // lọc productID với parentID trong products      
    qt.checkExistProductVariable = ({quotation, ID}) => 
        quotation?.products && quotation?.products.find(product => product.parentID == ID);
    
    
    //form update sản phẩm variable
    qt.updateProductVariableForm = ({product, ID, parentID, quotation}) => 
        createFormItem({
            tag: 'p',
            className:'Message',
            innerHTML:`Sản phẩm <b> ${product.productName}</b> bạn muốn thêm vào báo giá đã tồn tại! bạn có muốn cập nhật mới không?&nbsp;`,
            children: [ {
                    tag:'a',
                    href:'#',
                    class:'button btn',
                    innerHTML: 'Cập nhật mới',
                    onclick: event =>{ event.preventDefault(); return qt.updateProductInQuotation({ID, parentID, quotation, update: true})},                
                }
            ],
        });
 
    // kiểm tra tồn tại của sản phẩm variations trong quotation
    // lọc productID với productID trong  prices của danh sách products
    qt.checkExistProductVariation = ({quotation, ID}) => 
        quotation?.products && quotation?.products.find(product => product?.prices.find(price => price.productID == ID));        
   
    //chức năng cập nhật sản phẩm variation
    qt.updateProductVariation = async ({productID, quotation}) => {
        try {
            let childProduct = await qt.getProduct({productID});
            let prices = quotation.products.find(product => product.parentID == childProduct.product.parentID).prices;
            let childIndex = prices.findIndex(price => price.productID == productID);
            prices[childIndex] = childProduct.product.prices[0];
            masterNotice.open( {
                message:'Đã thêm sản phẩm vào báo giá',
                icon: true,
                style: 'info',
                timer: 1500
            })
        } catch {

        }
        
    }

    qt.updateVAT = ({products}) => { 
        let totalBeforeVAT = products.map(product => product.status == 'onprint'? product.prices[0].total:0)
                                    .reduce((previousValue, currentValue )=>previousValue + currentValue,0); 
        
        let totalAfterVAT = [];   
        totalAfterVAT = trantlateNumbertoVNString(totalAfterVAT, Math.round(1.1 * totalBeforeVAT), 0 );
        if (totalAfterVAT.length != 0) totalAfterVAT[0] = totalAfterVAT[0].replace(',','');
       
        return [
            {vatName: 'totalBeforeVAT',  vatValue: totalBeforeVAT, },
            {vatName: 'vatPercentage', vatValue: Math.round(totalBeforeVAT * 0.1)},
            {vatName: 'totalpaid', vatValue: Math.round(1.1 * totalBeforeVAT)},
            {vatName: 'byWord', vatValue: `${totalAfterVAT.reverse().join(' ')} đồng`},
        ]
                       
    }
    
    qt.updateVATFromTotal = ({quotation}) => {
        quotation.vat.data = qt.updateVAT({products: quotation.products});
        qt.pushVATToController({vat: quotation.vat });
    }

    //load vat khi thay đổi onprint/noprint
    qt.pushVATToController = ({vat}) => {
        if (! vat ) return;
        vat.data.forEach(({vatName, vatValue}) => document.querySelector(`.${vatName}`).innerHTML = 
            vatValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    }

   return qt; 
}
const quotation = new Quotation().init({
    id:'sheetQuotation',
    templateName: 'templateone',
    restAPI: QUOTATION_TEMPLATE_API,
});
window.onload = function() {
    const accordion = new Accordion().init({ id: 'accordion', onlyAccordionOpen: true });
  }