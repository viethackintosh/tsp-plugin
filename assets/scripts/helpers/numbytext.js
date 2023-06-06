let textOfNumber={0:"",10:"kh\xf4ng",20:"lẻ",1:"một",21:"mốt",2:"hai",3:"ba",4:"bốn",5:"năm",15:"lăm",6:"s\xe1u",7:"bảy",8:"t\xe1m",9:"ch\xedn"},unitNameProcess=["processUnit","processDozens","processHundreds"],unitName=["","ng\xe0n,","triệu,","tỷ,"],unitProcess={processUnit(t,e,r,n){let u="";return 1!=e&&5!=e?u=textOfNumber[e]:(1==e&&(u=textOfNumber[`${t%10>1?"2":""}${e}`]),5==e&&(u=textOfNumber[`${t%10>0?"1":""}${e}`])),0!=e&&(u+=` ${unitName[Math.floor(r/3)]}`),u},processDozens(t,e,r,n){let u="";return 0==e&&(u=""==n[r-1]?"":textOfNumber["20"]),1==e&&(u="mười"),e>1&&(u=`${textOfNumber[e]} mươi`),0!=e&&""==n[r-1]&&(u+=` ${unitName[Math.floor(r/3)]}`),u},processHundreds(t,e,r,n){let u="";return u=0!=e?`${textOfNumber[e]} trăm`:""!=n[r-1]?`${textOfNumber["10"]} trăm`:"",0!=e&&""==n[r-1]&&""==n[r-2]&&(u+=` ${unitName[Math.floor(r/3)]}`),u}},processGroup=(t,e,r,n)=>{let u=unitProcess[unitNameProcess[r%3]](t,e,r,n);return n.push(u),n},trantlateNumbertoVNString=(t,e,r)=>{let n=Math.floor(e/10);return t=processGroup(n,e%10,r,t),n>0&&(t=trantlateNumbertoVNString(t,n,++r)),t.filter(t=>""!=t).map(t=>t.trim())};export{trantlateNumbertoVNString};