/**
 * 
 * @param {*} htmlTag: object 
 * @returns html element 
 */

 const buildTag = ({tag, innerHTML, append,  ...attributes}) =>  {    
    let outTag = document.createElement(tag);
    if (innerHTML) outTag.innerHTML = innerHTML;  
    if (append) outTag.append(...append);    
    Object.assign(outTag, attributes);
    return outTag;
}

export default buildTag;
