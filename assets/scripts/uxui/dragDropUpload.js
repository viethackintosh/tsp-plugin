import { buildTag } from "../helpers/buildTag.js";
import  { DragDrop }  from "./dragDrop.js";
import { FILE_PDF_ICON, AI_FILE_ICON, DOC_FILE_ICON } from './filesSVGIcon.js';

const UploadFiles = function() {
    let upFiles = new DragDrop();
   
    let icons = {
        'application/msword': DOC_FILE_ICON,
        'application/pdf': FILE_PDF_ICON,
        'application/postscript': AI_FILE_ICON,
    }

    upFiles.dragAndDropForm = () =>  
        `<div class="drop-zone drop-container">
            <ul class="drop-zone__items "></ul>   
            <div class="drop-zone__wrapper">
                <label class="drag__label label">
                    <span class="label__title title">Choice files</span>
                    <input type=file class="drag__file file">
                </label>
                <div class="drop-zone__message message">Drag & drop here</div>
            </div>    
        </div>`;
        
    upFiles.getElementOfDropZone = ({drag}) => {
        let dragger = {
            main: drag,
            dropZone: drag.querySelector('.drop-zone'), 
            dropList: drag.querySelector('.drop-zone__items'),
            dragArea: drag.querySelector('.drop-zone__wrapper'),
            label: drag.querySelector('.drag__label'),
            message: drag.querySelector('.message'),
            title: drag.querySelector('.title'),
            input: drag.querySelector('input[type=file]'),         
            result:[], 
        }
        dragger.input.onchange = event => upFiles.fileOnChange({event, drag: dragger});
        return dragger;
    }
    
    upFiles.choiceFilesForUpload = ({event}) => {
    }
    // thay đổi nội dung thông báo trong khung drag
    upFiles.message = ({paramater, drag}) => drag.message.innerHTML = paramater;
    
    // thay đổi nội dung hiển thị của nút bấm mở khung chọn file
    upFiles.title = ({paramater, drag}) => drag.title.innerText = paramater;   
    
    // tắt mở chức năng chọn nhiều file
    upFiles.multiple = ({paramater, drag}) => drag.input.multiple = paramater;
    
    // chấp nhận các thể loại file liệt kê
    upFiles.accept = ({paramater, drag}) => drag.input.accept = paramater; 
    
    // đây là loại dữ liệu cần lấy
    upFiles.dataType = ({paramater, drag}) => drag.main.dataType = paramater;
   
    upFiles.drop = ({event, drag}) => {       
        let tranfer = event.dataTransfer;  
        upFiles.getResults({tranfer, drag});     
    }

    // khi input file thay đổi
    upFiles.fileOnChange = ({ event, drag }) => {  
        let files = [...drag.input.files];   
        let handle = drag.input.multiple === false? 
            upFiles.handleSingleChoiceFile({drag, files}): // xử lý chọn đơn tệp
            upFiles.handleMultiChoiceFile({drag, files});  // xử lý chọn đa tệp
        drag.input.value = null; // clear value of input file

    }

    /**
     * 
     * @param {*} param0 
     * no return
     */
    upFiles.handleSingleChoiceFile = ({drag, files}) => {
        let file = files[0];   
        upFiles.turnofButtonChoiceFile({drag});
        let iconFileType = upFiles.createIconFolowFileType({file, multiple: '', drag});
        drag.dragArea.append(iconFileType);            
        drag.result = [file];
      
    }

    /**
     * 
     * @param {*} param0 
     * no return
     */
    upFiles.handleMultiChoiceFile = ({drag, files}) => {
        // xử lý lựa chọn nhiều file
        // có thể đã có list file trước đó
      
        let inFiles = files;
        if (drag.result.length === 0) {
            if (! drag.dropList.querySelector('.drag__label'))  {
                upFiles.changeButtonChoiceFilesPlus({drag});    
                drag.dropList.append(drag.label);
            }

        } else {
            inFiles = upFiles.filterFilesWithCondition({
                srcFiles: drag.result, 
                tarFiles: inFiles, 
                exts: drag.input.accept,          
            });
        }        

        if (inFiles.length !==0 ) {
            drag.result = [...drag.result, ...files]; // thêm vào lưu trữ
            let listFiles = upFiles.createListFiles({files:inFiles, drag});        
            listFiles.map(file => drag.dropList.insertBefore(file, drag.label));
        }        
    }
    
    /**
     * 
     * @param {files : array, condition: function} param0 
     * @returns []
     * lọc trùng file
     */
    upFiles.filterFilesWithCondition = ({srcFiles, tarFiles, exts}) => tarFiles.reduce((list, file ) =>{     
        let tempFile = upFiles.duplicateCondition({cond: file.name, srcFiles}); 
        let extCorrect = upFiles.extentionCondition({cond: exts, fileName: file.name});
        return ! tempFile && extCorrect?  [...list, file]:list;
    }, []);

    /**
     * 
     * @param {*} param0 
     * @returns boolean
     * 
     */
    upFiles.duplicateCondition = ({cond, srcFiles}) => {
        if (srcFiles.length === 0) return false;
        let files = srcFiles.filter(srcFile => srcFile.name == cond);     
        return files.length !== 0;
    }

    upFiles.extentionCondition = ({ cond, fileName}) => {
        let ext = `.${fileName.split('.').pop()}`;
        return cond.indexOf(ext.toLowerCase()) !== -1;
    }

    /**
     * 
     * @param {*} param0 
     * @returns 
     * hide message and choice file button
     */
    upFiles.turnofButtonChoiceFile =({drag}) =>  ['label', 'message'].map(item => drag[item].classList.add('hide'));
    
    /**
     * 
     * @param {*} param0 
     * show message and choice file button
     */
    upFiles.turnonButtonChoiceFile = ({drag}) => ['label', 'message'].map(item => drag[item].classList.remove('hide'));

    /**
     * 
     * @param {*} param0 
     * change button choice file to plus square button
     */
    upFiles.changeButtonChoiceFilesPlus = ({drag}) => {
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
    upFiles.changeButtonChoiceFilesTitle = ( { drag}) => {
        drag.message.classList.remove('hide');
        drag.label.classList.remove('plus');
        if (drag.input.multiple === true) drag.title.innerHTML = drag.title.oldTitle;
    }

    /**
     * 
     * @param {files } param0 
     * return Ul
     */
    upFiles.createLitsFileUl = () => buildTag({
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
    upFiles.createListFiles = ({files, drag}) => [       
        ...files.map(file =>
            buildTag({
                tag: 'li',
                className: 'file__item',
                append: [
                    upFiles.createIconFolowFileType({file , multiple:'multiple', drag})
                ]
            })),          
    ];

    /**
     * 
     * @param {*} param0 
     * @returns Icon of file, DOM element
     */
    upFiles.createIconFolowFileType = ({file, multiple, drag}) =>         
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
                    onclick: event => upFiles.clearFile({event, drag}),
                })

            ]
        });
    

    /**
     * 
     * @param {*} param0 
     * xử lý nhấn bỏ file
     */ 
    upFiles.clearFile = ({ event, drag }) => {
        let fileItem = event.target.closest('.files__contain');
        let fileName = fileItem.querySelector('.files__contain--filename').innerHTML;
        
        if (drag.input.multiple === false)  fileItem.remove();
        else fileItem.parentElement.remove();
        
        let fileIndex = drag.result.findIndex(file => file.name == fileName);
        drag.result.splice(fileIndex,1);                
            
        if (drag.result.length === 0) {
            // show choice button
            upFiles.turnonButtonChoiceFile({drag});
            upFiles.changeButtonChoiceFilesTitle({drag});
            drag.dragArea.insertBefore(drag.label, drag.message);
        }
        
    }

    //upFiles.getResults({event, drag});
    //lấy file từ drag area hiển thị sang result
    upFiles.getResults = ({tranfer, drag}) => {
        let files = [...tranfer.files];    
        files = drag.result.length !== 0? upFiles.filterFilesWithCondition({
            srcFiles: drag.result, 
            tarFiles: files, 
            exts: drag.input.accept,
            condition: upFiles.duplicateCondition
        }): files; // loại bỏ các file trùng lặp

        if (files.length !== 0) { 
            let handle = drag.input.multiple === false? 
                upFiles.handleDragSingleChoice({drag, files}): // xử lý chọn đơn tệp
                upFiles.handleMultiChoiceFile({drag, files});  // xử lý chọn đa tệp
        }             
    }

    /**
     * 
     * @param {*} param0 
     * xử lý drag drop cho single choice
     */
    upFiles.handleDragSingleChoice = ({drag, files}) => {
        if (drag.result.length === 0) upFiles.handleSingleChoiceFile({drag, files});
        else upFiles.handleExistFileBeforeDrop({drag, files});
    }

    upFiles.handleExistFileBeforeDrop = ({drag, files}) => {
        let file = files[0];
        let fileContain = drag.dragArea.querySelector('.files__contain');
        
        let fileIcon = fileContain.querySelector('.files__contain--icon');
        fileIcon.innerHTML = icons[file.type];

        let fileName = fileContain.querySelector('.files__contain--filename');
        fileName.innerHTML = file.name;

        drag.result = [file];
    }

    /**
     * trả về nguyên trạng
     */
    upFiles.resetDragDrop = () => {       
        upFiles.data.result = [];
        upFiles.data.input.value = null;
        upFiles.data.label.classList.remove('hide');
        upFiles.data.message.classList.remove('hide');
        let fileDoc = upFiles.data.dropZone.querySelector('.files__contain');
        if (fileDoc) fileDoc.remove();

    }
    return upFiles;
}
 
export { UploadFiles };
 