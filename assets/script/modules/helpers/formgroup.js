/**
 * 
 * @param {*} htmlTag: object 
 * @returns html element 
 */
import { buildTag } from './buildtag.js';

const createFormItem = ({tag, innerHTML, children,  ...attributes}) => {
    let listChilren = children? children.map(child => isNodeDOM(child) ? child: buildTag(child)):[];
    let groupItem = buildTag({
        tag,
        innerHTML,
        append: listChilren,
        ...attributes,
    }) 

    return groupItem;
}
const isNodeDOM = element => {
    return element instanceof Element;
}
export { createFormItem, isNodeDOM }
