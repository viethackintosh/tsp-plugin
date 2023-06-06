import { buildTag } from "../helpers/buildtag.min.js";
import { isNodeDOM } from '../helpers/formgroup.min.js';

const Tabs = function () {
     let tab = this;
     let element;
     
     tab.init = ({id, tabList}) => {
          if ( ! id || ! tabList ) return;
          return tab.createTabs({id, tabList});         
     }

     //tạo tabs
     tab.createTabs = ({id, tabList}) => {
          let tabsDiv = buildTag({
               tag: 'div',
               className: 'tabs',
               id: id,
               innerHTML:`
                    <div class=tabs__header></div>
                    <div class=tabs__content></div>
               `,
          });  
         let buttons = tab.reateButtons({ tabList, onClick: tab.changeTabs});
          let contents = tab.getTabContent({tabList});

          tabsDiv.querySelector('.tabs__header').append(...buttons);
          tabsDiv.querySelector('.tabs__content').append(...contents);

          return tabsDiv;
     }

     //tạo button kích hoạt tab 
     tab.reateButtons = ({tabList, onClick }) => {

          let buttons = tabList.map((tab, index) => {
               let key = Object.keys(tab)[0];
               let { tabHeader } = tab[key];             
               let active = index === 0 ? 'active':'';
               let spanButton = buildTag({
                    tag: 'div',
                    className: `tabs__button ${active}`,
                    target: key,
                    innerHTML: tabHeader,
                    onclick: event => onClick(event)
               });      
                    
               return spanButton;
               
          }); 
          return buttons ;
     }

     //tạo tab content 
     tab.getTabContent = ({tabList}) => {
         
          let tabContent = tabList.map((tab, index)=> {
               let key = Object.keys(tab)[0];
               let { innerHTML } = tab[key] || '';
               let domNode = {};
               if (innerHTML != '') {
                    if (isNodeDOM(innerHTML)) domNode = { append: [innerHTML]};
                    else domNode = {innerHTML};
               }
             
               let active = index === 0 ? 'active':'';
               let content = buildTag({
                    tag: 'div',
                    className: `tabs__element ${active}`,
                    id: key,
                    ...domNode,
               })
               return content;
          });
          return tabContent;
     }
     
     // xử lý sự kiện nhấp chuột button tabs
     tab.changeTabs = (event) => {
          let target = event.target;
          let btns = target.parentElement;
          if (target.className.indexOf('active') != -1 ) return;
          // thay đổi lại class cho buttons 
          let resetBtns = Array.from(btns.childNodes).map(childNode => childNode.classList.remove('active'));
          target.classList.add('active');

          // thay đổi class cho tab element
          let nextTarget = target.target;
          let tabNextActive = document.getElementById(nextTarget);
          let tabsCnt = tabNextActive.parentElement;
          let resetCnt  = Array.from(tabsCnt.childNodes).map(childNode => childNode.classList.remove('active'));
          tabNextActive.classList.add('active');
          
     }
     /**
      * tabs: { tabHeader, tabId}
      */
     /**
      * div class tabs id = id
      *   div class tabs__header
      *        span class=tab__button target=tabId1> tabHeader1 < 
      *        span class=tab__button target=tabIds> tabHeader2 <
      *   div class tabs__content
      *        div class=tab1 id=tabId1
      *        div class=tab2 id=tabId2
      * 
      */
     return tab;
} 

export { Tabs };
