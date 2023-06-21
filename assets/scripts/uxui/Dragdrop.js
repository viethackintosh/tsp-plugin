import { buildTag } from "../helpers/buildtag.js";
const FILE_PDF_ICON = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
viewBox="0 0 115.3 122.9" style="enable-background:new 0 0 115.3 122.9;" xml:space="preserve">
<style type="text/css"> .st0{fill-rule:evenodd;clip-rule:evenodd;fill:#010101;} .pdf{fill:red;}</style>
<g><g>
   <path class="st0 pdf" d="M25.4,57h64.9V37.3H69.6c-2.2,0-5.2-1.2-6.6-2.6s-2.3-4-2.3-6.2V7.6l0,0H8.1C8,7.6,7.8,7.7,7.7,7.8
       C7.6,7.9,7.5,8.1,7.5,8.2v106.4c0,0.1,0.1,0.3,0.2,0.4c0.1,0.1,0.3,0.2,0.4,0.2c22.8,0,58.1,0,81.5,0c0.2,0,0.2-0.1,0.3-0.2
       c0.1-0.1,0.3-0.3,0.3-0.4v-11.2H25.4c-4.1,0-7.6-3.4-7.6-7.6V64.6C17.8,60.4,21.2,57,25.4,57L25.4,57z M29.5,67.4h13.2
       c2.9,0,5,0.7,6.5,2.1c1.4,1.4,2.1,3.3,2.1,5.8c0,2.6-0.8,4.6-2.3,6.1s-3.9,2.2-7.1,2.2h-4.3v9.5h-8V67.4L29.5,67.4z M37.4,78.4h2
       c1.5,0,2.6-0.3,3.2-0.8c0.6-0.5,0.9-1.2,0.9-2c0-0.8-0.3-1.5-0.8-2.1c-0.5-0.6-1.5-0.8-3-0.8h-2.3L37.4,78.4L37.4,78.4z M55,67.4
       h11.8c2.3,0,4.2,0.3,5.6,0.9c1.4,0.6,2.6,1.5,3.6,2.7c0.9,1.2,1.6,2.6,2,4.1c0.4,1.6,0.6,3.2,0.6,5c0,2.7-0.3,4.9-0.9,6.4
       C77,88,76.2,89.3,75,90.3c-1.1,1-2.3,1.7-3.6,2c-1.7,0.5-3.3,0.7-4.7,0.7H55V67.4L55,67.4z M62.9,73.2v14h2c1.7,0,2.8-0.2,3.6-0.6
       c0.7-0.4,1.2-1,1.7-1.9c0.4-0.9,0.6-2.4,0.6-4.4c0-2.7-0.4-4.6-1.3-5.6c-0.9-1-2.4-1.5-4.4-1.5L62.9,73.2L62.9,73.2z M82.2,67.4
       h19.6v5.5H90.2v4.5h10v5.2h-10v10.5h-7.9L82.2,67.4L82.2,67.4z M97.8,57h9.9c4.2,0,7.6,3.4,7.6,7.6V96c0,4.2-3.4,7.6-7.6,7.6h-9.9
       v13.6c0,1.6-0.7,3-1.7,4.1c-1.1,1.1-2.5,1.7-4.1,1.7c-29.4,0-56.6,0-86.2,0c-1.6,0-3-0.6-4.1-1.7S0,118.7,0,117.1V5.8
       c0-1.6,0.6-3,1.7-4.1C2.8,0.7,4.2,0,5.8,0h58.7c0.1,0,0.3,0,0.4,0c0.6,0,1.3,0.3,1.8,0.7h0.1c0.1,0.1,0.1,0.1,0.2,0.2l30,30.4
       c0.5,0.5,0.9,1.2,0.9,2c0,0.2-0.1,0.4-0.1,0.7V57L97.8,57z M67.5,28v-19l21.4,21.7H70.2c-0.7,0-1.4-0.3-1.9-0.8
       C67.8,29.4,67.5,28.7,67.5,28L67.5,28z"/>
</g></g>
</svg>`;

const AI_FILE_ICON = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
viewBox="0 0 115.3 122.9" style="enable-background:new 0 0 115.3 122.9;" xml:space="preserve">
<style type="text/css"> .st0{fill-rule:evenodd;clip-rule:evenodd;} .ai{fill:#850101;}</style>
<g>
<path class="st0 ai" d="M25.4,57h64.9V37.3H69.6c-2.2,0-5.2-1.2-6.6-2.6c-1.4-1.4-2.3-4-2.3-6.2V7.6l0,0H8.1C8,7.6,7.8,7.7,7.7,7.8
   C7.6,7.9,7.6,8,7.6,8.2v106.4c0,0.1,0.1,0.3,0.2,0.4c0.1,0.1,0.3,0.2,0.4,0.2c22.8,0,58.1,0,81.5,0c0.2,0,0.2-0.1,0.3-0.2
   c0.1-0.1,0.3-0.3,0.3-0.4v-11.2H25.4c-4.1,0-7.6-3.4-7.6-7.6V64.5C17.8,60.4,21.2,57,25.4,57L25.4,57z M61.9,88.4H53l-1.3,4.2h-8
   l9.5-25.4h8.6l9.5,25.4h-8.2L61.9,88.4L61.9,88.4z M60.2,83l-2.8-9.1L54.7,83H60.2L60.2,83z M75.4,67.3h7.9v25.4h-7.9V67.3
   L75.4,67.3z M97.8,57h9.9c4.2,0,7.6,3.4,7.6,7.6V96c0,4.2-3.4,7.6-7.6,7.6h-9.9v13.6c0,1.6-0.7,3-1.7,4.1c-1.1,1.1-2.5,1.7-4.1,1.7
   c-29.4,0-56.6,0-86.2,0c-1.6,0-3-0.6-4.1-1.7S0,118.7,0,117.1V5.8c0-1.6,0.6-3,1.7-4.1C2.8,0.7,4.2,0,5.8,0h58.7c0.1,0,0.3,0,0.4,0
   c0.6,0,1.3,0.3,1.8,0.7h0.1c0.1,0.1,0.1,0.1,0.2,0.2l30,30.4c0.5,0.5,0.9,1.2,0.9,2c0,0.2-0.1,0.4-0.1,0.7V57L97.8,57z M67.5,28
   v-19l21.4,21.7H70.2c-0.7,0-1.4-0.3-1.9-0.8C67.8,29.4,67.5,28.7,67.5,28L67.5,28z"/>
</g>
</svg>`;

const DOC_FILE_ICON = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
viewBox="0 0 115.3 122.9" xml:space="preserve">
<style type="text/css"> .st0{fill-rule:evenodd;clip-rule:evenodd;} .doc{fill: #004c99}</style>
<g>
<path class="st0 doc" d="M25.4,57h64.9V37.3H69.6c-2.2,0-5.2-1.2-6.6-2.6c-1.4-1.4-2.3-4-2.3-6.2V7.6l0,0H8.1C8,7.6,7.8,7.7,7.7,7.8
   C7.6,7.9,7.6,8,7.6,8.2v106.4c0,0.1,0.1,0.3,0.2,0.4c0.1,0.1,0.3,0.2,0.4,0.2c22.8,0,58.1,0,81.5,0c0.2,0,0.2-0.1,0.3-0.2
   c0.1-0.1,0.3-0.3,0.3-0.4v-11.2H25.4c-4.1,0-7.6-3.4-7.6-7.6V64.5C17.8,60.4,21.2,57,25.4,57L25.4,57z M29.5,68.5h10.8
   c2.1,0,3.8,0.3,5.2,0.9s2.4,1.4,3.2,2.5c0.8,1.1,1.5,2.3,1.9,3.8s0.6,2.9,0.6,4.6c0,2.5-0.3,4.5-0.9,5.8c-0.6,1.4-1.4,2.6-2.4,3.5
   c-1,0.9-2.1,1.6-3.3,1.9c-1.6,0.4-3,0.6-4.3,0.6H29.5V68.5L29.5,68.5z M36.8,73.8v12.8h1.8c1.5,0,2.6-0.2,3.2-0.5
   c0.6-0.3,1.1-0.9,1.5-1.8c0.4-0.8,0.5-2.2,0.5-4.1c0-2.5-0.4-4.2-1.2-5.1c-0.8-0.9-2.2-1.4-4.1-1.4L36.8,73.8L36.8,73.8z M53,80.3
   c0-3.8,1.1-6.8,3.2-9s5.1-3.2,8.9-3.2c3.9,0,6.9,1.1,9.1,3.2s3.2,5.1,3.2,8.8c0,2.8-0.5,5-1.4,6.8S73.7,90,72,91
   c-1.8,1-3.9,1.5-6.5,1.5c-2.7,0-4.8-0.4-6.6-1.3s-3.2-2.2-4.2-4C53.5,85.3,53,83,53,80.3L53,80.3z M60.3,80.3
   c0,2.4,0.4,4.1,1.3,5.1c0.9,1,2.1,1.6,3.6,1.6c1.6,0,2.8-0.5,3.6-1.5c0.9-1,1.3-2.8,1.3-5.5c0-2.2-0.4-3.8-1.3-4.8
   c-0.9-1-2.1-1.5-3.6-1.5c-1.5,0-2.7,0.5-3.5,1.6C60.7,76.2,60.3,77.9,60.3,80.3L60.3,80.3z M95.9,82.4l6.4,1.9
   c-0.4,1.8-1.1,3.3-2,4.5c-0.9,1.2-2.1,2.1-3.4,2.7c-1.4,0.6-3.1,0.9-5.2,0.9c-2.6,0-4.7-0.4-6.3-1.1c-1.6-0.7-3-2.1-4.2-3.9
   c-1.2-1.9-1.8-4.3-1.8-7.2c0-3.9,1-6.9,3.1-9c2.1-2.1,5-3.1,8.8-3.1c3,0,5.3,0.6,7,1.8c1.7,1.2,3,3,3.8,5.5l-6.4,1.4
   c-0.2-0.7-0.5-1.2-0.7-1.6c-0.4-0.6-0.9-1-1.5-1.3c-0.6-0.3-1.2-0.4-2-0.4c-1.7,0-2.9,0.7-3.8,2c-0.7,1-1,2.5-1,4.6
   c0,2.6,0.4,4.4,1.2,5.4c0.8,1,1.9,1.4,3.3,1.4c1.4,0,2.4-0.4,3.2-1.2C95.1,85,95.6,83.9,95.9,82.4L95.9,82.4z M97.8,57h9.9
   c4.2,0,7.6,3.4,7.6,7.6V96c0,4.2-3.4,7.6-7.6,7.6h-9.9v13.6c0,1.6-0.7,3-1.7,4.1c-1.1,1.1-2.5,1.7-4.1,1.7c-29.4,0-56.6,0-86.2,0
   c-1.6,0-3-0.6-4.1-1.7S0,118.7,0,117.1V5.8c0-1.6,0.6-3,1.7-4.1C2.8,0.7,4.2,0,5.8,0h58.7c0.1,0,0.3,0,0.4,0c0.6,0,1.3,0.3,1.8,0.7
   h0.1c0.1,0.1,0.1,0.1,0.2,0.2l30,30.4c0.5,0.5,0.9,1.2,0.9,2c0,0.2-0.1,0.4-0.1,0.7V57L97.8,57z M67.5,28v-19l21.4,21.7H70.2
   c-0.7,0-1.4-0.3-1.9-0.8C67.8,29.4,67.5,28.7,67.5,28L67.5,28z"/>
</g>
</svg>`;

const DRAP_DROPPER = 
    `<div class="drag__wrapper area">        
        <label class="drag__label label">
            <span class="label__title title">Choice files</span>
            <input type=file class="drag__file file">
        </label> 
        <div class="drag__message message">Drag & drop here to upload files</div>
    </div>
`;
const DragDrop = function() {
    let dad = this;
    dad.drag;
    let icons = {
        'application/msword': DOC_FILE_ICON,
        'application/pdf': FILE_PDF_ICON,
        'application/postscript': AI_FILE_ICON,
    }

    /**
     * 
     * @param {*} param0 
     * @returns object of drag drop
     */
    dad.init = ({id, config}) => { 
        // rea
        let drag = document.querySelector(`#${id}`);
        drag =  ! drag? dad.createNewDrapdrop({id, config}):dad.collectDrapdrop({drag, config});               
        dad.drag = drag;
        return dad;
    }

    /**
     * 
     * @param {*} param0 
     * @returns drag drop object
     */
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

    /**
     * 
     * @param {*} param0 
     * @returns 
     */
    dad.collectDrapdrop = ({drag, config}) => {

        let dragger = {
            main: drag,
            dragArea: drag.querySelector('.area'),
            label: drag.querySelector('.label'),
            message: drag.querySelector('.message'),
            title: drag.querySelector('.title'),
            input: drag.querySelector('input[type=file]'),
            files:[], 
        }
        // thay đổi các thuộc tính 
        Object.entries(config).map(([method, paramater]) => dad[method]({paramater, drag: dragger}));

        dragger.input.onchange = event => dad.fileOnChange({event, drag: dragger});
        [ 'dragover', 'drop', 'dragleave'].map(eventName => {
            dragger.main.addEventListener(eventName, dad.preventDefault ,false)
        });
        ['dragenter', 'dragover'].map(eventName => {  
            dragger.main.addEventListener(eventName, (event)=> dad.highlight({drag: dragger}), false);
        });
        ['drop', 'dragleave'].map(eventName => {           
            dragger.main.addEventListener(eventName, (event)=> dad.unHighlight({drag: dragger}), false);
        });
        
        dragger.main.addEventListener('drop', (event) => dad.drop({event, drag: dragger}), false);
      
        return dragger;
    }


    dad.choiceFilesForUpload = ({event}) => {
    }
    // thay đổi nội dung thông báo trong khung drag
    dad.message = ({paramater, drag}) => drag.message.innerHTML = paramater;
    
    // thay đổi nội dung hiển thị của nút bấm mở khung chọn file
    dad.title = ({paramater, drag}) => drag.title.innerText = paramater;   
    
    // tắt mở chức năng chọn nhiều file
    dad.multiple = ({paramater, drag}) => drag.input.multiple = paramater;
    
    // chấp nhận các thể loại file liệt kê
    dad.accept = ({paramater, drag}) => drag.input.accept = paramater; 
    
    // đây là loại dữ liệu cần lấy
    dad.dataType = ({paramater, drag}) => drag.main.dataType = paramater;
   
    dad.preventDefault = (event) => {
        event.preventDefault();
        event.stopPropagation()
    }

    // 
    dad.highlight = ({ drag }) => drag.main.classList.add('active');    
    
    dad.unHighlight = ({ drag }) =>  drag.main.classList.remove('active');     
  
    dad.drop = ({event, drag}) => {       
        let dt = event.dataTransfer;  
        let dataType = drag.main.dataType;        
        dad[`get${dataType}`]({tranfer: dt, drag});     
    }

    // khi input file thay đổi
    dad.fileOnChange = ({ event, drag }) => {  
        let files = [...drag.input.files];   
        let handle = drag.input.multiple === false? 
            dad.handleSingleChoiceFile({drag, files}): // xử lý chọn đơn tệp
            dad.handleMultiChoiceFile({drag, files});  // xử lý chọn đa tệp
        drag.input.value = null; // clear value of input file

    }

    /**
     * 
     * @param {*} param0 
     * no return
     */
    dad.handleSingleChoiceFile = ({drag, files}) => {
        let file = files[0];   
        dad.turnofButtonChoiceFile({drag});
        let iconFileType = dad.createIconFolowFileType({file, multiple: '', drag});
        drag.dragArea.append(iconFileType);            
        drag.files = [file];
      
    }

    /**
     * 
     * @param {*} param0 
     * no return
     */
    dad.handleMultiChoiceFile = ({drag, files}) => {
        // xử lý lựa chọn nhiều file
        // có thể đã có list file trước đó
        let listFileElement = drag.main.querySelector('#filesList');
        // hiện chưa có file nào trong lưu trữ        
        if (! listFileElement) {
            // change choice file button to plus button                   
            listFileElement = dad.createLitsFileUl();           
            drag.main.append(listFileElement);
        }

        if (! listFileElement.querySelector('.drag__label'))  {
            dad.changeButtonChoiceFilesPlus({drag});    
            listFileElement.append(drag.label);
        }
        
        files = dad.filterFilesWithCondition({
            srcFiles: drag.files, 
            tarFiles: files, 
            exts: drag.input.accept,          
        });
        
        if (files.length !==0 ) {
            drag.files = [...drag.files, ...files]; // thêm vào lưu trữ
            let listFiles = dad.createListFiles({files, drag});        
            listFiles.map(file => listFileElement.insertBefore(file, drag.label));
        }
        
    }
    
    /**
     * 
     * @param {files : array, condition: function} param0 
     * @returns []
     * lọc trùng file
     */
    dad.filterFilesWithCondition = ({srcFiles, tarFiles, exts}) => tarFiles.reduce((list, file ) =>{     
        let tempFile = dad.duplicateCondition({cond: file.name, srcFiles}); 
        let extCorrect = dad.extentionCondition({cond: exts, fileName: file.name});
        return ! tempFile && extCorrect?  [...list, file]:list;
    }, []);

    /**
     * 
     * @param {*} param0 
     * @returns boolean
     * 
     */
    dad.duplicateCondition = ({cond, srcFiles}) => {
        if (srcFiles.length === 0) return false;
        let files = srcFiles.filter(srcFile => srcFile.name == cond);     
        return files.length !== 0;
    }

    dad.extentionCondition = ({ cond, fileName}) => {
        let ext = `.${fileName.split('.').pop()}`;
        return cond.indexOf(ext.toLowerCase()) !== -1;
    }

    /**
     * 
     * @param {*} param0 
     * @returns 
     * hide message and choice file button
     */
    dad.turnofButtonChoiceFile =({drag}) =>  ['label', 'message'].map(item => drag[item].classList.add('hide'));
    
    /**
     * 
     * @param {*} param0 
     * show message and choice file button
     */
    dad.turnonButtonChoiceFile = ({drag}) => ['label', 'message'].map(item => drag[item].classList.remove('hide'));

    /**
     * 
     * @param {*} param0 
     * change button choice file to plus square button
     */
    dad.changeButtonChoiceFilesPlus = ({drag}) => {
        drag.message.classList.add('hide');
        drag.label.classList.add('plus');
        drag.title.oldTitle = drag.title.innerHTML;
        drag.title.innerHTML = '+';
    }

    /**
     * 
     * @param {*} param0 
     * change button to origin
     */
    dad.changeButtonChoiceFilesTitle = ( { drag}) => {
        drag.message.classList.remove('hide');
        drag.label.classList.remove('plus');
        if (drag.input.multiple === true) drag.title.innerHTML = drag.title.oldTitle;
    }

    /**
     * 
     * @param {files } param0 
     * return Ul
     */
    dad.createLitsFileUl = () => buildTag({
        tag: 'ul',
        className: 'files__list',
        id: 'filesList',
    });
    
    /**
     * 
     * @param {*} param0 
     * @returns DOM element
     * create list icon file with remove button
     */
    dad.createListFiles = ({files, drag}) => [       
        ...files.map(file =>
            buildTag({
                tag: 'li',
                className: 'file__item',
                append: [
                    dad.createIconFolowFileType({file , multiple:'multiple', drag})
                ]
            })),          
    ];

    /**
     * 
     * @param {*} param0 
     * @returns Icon of file, DOM element
     */
    dad.createIconFolowFileType = ({file, multiple, drag}) =>         
        buildTag({
            tag: 'div',
            className: `files__contain ${multiple}`,
            append: [
                // create a icon with file type
                buildTag({
                    tag: 'span',
                    className: 'files__contain--icon',
                    innerHTML: icons[file.type],

                }),
                // create span file name
                buildTag({
                    tag: 'span',
                    className:'files__contain--filename',
                    innerHTML: file.name,
                }),
                // create clear file button
                buildTag({
                    tag: 'span',
                    className: 'files__contain--clear',
                    onclick: event => dad.clearFile({event, drag}),
                })

            ]
        });
    

    /**
     * 
     * @param {*} param0 
     * xử lý nhấn bỏ file
     */ 
    dad.clearFile = ({ event, drag }) => {
        let fileItem = event.target.closest('.files__contain');
        let fileName = fileItem.querySelector('.files__contain--filename').innerHTML;
        
        if (drag.input.multiple === false)  fileItem.remove();
        else fileItem.parentElement.remove();
        
        let fileIndex = drag.files.findIndex(file => file.name == fileName);
        drag.files.splice(fileIndex,1);                
            
        if (drag.files.length === 0) {
            // show choice button
            dad.turnonButtonChoiceFile({drag});
            dad.changeButtonChoiceFilesTitle({drag});
            drag.dragArea.insertBefore(drag.label, drag.message);
        }
        
    }

    //lấy file từ drag area hiển thị sang result
    dad.getfile = ({ tranfer, drag }) => {
        let tempTranfer = new DataTransfer();
        let files = [...tranfer.files];    

        files = drag.files.length !== 0? dad.filterFilesWithCondition({
            srcFiles: drag.files, 
            tarFiles: files, 
            exts: drag.input.accept,
            condition: dad.duplicateCondition
        }): files; // loại bỏ các file trùng lặp

        if (files.length !== 0) { 
            let handle = drag.input.multiple === false? 
                dad.handleDragSingleChoice({drag, files}): // xử lý chọn đơn tệp
                dad.handleMultiChoiceFile({drag, files});  // xử lý chọn đa tệp
        }             
    }

    /**
     * 
     * @param {*} param0 
     * xử lý drag drop cho single choice
     */
    dad.handleDragSingleChoice = ({drag, files}) => {
        if (drag.files.length === 0) dad.handleSingleChoiceFile({drag, files});
        else dad.handleExistFileBeforeDrop({drag, files});
    }

    dad.handleExistFileBeforeDrop = ({drag, files}) => {
        let file = files[0];
        let fileContain = drag.dragArea.querySelector('.files__contain');
        
        let fileIcon = fileContain.querySelector('.files__contain--icon');
        fileIcon.innerHTML = icons[file.type];

        let fileName = fileContain.querySelector('.files__contain--filename');
        fileName.innerHTML = file.name;

        drag.files = [file];
    }
   
}
 
export {  DragDrop };
 