import{buildTag as e}from"./buildtag.js";let createFormItem=({tag:t,innerHTML:o,children:r,...m})=>{let a=r?r.map(t=>isNodeDOM(t)?t:e(t)):[];return e({tag:t,innerHTML:o,append:a,...m})},isNodeDOM=e=>e instanceof Element;export{createFormItem,isNodeDOM};