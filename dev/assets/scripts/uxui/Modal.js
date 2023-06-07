import { buildTag } from "../helpers/buildtag.js";

const isNodeDOM = element => {
    return element instanceof Element;
};
const modalInnerHtml = `<div class="modal__wrapper"><div class="modal__element modal__header header">
<div class="modal__icon md-icon"><div class=exclamation></div></div>
<div class="modal__title md-title"><h4 class=title>Cảnh báo</h4></div>
<div class="modal__btn close"><div class=closeicon></div></div>
</div>
<div class="modal__element modal__body body"></div>
<div class="modal__element modal__footer footer"></div>
</div>`;

const Modal = function() {
    let md = this;
    md.modal;
    // chạy khởi tạo 1 modal
    md.init = ({id, config}) => {
        if (! id ) return;
        
        let modal = document.querySelector(`#${id}`);

        if (! modal) modal = md.createModal({id, config});                   
        else modal = md.collectModal({modal, config});
        md.modal = modal;   
        document.body.append(md.modal.main);   
        return md;
    }
    // đã tạo modal theo chuẩn
    // chưa khai tạo mới
    md.createModal = ({id, config}) => {
        let modal = buildTag({
            tag: 'div',
            className: 'modal',
            id,
            innerHTML: modalInnerHtml,
        })
        modal = md.collectModal({ modal, config })
        return modal;
    }
    
    md.collectModal = ({ modal, config }) => {           
        let modalIn = {
            main: modal,
            header: modal.querySelector('.header'),
            body: modal.querySelector('.body'),
            footer: modal.querySelector('.footer'),
            icon: modal.querySelector('.md-icon'),
            title: modal.querySelector('.md-title'),          
        }
     
        // thêm một lớp phủ
        let overlay = modalIn.main.querySelector('.mdoverlay');
        if ( !overlay ){
            overlay = buildTag({
                tag: 'div',
                className: 'modal__overlay mdoverlay close',
            })
        } 
        modalIn.main.append(overlay);        
        modalIn.overlay = overlay;
  
        let closingBtns = modalIn.main.querySelectorAll('.close')
        
        if (closingBtns) 
        Array.from(closingBtns).map(closingBtn => closingBtn.onclick = event =>  md.close());
        
        Object.entries(config).map(([method, paramater])=> md[method]({modal: modalIn, paramater }));

        return modalIn;
    }
 
    // xoá tất cả nỗi dung của body trước đi đóng
    md.clear = ({modal, paramater }) => modal.main.clear = paramater;
    
    // thay đổi tiêu đề của modal
    md.title = ({modal, paramater}) => modal.title.innerHTML = paramater;

    // thêm nội dung cho modal
    md.content = ({modal, paramater}) => 
        isNodeDOM(paramater)? modal.body.append(paramater)
        :modal.body.innerHTML = paramater;

    
    // dấu hoặc hiển thị tiêu đề modal
    md.header = ({modal, paramater}) => 
        paramater === false? modal.header.classList.add('hide'):
                            modal.header.classList.remove('hide');

    md.footer = ({modal, paramater}) => 
        paramater === false? modal.footer.classList.add('hide'):
                        modal.footer.classList.remove('hide');

    // đóng modal lại
    md.close = () => {          
        let mdl = md.modal;
        if (mdl.main.clear && mdl.main.clear === true) mdl.body.innerHTML = '';   
        document.body.removeAttribute('style');
        mdl.main.classList.remove('open');      
    }

    md.open = ({ config }) => {    
        if (config)  Object.entries(config).map(([method, paramater])=> md[method]({modal: md.modal, paramater }));            
        document.body.style.overflow = 'hidden'; 
        md.modal.main.classList.add('open');        
    }
    
 }
 
export {  Modal };
 