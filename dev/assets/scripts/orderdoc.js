import { fchRequest } from './helpers/fetch.js';
import { createFormItem } from './helpers/formgroup.js';
import { masterModal, masterNotice } from './master.js';
import { URI_UPLOAD} from './helpers/const.js';
import { DragDrop } from './uxui/Dragdrop.js';

const DDocument = function() {
      let dd = this; 
      dd.fileContent;
      dd.form;
      dd.init = () => {
            let docLinks = document.querySelectorAll('.order--document');
            Array.from(docLinks).map(doclink => {
                  let owner = JSON.parse(doclink.getAttribute('data'));
                  doclink.removeAttribute('data');
                  Object.assign(doclink, {owner});
                  let removeButton = doclink.querySelector('.delete__button');
                  if (removeButton) 
                        Object.assign(removeButton, {
                              onclick: event => dd.removeDocument({event, }),                             
                        })
                  
                  let previewButton = doclink.querySelector('.preview--document');
                  if (previewButton) previewButton.onclick = event => dd.previewDocument({event});
                  let uploadButton = doclink.querySelector('.upload--document');
                  if (uploadButton) uploadButton.onclick = event => dd.uploadDocument({event});                  
            })
            dd.reader = new FileReader();            
            dd.reader.addEventListener('load', (event) => {dd.fileContent = event.target.result});
            dd.form = dd.dragAndDropUploadForm();
            return dd;
      }
      
      // tạo mới 1 nút xoá file ra khỏi thông tin
      dd.removeButton = () => 
            createFormItem({
                  tag: 'span',
                  className: 'dashicons dashicons-no-alt delete__button',                 
                  onclick: event => dd.removeDocument({event, }),
            })

      dd.removeDocument = async ({event, }) => {
            event.preventDefault();
            let target = event.target.closest('a');
            let owner = target.owner;
            owner.file = '';
            let previewDocument = target.querySelector('.preview--document')
            previewDocument.innerHTML = owner.title;            
            previewDocument.classList.remove('preview--document');
            previewDocument.classList.add('upload--document');
            previewDocument.onclick = event =>  dd.uploadDocument({event});
            target.querySelector('.delete__button').remove();
            try {
                  let removeResult = await fchRequest({
                        ftchURI: '/wp-json/tinsinhphuc/document/remove',
                        data: {
                              method: 'POST',
                              body: JSON.stringify({owner}),
                        }
                  })
                  masterNotice.open( {
                        message: removeResult.message,
                        icon: true,
                        style: 'info',
                        timer: 1500
                    })
            } catch {

            }

      }

      dd.previewDocument = ({event} ) => {
            event.preventDefault();
            let owner = event.target.closest('a').owner;
            let docOptions = {
                  height: "830px",
                  width :"830px"
            };
            PDFObject.embed(`${URI_UPLOAD}${owner.file}` , "#modalmaster .modal__body",docOptions);	
            masterModal.open({ config: {
                        clear: true, 
                        title:`Bạn đang xem ${owner.file}`,
                        header: true,
                        footer: false,
                  }
            });
            
      }

      dd.uploadDocument = ({event}) => {
            event.preventDefault();
            let target = event.target.closest('a');
            let uploadForm = masterModal.modal.body.querySelector('#uploader');
            let uploadToServer = masterModal.modal.footer.querySelector('.upload__toserver');
            if (! uploadForm) masterModal.modal.body.append(dd.form.drag.main);
            if (! uploadToServer) masterModal.modal.footer.append(dd.uploadButtonFiles({target}));
            else uploadToServer.target = target;
            masterModal.open({ config: {
                        title: `Bạn ${target.owner.title} cho #${target.owner.ID}`,                  
                        footer: true,
                  }
            });
            
      }

      dd.dragAndDropUploadForm = () => {  
            const drapDrop = new DragDrop().init({
                  id: 'uploader',
                  config: {   
                        message: 'Kéo và thả files vào đây!',     
                        title: 'Chọn file',                                                
                        dataType : 'file',       
                        multiple: false,
                        accept: '.pdf',
                  }
            });
            return drapDrop;
      }

      dd.choiceFileChange = ({ event} )=> {
            let file = event.target.files[0];
            let fileName = event.target.files[0].name;
            let uploadFilename = document.querySelector('.upload__filename');
            if (uploadFilename) uploadFilename.innerHTML = fileName;
            dd.reader.readAsDataURL(file);
      }

      dd.uploadButtonFiles = ({target}) => 
            createFormItem({
                  tag: 'p',
                  className: 'upload__server',                  
                  children: [
                        {
                              tag: 'span',
                              innerHTML: 'Tải lên server',
                              className: 'upload__toserver button --primary',
                              target,
                              onclick: event => dd.uploadFileToServer({event}),
                        }
                  ]
                  
            })
      
      dd.uploadFileToServer = async ({event} ) => { 
            let target = event.target.target; // 
            let files = dd.form.drag.files;
            let body = new FormData();
            // lệnh bên dưới dùng upload cho nhiều file
            //dd.form.drag.files.map(file => body.append('files[]', file ));
            body.append('files', files[0] )
            body.append('owner', JSON.stringify(target.owner));
            if (files.length !== 0) { 
                  
                  try {
                        let resData = await fchRequest({
                           
                              ftchURI: '/wp-json/tinsinhphuc/document/upload',
                              data: {
                                    method: 'POST',
                                    headers: {  },
                                    body,
                              }
                        });
                        if (resData.result ) { 
                              // thay thế              
                              target.owner.file = files[0].name;
                              let uploadDocument = target.querySelector('.upload--document');
                              uploadDocument.innerHTML = files[0].name;
                              uploadDocument.classList.remove('upload--document');
                              uploadDocument.classList.add('preview--document');
                              uploadDocument.onclick = event =>dd.previewDocument({event});
                              target.append(dd.removeButton());                                                                                     
                              
                              masterModal.close();
                              masterNotice.open( {
                                    message: resData.message,
                                    icon: true,
                                    style: 'info',
                                    timer: 1500
                                })
                        } else {
                              dd.form.message.innerHTML = resData.message;
                        }
      
                  } catch { }
            } else {
                  dd.form.message.innerHTML = 'Chọn file đi Ông thần ve chai!!!!';
            }

      } 
}

const dDocument = new DDocument().init();

