let buildTag=({tag:e,innerHTML:n,append:a,...t})=>{let r=document.createElement(e);return n&&(r.innerHTML=n),a&&r.append(...a),Object.assign(r,t),r};export{buildTag};