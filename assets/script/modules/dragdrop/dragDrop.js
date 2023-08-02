import { buildTag } from "../helpers/buildtag.js";

const DragDrop = function() {
    let dad = this;
    dad.data;   
    let dragging;
    /**
     * 
     * @param {*} param0 
     * @returns object of drag drop
     */
    dad.init = ({id, config}) => { 
        // rea
        let drag = document.querySelector(`#${id}`);
        if (! drag) {
            drag = dad.createNewDrapdrop({id})
        }
        drag = dad.getElementOfDropZone({drag});
       
        drag = dad.collectDrapdrop({drag, config});               
        dad.data = drag;
        return dad;
    }

    /**
     * 
     * @returns 
     * DOM drag form chuẩn
     */
    dad.dragAndDropForm = () =>  
        `<div class="drop-zone drop-container">
            <div class="drop-zone__wrapper">
                <div class="drop-zone__message message">Drag & drop here</div>
            </div>    
            <ul class="drop-zone__items "></ul>   
        </div>`;
    /**
     * 
     * @param {*} param0 
     * @returns drag drop object
     */
    dad.createNewDrapdrop = ({id}) => { 
        let drag = buildTag({
            tag: 'div',
            className: 'drag parent' ,
            id,
            innerHTML: dad.dragAndDropForm(),
        });
       
        return drag ;
    }

    /**
     * 
     * @param {*} param0 
     * @returns JSON Object
     * trả về các thành phần trong khu vực drop
     */
    dad.getElementOfDropZone = ({drag}) => {
        let dragger = {
            main: drag,
            dragZone: drag.querySelector('.drag__items'),
            dropZone: drag.querySelector('.drop-zone'), 
            dropList: drag.querySelector('.drop-zone__items'),  
            message: drag.querySelector('.message'),       
            result:[], 
        }
        return dragger;
    }
    /**
     * 
     * @param {*} param0 
     * @returns 
     */
    dad.collectDrapdrop = ({drag, config}) => {
        // thay đổi các thuộc tính 
        if (config) Object.entries(config).map(([method, para]) => { dad[method]({paramater: para, drag});  });   

        
        // tìm các thành được chỉ định có thể kéo đi (drag) gán thêm thuộc tính draggable
        if (drag.dragZone) {

            let draggables = [...drag.dragZone.querySelectorAll('.drag__item')]; 
    
            dad.setDragItem({items: draggables});
        }

       ['dropZone', 'dragZone'].map(zone => {
            if (drag[zone]) {
                drag[zone].addEventListener('dragover', (event) => [
                    dad.preventDefault({event}), 
                    dad.highlight({event})
                ], false);
                
                drag[zone].addEventListener('dragleave', (event) => [
                    dad.preventDefault({event}), 
                    dad.unHighlight({event})
                ], false);
    
                drag[zone].addEventListener('drop', (event) => [
                    dad.preventDefault({event}), 
                    dad.unHighlight({event}), 
                    dad.drop({event, drag}),
                ], false);
            }
       });
      
        return drag;
    }

    /**
     * 
     * @param {*} param0 
     * @returns 
     * cài đặt các event cho các item có thể drag
     */
    dad.setDragItem = ({items}) => items.map(item => {
        item.draggable = true;
        ['dragstart', 'dragend'].map(eventName =>{
            item.addEventListener(eventName, event => dad[eventName]({event, item}), false)
        })
    });

    /**
     * 
     * @param {*} param0 
     * event bắt đầu kéo đi
     */
    dad.dragstart = ({event, item}) => {
        dragging = item;
        item.classList.add('dragging');
    }

    /**
     * 
     * @param {*} param0 
     * event kết thúc kéo đi
     */
    dad.dragend = ({event, item}) => {
        dragging = item;
        item.classList.remove('dragging');
    }

    /**
     * 
     * @param {*} event 
     * Stop default action of event
     */
    dad.preventDefault = ({event}) => {
        event.preventDefault();
        event.stopPropagation()
    }

    /**
     * 
     * @param {*} event 
     * tạo điểm sáng khi item được kéo vào khu vực nhận item 
     */
    dad.highlight = ({ event }) => {
        const target = event.target.closest('.drop-container');
        if ( target.className.indexOf('active') === -1) target.classList.add('active');      
    };    
    
    /**
     * 
     * @param {*} param0 
     * bỏ điểm sáng khi item được kéo ra ngoài
     */
    dad.unHighlight = ({ event }) =>  {
        const target = event.target.closest('.drop-container');
        if ( target.className.indexOf('active') !== -1) target.classList.remove('active');
    }     
    
    /**
     * 
     * @param {*} param0 
     * sự kiện khi item được thả vào khu vực kết quả
     */
    dad.drop = ({event, drag}) => {       
        const target = event.target.closest('.drop-container');
        const dropElement = target.className.indexOf('drop-zone') !== -1;
        if (dragging !== undefined ) {
            if (dropElement) drag.dropList.append( dragging);  
            else target.append(dragging);                  
            dad.getResults({event, drag});    
            dragging = undefined;
        }
    }

    /**
     * 
     * @param {*} param0 
     * phần xử lý lấy kết quả khi item được thả vào
     */
    dad.getResults = ({event, drag}) => {
        const target = event.target;
        const dropElement = target.className.indexOf('drop-zone') !== -1;
        let oId = parseInt(dragging.innerHTML.replace('#',''));
        if (dropElement === true) {
            drag.result.push(oId);
        } else {
            const findId = drag.result.findIndex(rs => rs == oId);
            drag.result.splice(findId, 1);
        }       
      
    }   

    dad.resetDragDrop = () => {
        dad.data.dragZone.innerHTML = '';
        dad.data.dropList.innerHTML = '';
        dad.data.result = [];
    }
    // thay đổi nội dung thông báo trong khung drag
    dad.message = ({paramater, drag}) => drag.message.innerHTML = paramater;
    return dad;
}
 
export  { DragDrop } ;
 