import { buildTag } from '../helpers/buildtag.js';
/**
 * notice hiển thị thông báo bằng pop push 
 */

 const Notice = function() {
     let nt = this;
     nt.noticer;
     /**
      * 
      * @param {
      *  id
      * } 
      */
     nt.init = ({ id }) => {
        nt.noticer = document.querySelector(`#${id}`);
         if (! nt.noticer) { 
            nt.noticer = nt.addNoticer(id);
            document.body.append(nt.noticer.notice); 
            let closeBtn = nt.noticer.noticeButton.querySelector('.close');
            closeBtn.onclick = event => nt.closeEvent(event);
        }
        return nt;
     }
 
     nt.addNoticer = id => {
        let myNotice = document.createElement('div');
        myNotice.id = id;
        myNotice.className = 'noticer'; 
        let noticeIcon = buildTag({
            tag:'div',
            className:'noticer__icon',
            innerHTML: `<span class=dashicons></span>`
        });
        let noticeMessage = buildTag({
            tag:'div',
            className:'noticer__message',
            innerHTML:`<p class=message></p>`
        });

        let noticeButton = buildTag({
            tag:'div',
            className:'noticer__button',
            innerHTML: `<span class='dashicons dashicons-no-alt close'></span>`                
        })
        myNotice.append(noticeIcon,noticeMessage,noticeButton);
        return {
            notice: myNotice,
            noticeIcon, 
            noticeMessage:noticeMessage.querySelector('.message'),
            noticeButton,
        }
     }
 
     nt.open = ({        
         message, // nội dung của thông báo
         button,  // cho phép có nút close
         style, // biểu tượng của notice (!: thông tin; tam giác: nguy hiểm;)
         timer,
     }) => {       
         if (message) nt.noticer.noticeMessage.innerHTML = message;        
         if (! button || button === false) nt.noticer.noticeButton.classList.add('hide');
         if (! style ) nt.noticer.notice.classList.add('--info','open');
         else nt.noticer.notice.classList.add(`--${style}`, 'open');
         if (timer ) {
             setTimeout(() => {
                nt.close(); 
             }, timer);
         }
     } 
 
     nt.closeEvent = event => {
         nt.close(); 
     }
     nt.close = () => {        
         nt.noticer.notice.classList.remove('open');
     }
     return nt;
 }

export { Notice };
