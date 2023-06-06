import { buildTag } from "../helpers/buildtag.js";
const DRAP_DROPPER = `<div class="drag__wrapper">        
        <label class="drag__label label">
            <span class="label__title title">Click here select files</span>
            <input type=file class="drag__file file">
        </label>
        <h3 class="drag__message message">Drap and drop files here to upload</h3>
        </div>
        <div class="drag__result result"></div>
`;
const DragDrop = function() {
    let dad = this;
    dad.drag;
    dad.init = ({id, config}) => { 
        let drag = document.querySelector(`#${id}`);
        drag =  ! drag? dad.createNewDrapdrop({id, config}):dad.collectDrapdrop({drag, config});               
        dad.drag = drag;
        return dad;
    }

    dad.createNewDrapdrop = ({id, config}) => { 
        let drag = buildTag({
            tag: 'div',
            className: 'drag parent' ,
            id,
            innerHTML: DRAP_DROPPER,
        });
        drag = dad.collectDrapdrop({drag, config});
        return drag;
    }

    dad.collectDrapdrop = ({drag, config}) => {

        let dragger = {
            main: drag,
            title: drag.querySelector('.title'),
            message: drag.querySelector('.message'),
            input: drag.querySelector('input[type=file]'),
            result: drag.querySelector('.result'),
        }
        // thay đổi các thuộc tính 
        Object.entries(config).map(([method, paramater]) => dad[method]({paramater, dragger}));        
              
        [ 'dragover', 'drop', 'dragleave'].map(eventName => {
            dragger.main.addEventListener(eventName, dad.preventDefault ,false)
        });

        ['dragenter', 'dragover'].map(eventName => {           
            dragger.main.addEventListener(eventName, (event)=> dad.highlight({dragger}), false);
        });
        ['drop', 'dragleave'].map(eventName => {           
            dragger.main.addEventListener(eventName, (event)=> dad.unHighlight({dragger}), false);
        });
        
        dragger.main.addEventListener('drop', (event) => dad.drop({event, dragger}), false);
        return dragger;
    }

    // thay đổi nội dung thông báo trong khung drag
    dad.message = ({paramater, dragger}) => dragger.message.innerHTML = paramater;
    
    // thay đổi nội dung hiển thị của nút bấm mở khung chọn file
    dad.label = ({paramater, dragger}) => dragger.title.innerText = paramater;   
    
    // tắt mở chức năng chọn nhiều file
    dad.multiple = ({paramater, dragger}) => dragger.input.multiple = paramater;
    
    // chấp nhận các thể loại file liệt kê
    dad.accept = ({paramater, dragger}) => dragger.input.accept = paramater;    
   
    dad.preventDefault = (event) => {
        event.preventDefault();
        event.stopPropagation()
    }

    dad.highlight = ({ dragger }) =>  dragger.main.classList.add('active');    

    dad.unHighlight = ({ dragger }) =>  dragger.main.classList.remove('active');     
  
    dad.drop = ({event, dragger}) => {  
        // input multiple == false => lấy file đầu tiên trong file list gắn vào input file
        // input multiple == true 
        let dt = event.dataTransfer;  
        let tempTranfer = new DataTransfer();
        if (dragger.input.multiple === false) {
            // tìm file đầu tiên thoả mãn accept
            let files = Array.from(dt.files).filter(file => 
                file.type != '' && dragger.input.accept.indexOf(file.type) !== -1 
            );
            tempTranfer.items.add(files[0]);
            dragger.input.files = tempTranfer.files;
            
        } else {

            let files = [...Array.from(dragger.input.files),...Array.from(dt.files)]
           
            files = files.reduce((list, item) => {                
                let ft = list.filter(ls => ls.name == item.name); // có trùng lắp
                let accept = item.type != '' && dragger.input.accept.indexOf(item.type) !== -1; // phù hợp loại file
                return ft.length != 0 || ! accept ? list: [...list, item]}, []); 
                
            if (files.length !== 0) {
                files.forEach(file => tempTranfer.items.add(file));
            }
            dragger.input.files = tempTranfer.files;      
        }
          
        let result = `<ul>${Array.from(dragger.input.files).map(file => `<li>${file.name}</li>`).join('')}</ul>`;
        dragger.result.innerHTML = result;
    }

}
 
export {  DragDrop };
 