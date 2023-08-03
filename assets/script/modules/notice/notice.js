import buildTag from '../helpers/buildtag.js';
/**
 * notice hiển thị thông báo bằng pop push 
 */
//<div id="tsp-notice" class="noticer"></div>
const NOTICE_HTML =`<div class="noticer__icon"><span class="dashicons"></span></div><div class="noticer__message"><p class="message"></p></div><div class="noticer__button"><span class="dashicons dashicons-no-alt close"></span></div>`;
 const Notice = function() {
     let nt = this;
     nt.noticer;
     /**
      * 
      * @param {
      *  id
      * } 
      */
     nt.init = ({ id, config }) => {
        if (! id ) return;
        let noticer = document.querySelector(`#${id}`);
        if (! noticer) {             
            noticer = nt.addNoticer({id,config});
            document.body.append(noticer.notice);             
        } else {
            if (! nt.noticer) noticer = nt.collectNotice({notice: noticer, config});
        }
        if (! nt.noticer) nt.noticer = noticer;
        return nt;
    }
    
    nt.addNoticer = ({id,config}) => {
        const notice = buildTag({
            tag: 'div',
            id,
            className:'noticer',
            innerHTML: NOTICE_HTML,
        });
        
        const collect = nt.collectNotice({notice, config});
        return collect;
    }
    
    nt.collectNotice = ({notice, config}) => {
        const collect = {
            notice,
            noticeIcon: notice.querySelector('.noticer__icon'),
            message:notice.querySelector('.message'),
            noticeButton: notice.querySelector('.close'),
        }
        collect.noticeButton.onclick = event => nt.closeEvent(event);
        if (config) Object.entries(config).forEach(([method, paramater])=> nt[method]({notice: collect, paramater }));   
        return collect;
    }

    nt.message = ({notice,paramater }) => notice.message.innerHTML = paramater;
    nt.button = ({notice, paramater}) => { if (paramater === false) notice.noticeButton.classList.add('hide');}
    nt.style = ({notice, paramater}) => {
        if (paramater) notice.notice.classList.add(`--${paramater}`);
        else notice.notice.classList.add('--info');
     }

    nt.timer = ({notice, paramater}) =>{
        let timeout = setTimeout(()=>{
            nt.close(), clearTimeout(timeout)
        }, paramater);

    } 
 
    nt.icon = ({notice, paramater}) => {
        if (paramater === false) notice.noticeIcon.classList.add('hide');
    }

    nt.open = ({ config }) => {          
        if (config) Object.entries(config).forEach(([method, paramater])=> nt[method]({notice: nt.noticer, paramater }));   
        nt.noticer.notice.classList.add('open');
      
    } 
 
     nt.closeEvent = event => {
        nt.close(); 
     }
     nt.close = () => {        
        nt.noticer.notice.classList.remove('open');
     }
     return nt;
 }

export default Notice;
