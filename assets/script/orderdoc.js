import fchRequest from './modules/helpers/fetch.js';
import createFormItem from './modules/helpers/formgroup.js';
import Master from './master.js';
import { URI_UPLOAD} from './modules/helpers/const.js';
import DragDrop from './modules/dragdrop/dragDrop.js';
import UploadFiles from './modules/dragdropfile/dragDropUpload.js';

const DDocument = function() {
      const dd = new Master(); 
      let uploadFormStandard;
      const uploadFiles = new UploadFiles();
      const dragDropOrders = new DragDrop();
      const errorNotice = createFormItem({
            tag: 'div',
            className: 'notice__warning',
      });
      const message = {
            success: 'Đã tải tài liệu lên server',
            error: 'Kiểm tra lại tài liệu, không thể tải lên',
      }
    
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
            uploadFormStandard = dd.dragAndDropUploadForm();
            return dd;
      }
      
      // tạo mới 1 nút xoá file ra khỏi thông tin
      dd.removeButton = () => 
            createFormItem({
                  tag: 'span',
                  className: 'delete__button',  
                  innerHTML: 'x',
                  onclick: event => dd.removeDocument({event }),
            })

      dd.removeDocument = async ({event, }) => {
            event.preventDefault();
            const span = event.target.closest('p');
            const link = event.target.closest('a');
            let { owner } =  link;
            owner.file = '';
            span.innerHTML = owner.title;
            span.classList.remove('preview--document');
            span.classList.add('upload--document');
            span.onclick = event => dd.uploadDocument({event});
 
            try {
                  let removeResult = await fchRequest({
                        ftchURI: '/wp-json/tinsinhphuc/document/remove',
                        data: {
                              method: 'POST',
                              body: JSON.stringify({owner}),
                        }
                  })
                  dd.notice.open({ 
                        config: {
                              message: removeResult.message,
                              icon: true,
                              style: 'info',
                              timer: 1500
                        }
                  })
            } catch {

            }

      }

      dd.previewDocument = ({event} ) => {
            event.preventDefault();
            const target = event.target;
            if (target.className.indexOf('title') != -1 ) {
                  let owner = event.target.closest('a').owner;
                  let docOptions = {
                        height: "830px",
                        width :"830px"
                  };
                  PDFObject.embed(`${URI_UPLOAD}${owner.file}` , "#tsp-modal .modal__body",docOptions);	
                  dd.modal.open({ config: {
                              clear: true, 
                              title:`Bạn đang xem ${owner.file}`,
                              header: true,
                              footer: false,
                        }
                  });
            }
            
      }
   
      /**
       * 
       * @param {event} param0 
       * chọn file upload tài liệu lên serve lưu trữ
       */
      dd.uploadDocument = ({event}) => {
            event.preventDefault();
            const target = event.target.closest('a');
            if (target) {
                  const { ID , name} = target.owner;            
                  const docOrders = [...document.querySelectorAll('.order--document')];
                  dragDropOrders.resetDragDrop();
                  uploadFiles.resetDragDrop();
               
                  dragDropOrders.data.result= [ID];
      
                  const orders = dd.filterOrders({orders: docOrders, condition:{ID, name}});
                  
                  // nếu có order thoả điều kiện
                  if (orders.length !== 0) {
                        const orderItems = dd.buildDragItem({orders})
                        dragDropOrders.setDragItem({items:orderItems});
                        dragDropOrders.data.dragZone.innerHTML = '';
                        dragDropOrders.data.dragZone.append(...orderItems);
                  }
                  
      
                  let uploadForm = dd.modal.modal.body.querySelector('#docform');
                  let uploadToServer = dd.modal.modal.footer.querySelector('.upload__toserver');
                  if (! uploadForm) dd.modal.modal.body.append(uploadFormStandard);
                  if (! uploadToServer) dd.modal.modal.footer.append(dd.uploadButtonFiles({target}));            
                  else uploadToServer.target = target;
      
                  dd.modal.open({ 
                        config: {
                              title: `Bạn ${target.owner.title} cho #${target.owner.ID}`,                  
                              footer: true,
                        }
                  });

            }
            
      }

      /**
       * 
       * @param {*} param0 
       * @returns
       * lọc danh sách đơn hàng theo điều kiện trùng tên, khác ID, chưa có file 
       */
      dd.filterOrders = ({orders, condition}) => {
            const { ID, name} = condition;
            return orders.reduce((list, { owner }) => {
                  return owner.name == name 
                        && owner.file === ''
                        && owner.ID !==ID? [...list, owner.ID ]: [...list];
            }, []);   
      } 

      /**
       * 
       * @param {*} param0 
       * @returns 
       * danh sách thành phần DOM của đơn hàng
       */
      dd.buildDragItem = ({orders}) => orders.map(orderItem => createFormItem({
            tag: 'li',
            className: 'drag__item',                 
            innerHTML:`#${orderItem}`,
      }))


      /**
       * 
       * @returns DOM lemement
       * tạo form dùng upload tài liệu lên server cho các đơn hàng được lựa chọn
       */
      dd.dragAndDropUploadForm = () => {    
            let orderItems = createFormItem({
                  tag: 'ul',
                  className:'drag__items order__items drop-container',                  
            })
            let drag = dragDropOrders.createNewDrapdrop({id:'dragorder' });
            drag.prepend(orderItems);

            drag = dragDropOrders.getElementOfDropZone({drag});
            drag = dragDropOrders.collectDrapdrop({
                  drag,
                  config : {            
                        message: 'Kéo thả đơn hàng vào đây'
                  }
            });
            dragDropOrders.data = drag;
            uploadFiles.init({
                  id: 'uploader',
                  config: {
                        message: 'Kéo và thả file vào đây',
                        title: 'Chọn file',
                        multiple: false,
                        accept: '.pdf', 
                  }
            });
       
            const setDocs = createFormItem( {
                  tag: 'div',
                  className: 'docform',
                  id: 'docform',
                  innerHTML: '<h4>Bạn có thể thêm các mã đơn hàng:</h4>', 
                  children: [dragDropOrders.data.main, uploadFiles.data.main, errorNotice]
            })  
            
            return setDocs;
      }

      /**
       * 
       * @param {*} param0 
       * @returns DOM element
       * tạo nút để upload lên server
       */
      dd.uploadButtonFiles = ({target}) => {

            return createFormItem({
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
      }
      
      /**
       * 
       * @param {*} param0 
       * hàm để upload doc lên server
       */
      dd.uploadFileToServer = async ({event}) => { 
            const target = event.target.target; // 
            const files = uploadFiles.data.result;

            let body = new FormData();
            // lệnh bên dưới dùng upload cho nhiều file
            //dd.form.drag.files.map(file => body.append('files[]', file ));
            body.append('files', files[0] )
            body.append('orders', JSON.stringify(dragDropOrders.data.result));
            body.append('docname', target.owner.name);
            if (files.length !== 0) { 
                  const fileName = files[0].name;
                  try {
                        let resData = await fchRequest({
                           
                              ftchURI: '/wp-json/tinsinhphuc/document/upload',
                              data: {
                                    method: 'POST',
                                    headers: {},
                                    body,
                              }
                        });
                        
                        if (resData.code == 'success' ) { 
                              // thay thế 
                              //thêm tên doc vào hàng loạt order  
                        
                              const docOrders = [...document.querySelectorAll('.order--document')];
                              dragDropOrders.data.result.map(ID => {
                                    const orderWithIDs = docOrders.filter(docOrder => {
                                          const { owner } = docOrder;
                                          return owner.ID == ID && owner.name == target.owner.name;
                                    },[]);
                                    
                                    if (orderWithIDs.length != 0) {
                                          orderWithIDs.map(orderWithID => {
                                                const {owner} = orderWithID;
                                                owner.file = fileName;           
                                                const title = orderWithID.querySelector('.title');
                                                title.innerHTML = fileName;
                                                title.classList.remove('upload--document');
                                                title.classList.add('preview--document');
                                                title.onclick = event =>dd.previewDocument({event});
                                                title.append(dd.removeButton())
                                          });
                                    }
                              });           
                        }
                             
                        dd.modal.close();
                        dd.notice.open({
                              config: {
                                    message: message[resData.code],
                                    icon: true,
                                    style: 'info',
                                    timer: 1500
                              }
                        });                 
      
                  } catch { }
            } else {
                  errorNotice.innerHTML = 'Chọn file đi Ông thần ve chai!!!!';
            }

      } 
      return dd;
}

const dDocument = new DDocument().init();
