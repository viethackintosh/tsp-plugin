import Notice from './modules/notice/notice.js'; 
import Modal from './modules/modal/modal.js';
import fchRequest from './modules/helpers/fetch.js';
import { createFormItem } from './modules/helpers/formgroup.js';

import { Editor } from './modules/helpers/edit.js';
import { USER_API, ORDER_API, PRODUCT_API} from './modules/helpers/const.js'

const Master = function() {
    let ms = this;
    ms.frmMaster;
    ms.data; // đọc dữ liệu từ localstorage và xử lý tại đây   
    ms.title;     
    ms.storageName = '';
    ms.restAPI = '';
    ms.notice = new Notice().init({
        id: 'tsp-notice'
    });
    ms.modal= new Modal().init({
        id:'tsp-modal',
        config: {
            clear: true, 
            title: 'Thông báo',
            header: true,
            footer: true,
            escExit:true,  
            draggable: true,
        }
    }); 
    ms.init = async ({
        id, 
        templateName,
        restAPI,            
    }) => {
        // đọc dữ liệu từ local storage
        ms.data = JSON.parse(localStorage.getItem(ms.storageName)) ?? {};
        ms.restAPI = restAPI;
        ms.frmMaster = document.querySelector(`#${id}`); 
        if (ms.frmMaster) {
            let forms = ms.data?.forms;
            let layout = forms? 
                forms.find(form => form.status === true)
                :await fchRequest({
                    ftchURI: `${ms.restAPI}/${templateName}`,                
                });
           
            let modifiedContent = ms.modifiedContent({
                template: layout.template, // string of HTML
                className: 'quotation-info',                
            }); 
           
            if (! forms) {
                layout.status = true;
                layout.modifies =  modifiedContent.elements;
                layout.template = modifiedContent.template;
                ms.data = { ...ms.data, forms: [layout] };
            }
            
            let templateDOM = modifiedContent.templateDOM;
            if (forms) {
                // thay các thành phần đã sửa chữa vào mẫu
                let modifies = forms.find(form => form.status === true).modifies;
                modifies.filter(({ changed, }) => changed === true).forEach(({id,  content}) => {
                    templateDOM.querySelector(`#${id}`).innerHTML = content;
                });
            }

            templateDOM = ms.onMainPage({layout: templateDOM, data: ms.data,})            
            
            ms.frmMaster.append(ms.buildForm({layout:templateDOM }));
            window.addEventListener('keydown', event => ms.ctrlSToSave({event, quotation: ms.data}));
            let autosave = ms.setAtutoSave(300000);

        } else {
            ms.otherPage();
        }
        return ms;
    }

    ms.setAtutoSave = miliSecond => 
        setInterval(()=>{
            if ( ms.data.saved !== true ||  ! ms.data.saved)                
                ms.saveProducts({message: 'Tự động lưu dữ liệu xuống localStorage!'});           
        }, miliSecond);

    // pushMore là mảng các hàm thực hiện thêm cho phiếu giao hàng, hoặc báo giá
    ms.onMainPage = ({layout, data}) => {
       layout = ms.pushSrcImage ({options: data?.options, layout});
       layout = ms.pushUserTocurrentLayout({user: data?.user, layout });
       layout = ms.pushProduct({products: data?.products, layout });
       return layout;

    }

    //đặt dữ liệu vào form
    ms.pushProduct = ({products, layout }) => {
        if (! products) return layout;
        let columns = layout.querySelectorAll('.table__header .table__column');
        let fields = Array.from(columns).map(cloumn => cloumn.classList[1]);
        let rows = products.map((product, index) => {
            let classes = 'table__row';
            let overlayGroup = [];
            if (product.status != 'onprint' ) {
                // tạo 1 bảng che ngăn dữ liệu hiển thị khi in
                classes = 'noprint';
                overlayGroup = [
                    ms.createOverlay({
                        target: product.parentID, 
                        message: 'Sản phẩm này sẽ không được in, bạn muốn', 
                        restore: ms.restoreProduct}),
                ]
            } 
            let cols = fields.map(field => ms[`pushField${field}`]({product, index}) );

            let productRow = createFormItem({
                tag: 'div',
                className: classes,
                id:`product_${product.parentID}`,
                children: [
                    createFormItem({
                        tag: 'div',
                        className:'childcontainer',
                        children: cols,
                    }),
                    ...overlayGroup,
                ]
                
            });
            return productRow;
        });
       
        let productList =  layout.querySelector('.products__list');      
        productList.append(...rows)
        
        return layout;
    }

    // thêm số thứ tự vào cột
    ms.pushFieldindex = ({product, index}) => { return {
        tag: 'div',
        className: 'table__column index',
        innerHTML: `<span>${index + 1}</span>`,
    }};
    
    // thêm tên sản phẩm và 
    ms.pushFieldspecs = ({product, index}) => {
        let {parentID, productName, attributes, orderId} = product;
        let logic = orderId? [{orderId, parentID}] : [{parentID}];
      
        return createFormItem({
            tag: 'div',
            className: 'table__column specs',
            children: [                
                ms.productName({ path: ms.createPathUpdate({path:'.products{0}',logic}), field: 'productName', value: productName}),       
                ... ! attributes? []: ms.createAttribute({parentID, orderId, attributes})
            ], 
        })      
    };
    
    // thêm đơn vị sản phẩm vào biểu mẫu in 
    ms.pushFieldunit = ({product, index}) => {
        let {unit, parentID, orderId } = product; 
        let methods = {
            onfocusout: event => ms.updateDataLineEdited({target: event.target, quotation:ms.data }),
            onkeydown: event => ms.nomalEnterToUpdate({event, quotation:ms.data}),
        }
        return createFormItem({
            tag: 'div',
            className: 'table__column unit',
            children: [ms.createUnit({ unit, parentID, orderId, edit: true, methods })],
        });
        
    }

    // thêm số lượng sản phẩm vào biểu mẫu in
    ms.pushFieldquantity = ({product, index}) => {

        let {orderId, parentID, prices} = product;

        return createFormItem({
            tag: 'div',
            className: 'table__column quantity',
            children: ms.createChildProduct({orderId, parentID, prices, field: 'quantity', edit: true}),
        });
        
    }
    
    // thêm giá sản phẩm vào biểu mẫu in
    ms.pushFieldprice = ({product, index}) =>{
        let {orderId, parentID, prices} = product;
        return createFormItem({
            tag: 'div',
            className: 'table__column price',
            children: ms.createChildProduct({orderId, parentID, prices, field: 'price', edit: true}),
        })
    };

    // thêm tổng tiền vào biểu mẫu in
    ms.pushFieldtotal = ({product, index}) =>{
        let {orderId, parentID, prices} = product;
        return createFormItem({
            tag: 'div',
            className: 'table__column total',
            children: ms.createChildProduct({orderId, parentID, prices, field: 'total', edit: false}),
        })
    };

    // thêm ghi chú vào biểu mẫu in
    ms.pushFieldnote = ({product, index}) =>{
        let {orderId, parentID, prices} = product;
        return createFormItem({
            tag: 'div',
            className: 'table__column note',
            children: ms.createChildProduct({orderId, parentID, prices, field: 'note', edit: true}),
        })
    };

    // thêm chứ năng cho phép in
    ms.pushFieldenableprint = ({product, index}) => {
        let {parentID} = product;
        return createFormItem({
            tag: 'div',
            className: 'table__column enableprint',
            children: ms.createEnablePrint({ID: parentID, forProduct: true, onclickMethod: ms.noprintProduct}),
        })
    };
   
    ms.modifiedContent = ({template, className}) =>  new Editor().init({
        template, // string of HTML
        className,
        config: { 
            processEvent : {
                onfocusout: event => ms.updateContentEditedElement({
                    event, 
                    quotation: ms.data,
                }),               
            }
        }
    });

    ms.otherPage =() => {
        return;
    }
    //xây dựng form
    ms.buildForm = ({layout}) =>      
        createFormItem({
            tag: 'div',
            className:'sheet__content quotation',
            innerHTML: `<h2 class="sheet__title">${ms.title}</h2>`,
            children:[
                createFormItem({
                    tag: 'div',
                    className:'quotation__content',   
                    children: [ms.accordionQuotation({layout}),]                                                                     
                }),
            ]
        });
  
    //tạo accoriion
    ms.accordionQuotation = ({layout}) => {
        return createFormItem({
            tag: 'div',
            className: 'accordion',
            id: 'accordion',
            children: [
                createFormItem({
                    tag: 'div',
                    className:'accordion__item noprint',
                    id: 'template',
                    children: [
                        {   tag: 'h4',
                            className: 'accordion__heading',
                            innerHTML: `<span class='accordion__title accordion__control'>Lựa chọn mẫu báo giá</span>
                                        `,
                            target: 'template',
                        },
                        createFormItem(
                            {   tag: 'div', 
                                className: 'accordion__content',
                                children:[ ms.setChoiceOptions()],
                            }
                        ),
                    ]
                }),
                createFormItem({
                    tag: 'div',
                    className:'accordion__item active',
                    id: 'preview',
                    children: [
                        {   tag: 'h4',
                            className: 'accordion__heading',
                            innerHTML: `<span class='accordion__title accordion__control'>Xem trước</span>
                                        
                                        `,
                            target: 'preview',
                        },
                        //<span class='accordion__button accordion__control'>${ARROW_VSG}</span>
                        {   tag: 'div', 
                            className: 'accordion__content',
                            style: 'max-height:297mm',
                            append: [ms.saveMode(), layout.children[0],  ],
                        }
                    ]
                }),
                
            ]
        })
    }

    //tạo các control xử lý bên cột trái
    ms.setChoiceOptions = () => 
        createFormItem({
            tag: 'div',
            className: 'column__inside customer',           
            children: [
                createFormItem({
                    tag: 'div',
                    className: 'form__groups settemplate',
                    children: [
                        createFormItem({
                            tag: 'div',
                            className:'form__items choice__template',
                            meta:'options',
                            children: [
                                {   tag: 'label',
                                    className:'form__item form__label',
                                    innerHTML: 'Chọn mẫu báo giá',                            
                                },
                                {   tag: 'select',
                                    className: 'form__field form__item regular-text wd-100',
                                    name: 'template',
                                    //append: options,
                                },
                                
                            ]
                        }),
                        createFormItem({
                            tag: 'div',
                            className:'form__items group choice__stamp',
                            children: [
                                createFormItem({
                                    tag: 'div',
                                    className: 'form__item controllers',
                                    meta: 'options',
                                    children: [
                                        {   tag: 'label',
                                            className:'form__item form__label',
                                            innerHTML: 'Dấu công ty',
                                        },
                                        {   tag: 'input',
                                            type: 'text',
                                            className: 'form__field form__item regular-text wd-100',
                                            name: 'stampLink',     
                                            value: ms.data?.options?.stampLink ?? '/wp-content/uploads/2019/08/moccoty.png',
                                           
                                        },
                                        {   tag: 'button',
                                            className: 'form__item form__button',
                                            innerHTML: 'Chọn dấu công ty',
                                            style: 'cursor: pointer',
                                            onclick: event => ms.openWordpressMediaBox({event}),
                                        },                    
                                    ]
                                }),
                                {   tag: 'img',
                                    className:'company__stamp',
                                    name: 'stamp',
                                    src: ms.data?.options?.stampLink ?? '/wp-content/uploads/2019/08/moccoty.png',
                                },
                            ]
                        }),
                        createFormItem({
                            tag: 'div',
                            className:'form__items stamp__onoff',                           
                            children: [
                                {   tag: 'label',
                                    className:'form__item form__label',
                                    innerHTML: 'Hiện dấu công ty',
                                },
                                createFormItem({
                                    tag: 'div',
                                    className: 'wrapper',
                                    meta:'options',
                                    children: [ {
                                            tag: 'input',
                                            type: 'checkbox',
                                            name: 'stampEnable',
                                            className: 'form__field checkbox',
                                            checked: ms.data?.options?.stampEnable ?? true,
                                            target: 'stampLink', 
                                            onchange: event => ms.updateCheckbox({event, data: ms.data})
                                        }
                                    ]
                                }),
                            ]
                        }),
                        createFormItem({
                            tag: 'div',
                            className:'form__items group signature',
                            children: [
                                createFormItem({
                                    tag: 'div',
                                    className: 'form__item controllers',
                                    meta: 'options',
                                    children: [
                                        {   tag: 'label',
                                            className:'form__item form__label',
                                            innerHTML: 'Chữ ký',
                                        },
                                        {   tag: 'input',
                                            type: 'text',
                                            className: 'form__field form__item regular-text wd-100',
                                            name: 'signatureLink',     
                                            value: ms.data?.options?.signatureLink ?? '/wp-content/uploads/2019/08/signature.png',                                       
                                        },
                                        {   tag: 'button',
                                            className: 'form__item form__button',
                                            innerHTML: 'chọn chữ ký',
                                            style: 'cursor: pointer',
                                            onclick: event => ms.openWordpressMediaBox({event, }),
                                        },                    
                                    ]
                                }),
                                {   tag: 'img',
                                    className:'company__stamp',
                                    src: ms.data?.options?.signatureLink ?? '/wp-content/uploads/2019/08/signature.png',
                                },
                            ]
                        }),
                        createFormItem({
                            tag: 'div',
                            className:'form__items stamp__onoff',                            
                            children: [
                                {   tag: 'label',
                                    className:'form__item form__label',
                                    innerHTML: 'Hiện chữ ký',
                                },
                                createFormItem({
                                    tag: 'div',
                                    className: 'wrapper',
                                    meta:'options',
                                    children: [ {
                                            tag: 'input',
                                            type: 'checkbox',
                                            name: 'signatureEnable',
                                            className: 'form__field checkbox',
                                            checked: ms.data?.options?.signatureEnable ?? true,
                                            target: 'signatureLink', 
                                            onchange: event => ms.updateCheckbox({event, data: ms.data})
                                        }
                                    ]
                                }),
                            ]
                        }),
                    ],
                }),                
            ]
        });  
   
    // thêm các nút chức năng lưu và tại lại mẫu báo giá hoặc phiếu giao hàng
    ms.saveMode = () => 
        createFormItem({
            tag: 'div',
            className: 'buttons__modifies noprint',
            style: 'padding: 5px 10px; font-size: 13px; font-style: italic; text-align: right',
            innerHTML: 'Ctrl+S lưu dữ liệu; Ctrl+R tải lại biểu mẫu cơ bản; Ctrl+E tải lại biểu mẫu từ máy chủ; Ctrl+P in biểu mẫu.',            
        })

    // mở modal up hình ảnh của wordpress cho phép tải hình ảnh hoặc mẫu phiếu giao hàng, báo gi
    ms.openWordpressMediaBox = ( {event} )  => {
        event.preventDefault();       
        let image = wp.media({
            title: 'Upload Email',
            multiple: false,
        }).open()
        .on('select', () => {
            let imageUrl = image.state().get('selection').first().toJSON().url;
            ms.updateController({event, value: imageUrl, data: ms.data});
          
        });
    }

    // thông báo đã lưu dữ liệu xuống localStorage
    ms.saveProducts = ({message}) => {       
        ms.data.saved = true;
        localStorage.setItem(ms.storageName,JSON.stringify(ms.data));
        ms.notice.open({
            config: {
                message,
                icon: true,
                style: 'info',
                timer: 1500
            }
        })
    }

    // tải lại mẫu từ máy chủ
    ms.refreshTemplateOnServer = async ({restAPI, form }) => {
        
        try {
            let template = await fchRequest({
                ftchURI: `${restAPI}/${form.name}`,                
            });
            form.template = template.template;
            let modifiedContent = ms.modifiedContent({
                template: form.template,
                className:'quotation-info',
            })            
            form.template = modifiedContent.template;
            form.modifies = modifiedContent.elements;
            ms.saveProducts({message: 'Đã tải biểu mẫu từ máy chủ! Vui lòng đợi tải lại trang!'});
            window.location.reload();
        } catch {

        }
    }

    //tải lại mẫu cơ bản trong localStorage    
    ms.refreshTemplate = ({form}) => {      
        form.modifies.map(modify => modify.changed = false);
        ms.saveProducts({message:'Đã tải lại biểu mẫu cơ bản! Vui lòng đợi tải lại trang! '})
        window.location.reload();
    }
    
    /**
     * định nghĩa cho onclick các link thêm dữ liệu vào báo giá
     */
    ms.setAddQuotaionButtons = () => {
       // console.log(ms.frmMaster);
    }
   
    // phần cập nhật dữ liệu cho lựa chọn mẫu 
    ms.updateController = ({event, value, data}) => {
        let target = event.target;
        let parent = target.parentElement;
        let meta = parent.meta;        
        let boxValue = target.previousElementSibling;    
        let imageBox = parent.nextSibling;
        
        boxValue.value = value;
        imageBox.src = value;    
        
        if (! data[meta] ) data[meta] = {[boxValue.name]:value };
        else  data[meta][boxValue.name] = value;
    }

    ms.updateCheckbox = ({event, data}) => {
        let target = event.target;
        let parent = target.parentElement;
        let meta = parent.meta;
        let value = target.checked;

        let imageBox = document.querySelector(`img.${target.target}`);
        if (value === false) imageBox.classList.add('noprint','nodisplay');
        else imageBox.classList.remove('noprint','nodisplay');

        if (! data[meta] ) data[meta] = {[target.name]:value };
        else  data[meta][target.name] = value;        
    }

    // PHẦN TRAO ĐỔI THÔNG TIN VỚI SERVER
    // lấy sản phẩm từ server 
    // trả về bao gồm quy cách, đơn vị tính, số lượng đơn giá, thành tiền
    ms.getProduct = ({ ID }) =>         
        fchRequest({
            ftchURI:`${PRODUCT_API}/${ID}`,
            data:{
                method: 'GET'     
            }
        }).then(res => {
            // tạo luôn 1 trường giá thành tiền cho product             
            res.product.prices.map(price => price.total = price.quantity * price.price);
            res.product.status ='onprint';
            return res.product;
        });
    
    //  
 
    // lấy dữ liệu khách hàng phục vụ cho lập báo giá, lập phiếu giao hàng
    ms.getUser = ({user} ) =>  
        fchRequest({
            ftchURI:`${USER_API}/${user}`,
            data:{
                method: 'GET'     
            }
    });

    //lấy dữ liệu của đơn hàng dùng cho việc tạo các bảng báo giá, phiếu giao hàng
    ms.getOrder = ({orderId})  =>  
        fchRequest({
            ftchURI:`${ORDER_API}/${orderId}`,
            data:{
                method: 'GET'     
            }
    });
    
    // thêm ảnh dấu và ảnh chữ ký vào layout
    ms.pushSrcImage = ({options, layout}) => {
        if (! options) return layout;
        
        let imageSrc = ['signature', 'stamp'];
        let origSrc = {
            signature: '/wp-content/uploads/2019/08/signature.png',
            stamp: '/wp-content/uploads/2019/08/moccoty.png',
        }
        imageSrc.forEach(imgSrc => {
            let img = layout.querySelector(`.${imgSrc}Link`);
            img.src = options[`${imgSrc}Link`] ?? origSrc[imgSrc];
            if (! options[`${imgSrc}Enable`] || options[`${imgSrc}Enable`] === false ) img.classList.add('noprint','nodisplay');
            else img.classList.remove('noprint','nodisplay');
        })

        return layout;
    }

     // thêm user vào layout
     ms.pushUserTocurrentLayout = ({user, layout}) => {
        //layout is a html object        
        if (! user) return layout;
        let { user_id, nickname, ...another} = user;
        Object.entries(another).forEach(([fieldName, fieldValue])=> {
            let field = layout.querySelector(`.${fieldName}`);
            if (field) {
                Object.assign(field,{
                    data: {path: `.user`, field: fieldName, value: fieldValue}, 
                    contentEditable: true,
                    innerHTML: fieldValue,
                    onfocusout: event => ms.updateDataLineEdited({target: event.target, quotation: ms.data}),
                    onkeydown: event => ms.nomalEnterToUpdate({event, quotation: ms.data}),             
                });     
            }
        });     
        return layout
    }
    
    // cập nhật thay đổi của 1 dòng dữ liệu: 
    // cung cấp product/price; fieldName, value, 
    ms.updateDataLineEdited = ({target, quotation, beforeUpdate, afterUpdate}) => {
        //data: {table: 'user/products', field: fieldName, value: fieldTitle, }, 
        // products/attributes/slug, products/prices/      
        let textContent = target.textContent;
        let correctContent = beforeUpdate? beforeUpdate({target}) : textContent;
        target.data.value = correctContent;
        let updatedField = ms.superSearchField({target: quotation, path: target.data.path});
    
        if (Array.isArray(updatedField)) updatedField = updatedField[0];
        updatedField[target.data.field] = correctContent;
        ms.data.saved = false;
        if (afterUpdate) {
            afterUpdate.forEach(fns => fns({target, quotation}))
        }
    }
    
    // tìm vị trí cần cập nhật theo đường dẫn 
    ms.superSearchField = ({target, path}) => {              

        if (! target ) return undefined;
        if (! path) return target;
        let tmpWh = path.split('.');
        let sndField = tmpWh[1];
        if ( ! sndField ) return target;
        let next = path.replace(`.${sndField}`,'');
        let cmp = sndField.indexOf('|');
        if (cmp === -1) {  return ms.superSearchField({target: target[sndField], path: next}); }
        else {            
            let [cmpField, cmpValue] = sndField.split('|');    
            target = ! target.length? [target]:target;
            let filter = target.filter(tar => tar[cmpField] == cmpValue);
            if (filter.length === 1) filter= filter[0];
            return ms.superSearchField({target: filter, path: next});           
        }

    }

    // thay đổi thông tin user, cập nhật luôn ngay khi mất focus
    ms.endUserEditting = ({target, quotation}) => {        
        let {table, field } =  target.data;
        let edittedValue = target.textContent;
        quotation[table][field] = edittedValue
    }
    
    // tạo 1 bản trong suốt che sản phẩm bị xoá hoặc không in
    ms.createOverlay = ({target, message, restore}) => createFormItem({
        tag: 'span',
        className: 'overlay',
        innerHTML: `<p class="mask">${message}</p>`,
        children: [
            {
                tag: 'a',
                className: 'restore',
                target,
                onclick: event => restore({event, quotation: ms.data, nextMethod: ms.nextMethod}),
                innerHTML: 'Khôi phục',                                
            },
            
        ]
    })

    // khôi phục 1 dòng sản phẩm cho phép in
    ms.restoreProduct = ({event, quotation, nextMethod}) => {
        event.preventDefault();       
        let target = event.target.target;
        let row = document.querySelector(`#product_${target}`);
        row.querySelector('.overlay').remove();     
        ['noprint','table__row'].map(clss =>row.classList.toggle(clss) ) ;        
        
        let currentProduct = quotation.products.find(product => product.parentID == target);
        currentProduct.status = 'onprint';

        // update vat    
        nextMethod({quotation});
        
    }
    ms.nextMethod = ({quotation}) => false;
    //ms.productUint = ({unit}) => 

    // logic là mảng object [{parentID:3885, orderId: 3667},{slug: 'pa_hinh-thuc-in'}]
    // path: `.products.{1}.attributes.slug|{2}`
    ms.createPathUpdate = ({path, logic}) => {
        logic.map((lg,index)  =>{ 
            let logicStr = JSON.stringify(lg);
            logicStr= logicStr.replace(/({)|(})|(")/g,'');
            logicStr= logicStr.replace(/:/g,'|');
            logicStr= logicStr.replace(/,/g,'.');
            path = path.replace(`{${index}}`,`.${logicStr}`);
        }) 
        return path;
    }

    ms.createAttribute = ({parentID, orderId, attributes}) => 
        attributes.map(({label, name, slug}) => {
            let logic = orderId? [{orderId, parentID},{slug}]: [{parentID},{slug}];

            return createFormItem({
                tag: 'span',
                className: `spec__group ${slug}`,
                innerHTML:`<b>${label}:</b> `,
                children: [
                    {
                        tag: 'span',
                        className: 'editable',
                        innerHTML: `${name}`,
                        contentEditable: true,
                        data: { path: ms.createPathUpdate({path: '.products{0}.attributes{1}', logic}) , field: 'name', value: name},
                        onfocusout:  event => ms.updateDataLineEdited({target: event.target, quotation: ms.data}),
                        onkeydown: event => ms.nomalEnterToUpdate({event, quotation: ms.data}),
                    }
                ]
            })              
        })
      
    ms.createProductLine = ({orderId, parentID, price, field, edit, methods, } ) => {
        let logic = orderId? [{orderId, parentID},{productID: price.productID}]:[{ parentID}, {productID: price.productID}]; 
        let path = ms.createPathUpdate({path: '.products{0}.prices{1}', logic});
        let line = createFormItem({
            tag: 'span',
            className: `child ${edit? 'editable':'uneditable'} child__${field}`,
            innerHTML: ['note'].indexOf(field) !== -1? `${price[field]}`:`${price[field].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,                
            contentEditable: edit,
            data: {path, value: price[field], field},
            ...methods,
        });
        return line;
    }
    
        //tạo tên sản phẩm có thể thay đổi được
    ms.productName = ({path, field, value}) => 
        createFormItem({ // tạo tên sản phẩm trong cột tên & quy cách
            tag: 'span',
            className: 'bold',
            innerHTML: '*&nbsp;',
            children: [{
               tag: 'span',
               className: 'editable',
               innerHTML: value, 
               contentEditable: true,
               data: {path, field, value},
               onfocusout: event => ms.updateDataLineEdited({target: event.target, quotation:ms.data }),
               onkeydown: event => ms.nomalEnterToUpdate({event, quotation: ms.data}),
               
            }]
       });
       
       // update đơn giản cho các cột ghi chú khi nhấn enter
       ms.nomalEnterToUpdate = ({event, quotation}) => {
           let code = event.code.toLowerCase();
            let codeKey = {                
                enter: () => {ms.updateDataLineEdited({target: event.target, quotation}); event.preventDefault()},             
                numpadenter: () => codeKey.enter(),
                escape: () =>  ms.undoValue({target: event.target}),
            }        
            return  ! codeKey[code] ? ()=>{}: codeKey[code]();   
       }

       
       // thay đổi bình thường đối với ghi chú (note), 
       // thay đổi cho số lượng (quantity), giá (price)       
       ms.createChildProduct = ({orderId, parentID, prices, field, edit}) => {        
        // tạo cột quantity, prices, total, note cho báo giá hoặc phiếu giao hàng
        if (! prices) return [];        
        let outQuantity = prices.map((price, index) => {   
            let methods = ['total','note'].indexOf(field) === -1 ? {
                onfocus: event => ms.setContentToEdit(event.target),
                onfocusout: event=> ms.updateDataLineEdited({
                    target: event.target, 
                    quotation: ms.data,                       
                    afterUpdate: [ms.updateTotal, ms.setContentToShow]}),
                onkeydown: event => ms.setEnterToUpdate({event, quotation: ms.data, mirror:methods.onfocusout}),
            }: {
                onfocusout: event => ms.updateDataLineEdited({target: event.target, quotation: ms.data}),
                onkeydown: event => ms.nomalEnterToUpdate({event, quotation: ms.data}),
            };         
            
            let outElement = ms.createProductLine({orderId, parentID, price, field, edit, methods}); 
            if (field == 'total' && index == 0 ) outElement.addEventListener('DOMSubtreeModified',event => ms.updateVATFromTotal({quotation:ms.data}));
            return  outElement; 
        })         
       
        return outQuantity;
    }

    // bỏ các dấu ngăn cách ngàn, triệu trong khi đợi thay đổi dữ liệu
    ms.setContentToEdit = (target) => {
        target.textContent = target.data.value;
    }
    
    // chuyển content về chữ số
    ms.setContentToShow = ({target}) => {
        target.textContent = target.data.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // nhấn enter là update
    ms.setEnterToUpdate = ({event,quotation}) => {  
        
        let blockKey ='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_-+=/,<.>/?`\':";';
        let code = event.code.toLowerCase();
        let codeKey = {
            space: () => false,
            enter: () => {ms.updateDataLineEdited({
                target: event.target, 
                quotation: ms.data,                
                afterUpdate: [ms.updateTotal]}); event.preventDefault()},
            numpadenter: () => codeKey.enter(),
            escape: () =>  ms.undoValue({target: event.target}),
            default: () => blockKey.indexOf(event.key) === -1 
        }        
        return ! codeKey[code] ? codeKey.default(): codeKey[code]();           
    }
   
    ms.undoValue = ({target}) => target.textContent = target.data.value;

    // cập nhật cột thành tiền
    ms.updateTotal = ({target, quotation}) => {        
        let child = ms.superSearchField({target: quotation, path: target.data.path});
        if (child) child.total = child.price * child.quantity; 
        let childrenTotal =  document.querySelectorAll(`.child__total`);
        let currentTotal = Array.from(childrenTotal).find(childTotal => childTotal.data.path == target.data.path );
        currentTotal.textContent = child.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return false;
    }

    ms.updateContentEditedElement = ({event, quotation}) => {
        let target = event.target;
        let id = target.id;
        let modify = quotation.forms.find(form => form.status == true).modifies.find(mdfy => mdfy.id == id ); 
        modify.changed = true;
        modify.content = target.innerHTML;
        ms.data.saved = false;
        return false;
    }

    ms.ctrlSToSave= ({
        event, 
        quotation
    }) => {
        
        let ctrl = window.navigator.platform.match("Mac")? event.metaKey: event.ctrlKey
        let keyCode = event.code.toLowerCase();
        if ( ctrl) {             
            switch (keyCode) {
                case 'keys':                    
                    event.preventDefault();           
                    ms.saveProducts({message: 'Đã lưu dữ liệu xuống localStorage!'});
                    break;
                case 'keyr':
                    event.preventDefault();           
                    ms.refreshTemplate({form: ms.data.forms.find(fr => fr.status === true )});
                    break;
                case 'keye':
                    event.preventDefault();           
                    ms.refreshTemplateOnServer({restAPI: ms.restAPI, form: ms.data.forms.find(fr => fr.status === true )})
                    break;
                case 'keyp':
                    event.preventDefault();           
                    window.print();
                    break;
            }
        }
    }

    // tạo button noprint và delete 
    ms.createEnablePrint = ({ID, forProduct, onclickMethod}) => [
        createFormItem({
            tag: 'a',
            className: 'noprint__button',
            target: ID,
            innerHTML: '<span class="dashicons dashicons-hidden"></span>',  
            onclick: event => onclickMethod({event, quotation: ms.data}), // qt.noprintProduct({event, quotation: qt.data}),            
        }),
        ...forProduct? [createFormItem({
            tag: 'a',
            className: 'delete__button',
            target:ID,
            innerHTML: '<span class="dashicons dashicons-trash"></span>',  
            onclick: event => ms.deleteProductOutForm({event, quotation: ms.data}),            
        })]:[],
    ]

     // xoá 1 sản phẩm ra khỏi báo giá
     ms.deleteProductOutForm =({event, quotation})  => {
        event.preventDefault();
        let target = event.target.closest('a').target;
   
        // bật modal hỏi xem có muốn xoá hay không
        let deletedProduct = quotation.products.find(product => product.parentID == target);
      
        ms.modal.open({ 
            config: {
                title: 'Cảnh báo xoá sản phẩm ra khỏi báo giá',
                content: [ms.deleteProductMesage({product:deletedProduct})],
                clear: true,
                header: true,
            }
        });
    }

    //thông báo xoá 1 sản phẩm ra khỏi quotation
    ms.deleteProductMesage = ({product}) => createFormItem({
        tag: 'p',
        className: 'message',
        innerHTML: `Bạn thật sự muốn xoá sản phẩm <b>${product.productName}</b> ra khỏi báo giá&nbsp;`,
        children: [
            {
                tag: 'a',
                href: '#',
                class: 'button btn',
                innerHTML: 'Xác nhận xoá',
                onclick: event => ms.deletedProductOutFormForever({product, quotation: ms.data}),
            }
        ]
    })


    ms.deletedProductOutFormForever =({ product, quotation }) => {
        // xoá trên giao diện   
        document.querySelector(`#product_${product.parentID}`).remove();
        quotation.products = quotation.products.filter(deleteProduct => deleteProduct.parentID != product.parentID );

        // update lại 
        if (quotation.vat) {
            quotation.vat.data = ms.updateVAT({products: quotation.products});
            ms.pushVATToController({vat: quotation.vat });
        }

        ms.modal.close({clear: true});
    }

     // không cho phép in 1 dòng sản phẩm ra báo giá (khi in ra giấy)
     ms.noprintProduct = ({event, quotation}) => {
        event.preventDefault();

        let target = event.target.closest('a').target;

        let row = document.querySelector(`#product_${target}`);    
        let overlay = ms.createOverlay({target, message: 'Sản phẩm này sẽ không được in, bạn muốn', restore: ms.restoreProduct});            
        row.append(overlay);
        
        ['noprint','table__row'].map(clss => row.classList.toggle(clss));
        
        let currentProduct = quotation.products.find(product => product.parentID == target);
        currentProduct.status = 'noprint';
        
        if (quotation.vat) {
            quotation.vat.data = ms.updateVAT({products: quotation.products});
            ms.pushVATToController({vat: quotation.vat });     
        }

    }

    ms.createUnit = ({ unit, parentID, orderId, edit, methods }) => {
        let logic = orderId? [{orderId, parentID}]: [{parentID}];
        return createFormItem({
            tag: 'span',
            className: `child ${edit ? 'editable' : 'uneditable'} child__unit`,
            innerHTML: unit,
            contentEditable: edit,
            data: { path: ms.createPathUpdate({path:'.products{0}',logic}), field: 'unit', value: unit },
            ...methods,
        });        
    }
 
}

export default Master;
