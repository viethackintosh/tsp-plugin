let fectchDefault={mode:"cors",ache:"no-cache",credentials:"same-origin",headers:{"Content-Type":"application/json"},redirect:"follow",referrerPolicy:"no-referrer",method:"GET"},fchRequest=({ftchURI:e,data:t})=>{let r={...fectchDefault,...t};return fetch(e,r).then(e=>e.json()).catch(function(e){return e})};export{fchRequest};