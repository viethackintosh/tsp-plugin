import {
      fchRequest,        
      createFormItem,
      masterNotice, 
      masterModal,
  } 
from './index.min.js';
import { URI_UPLOAD} from './helpers/const.min.js';

const DDocument = function() {
      let dd = this; 
      dd.fileContent;
      dd.reader;
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
            dd.form = dd.uploadDocumentForm();
            return dd;
      }
      
      // tạo mới 1 nút xoá file ra khỏi thông tin
      dd.removeButton = () => 
            createFormItem({
                  tag: 'span',
                  className: 'dashicons dashicons-trash delete__button',                 
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
            masterModal.open({ options: {
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
            let uploadForm = masterModal.modal.querySelector('.body .upload__wrapper');
            let uploadToServer = masterModal.modal.querySelector('.footer .upload__toserver');

            if (! uploadForm) masterModal.modal.querySelector('.body').append(dd.form.form);
            if (! uploadToServer) masterModal.modal.querySelector('.footer').append(dd.uploadButtonFiles({target}));
            else uploadToServer.target = target;
            masterModal.open({ options: {
                        title: `Bạn ${target.owner.title} cho #${target.owner.ID}`,                  
                        footer: true,
                  }
            });
            
      }

      dd.uploadDocumentForm = () => {
            let message = createFormItem({
                  tag: 'p',
                  className: 'upload__message',
            });
            let uploadFileName = createFormItem({
                  tag: 'span',                                          
                  innerHTML: 'file name here',
                  className: 'upload__filename',   
            });
            let inputFile = createFormItem({
                  
                  tag: 'input',
                  type: 'file',
                  accept : '.pdf',
                  id: 'filetoupload',
                  style: 'display:none',
                  onchange: event => dd.choiceFileChange({event}),
                  
            })
            
            let mainForm = createFormItem({
                  tag: 'div',
                  className: 'upload__wrapper',                 
                  children: [ 
                        message, 
                        createFormItem({
                              tag: 'p',
                              className: 'upload__item',
                              children: [                                    
                                    uploadFileName,
                              ]
                        }),
                        createFormItem( { 
                              tag: 'label',
                              className: 'upload__choicefile button --primary',                             
                              innerHTML: 'Chọn file',                             
                              children: [ inputFile,]
                        }),
                  ]
            })

            return {
                  form: mainForm,
                  message,
                  uploadFileName,
                  inputFile,
            }
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

            let file = dd.form.inputFile.files[0];            
            let target = event.target.target; //     

            if (file) {

                  let fileInfo = {name: file.name, type:file.type, fileContent:  dd.fileContent };
                  try {
                        let resData = await fchRequest({
                              ftchURI: '/wp-json/tinsinhphuc/document/upload',
                              data: {
                                    method: 'POST',
                                    body: JSON.stringify({owner: target.owner, file:  fileInfo}),
                              }
                        });
                      
                        if (resData.result ) { 
                              // thay thế 
                              
                              target.owner.file = file.name;
                              let uploadDocument = target.querySelector('.upload--document');
                              uploadDocument.innerHTML = file.name;
                              uploadDocument.classList.remove('upload--document');
                              uploadDocument.classList.add('preview--document');
                              uploadDocument.onclick = event =>dd.previewDocument({event});
                              target.append(dd.removeButton());
                              dd.form.inputFile.value = null;
                              dd.form.uploadFileName.innerHTML ='File name here';
                              dd.form.message.innerHTML = '';                              
                              
                              masterModal.close({clear : false});
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

