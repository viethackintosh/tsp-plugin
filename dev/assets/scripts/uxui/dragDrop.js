import { buildTag } from "./buildtag.js";


const DragDrop = function() {
    let dad = this;
    dad.drag;   
    dad.dragging;
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
        dad.drag = drag;
        return dad;
    }

    dad.dragAndDropForm = () =>  
        `<div class="drop-zone drop-container">
            <ul class="drop-zone__items "></ul>   
            <div class="drop-zone__wrapper">
                <div class="drop-zone__message message">Drag & drop here</div>
            </div>    
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

            let draggables = drag.dragZone.querySelectorAll('.drag__item');
    
            draggables.forEach(item => {
                item.draggable = true;
                ['dragstart', 'dragend'].map(eventName =>{
                    item.addEventListener(eventName, event => dad[eventName]({event, item}), false)
                });
    
            });
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

    dad.dragstart = ({event, item}) => {
        dad.dragging = item;
        item.classList.add('dragging');
    }

    dad.dragend = ({event, item}) => {
        dad.dragging = item;
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
     * highlight 
     */
    dad.highlight = ({ event }) => {
        const target = event.target.closest('.drop-container');
        if ( target.className.indexOf('active') === -1) target.classList.add('active');      
    };    
    
    dad.unHighlight = ({ event }) =>  {
        const target = event.target.closest('.drop-container');
        if ( target.className.indexOf('active') !== -1) target.classList.remove('active');
    }     
    
    dad.drop = ({event, drag}) => {       
        const target = event.target.closest('.drop-container');
        if (dad.dragging !== undefined ) {
            target.append(dad.dragging);                  
            dad.getResults({event, drag});    
            dad.dragging = undefined;
        }
    }

    dad.getResults = ({event, drag}) => {
        const target = event.target;
        const dropElement = target.className.indexOf('drop-zone') !== -1;
        let oId = parseInt(dad.dragging.innerHTML.replace('#',''));
        if (dropElement === true) {
            drag.result.push(oId);
        } else {
            const findId = drag.result.findIndex(rs => rs == oId);
            drag.result.splice(findId, 1);``
        }       
      
    }   
    // thay đổi nội dung thông báo trong khung drag
    dad.message = ({paramater, drag}) => drag.message.innerHTML = paramater;
    return dad;
}
 
export  {DragDrop} ;
 