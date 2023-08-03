import buildTag from "../helpers/buildtag.js";

const MODAL_HTML = `<div class="modal__wrapper"><div class="modal__element modal__header header">
<div class="modal__icon md-icon"><div class=exclamation></div></div>
<div class="modal__title md-title"><h4 class=title>Cảnh báo</h4></div>
<div class="modal__btn close"><div class=closeicon></div></div>
</div>
<div class="modal__element modal__body body"></div>
<div class="modal__element modal__footer footer"></div>
</div>`;

const Modal = function() {
    let md = this;
    let pos = {};
    md.modal; 
    // chạy khởi tạo 1 modal
    md.init = ({id, config}) => {
        if (! id ) return;
        
        let modal = document.querySelector(`#${id}`);

        if (! modal) {
            modal = md.createModal({id, config});
            document.body.append(modal.main);
        } else {
            if (! md.modal) modal = md.collectModal({modal, config});
        }
        if (! md.modal ) md.modal = modal;   
           
        return md;
    }
    // đã tạo modal theo chuẩn
    // chưa khai tạo mới
    md.createModal = ({id, config}) => {
        let modal = buildTag({
            tag: 'div',
            className: 'modal',
            id,
            innerHTML: MODAL_HTML,
        })
        modal = md.collectModal({ modal, config });
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
            wrapper: modal.querySelector('.modal__wrapper'),          
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
        
        Object.entries(config).map(([method, paramater])=> {if (md[method]) md[method]({modal: modalIn, paramater })});

        return modalIn;
    }
 
    // xoá tất cả nội dung của body trước đi đóng
    md.clear = ({modal, paramater }) => modal.main.clear = paramater;
    
    // thay đổi tiêu đề của modal
    md.title = ({modal, paramater}) => modal.title.innerHTML = paramater;

    // thêm nội dung cho modal
    md.content = ({modal, paramater}) => 
        paramater.map(para => modal.body.append(para));
    
    // cho phép di chuyển modal trên màn hình
    md.draggable = ({modal, paramater}) => {
        if (paramater === false) return;
        let { wrapper, title } = modal;        
        title.onmousedown = event => md.mouseDown({event,wrapper});
    }
    
    // click giữ chuột trước khi kéo modal đi
    md.mouseDown = ({event,wrapper}) => {
        event.preventDefault();
        pos.x = event.clientX;
        pos.y = event.clientY;
        document.onmousemove = event => md.dragElement({event,wrapper});
        document.onmouseup = event => md.dropElement({event,wrapper});
    }

    // di chuyển modal
    md.dragElement = ({event,wrapper}) => {
        event.preventDefault();        
        let dragPos = {x: pos.x - event.clientX, y: pos.y - event.clientY};
        pos.x = event.clientX, pos.y = event.clientY;
        
        wrapper.style.top = `${wrapper.offsetTop - dragPos.y}px`;
        wrapper.style.left = `${wrapper.offsetLeft - dragPos.x}px`;
    }

    // thả modal ra
    md.dropElement = (event) => {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    // cho phép click esc để tắt modal
    md.escExit = ({modal, paramater}) => {
        if (paramater === false) return;
        window.onkeydown = event => md.escToClose({event, modal});
    }

    // đóng modal khi lick esc
    md.escToClose = ({event, modal}) => {       
        if (event.keyCode === 27) {
            md.close();
        };
    }
      
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
        document.querySelector('html').classList.remove('none-flow');  
        mdl.main.classList.remove('open');  
    }

    md.open = ({ config }) => {    
        if (config) Object.entries(config).map(([method, paramater])=> md[method]({modal: md.modal, paramater }));            
        document.querySelector('html').classList.add('none-flow');         
        md.modal.main.classList.add('open');        
    }
    
 }
 
export default Modal;
 