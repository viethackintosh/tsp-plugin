const textOfNumber = { '0':'','10':'không','20':'lẻ', '1':'một', '21':'mốt', '2':'hai', '3':'ba', '4':'bốn', 
                              '5':'năm', '15':'lăm', '6':'sáu',  '7':'bảy', '8':'tám', '9':'chín' };
        
const unitNameProcess = ['processUnit','processDozens','processHundreds'];
const unitName = ['','ngàn,','triệu,','tỷ,'];

const unitProcess = {

     // xử lý hàng đơn vi
     processUnit: (newValue,  surplus, inPos,bytext) => {          
          
      let numberText = '';
      
      if (surplus != 1 && surplus != 5) {
        numberText = textOfNumber[surplus];         
       } else {
         if (surplus == 1 ) {
           let nextNumber = newValue%10;
           let prefix = nextNumber > 1 ? '2':'';
           numberText = textOfNumber[`${prefix}${surplus}`];
         }

         if (surplus == 5 ) {
           let nextNumber = newValue%10;
           let prefix = nextNumber > 0 ? '1':'';
           numberText = textOfNumber[`${prefix}${surplus}`];
         }
         
       }
       if (surplus != 0 ) numberText += ` ${unitName[Math.floor(inPos/3)]}`; 
       return numberText;
      
     },
     
     // xử lý đơn vị chục
     processDozens: (newValue,  surplus, inPos, bytext) => {
       let numberText = '';
       if (surplus == 0) {
         numberText = bytext[inPos - 1] == '' ? '' : textOfNumber['20'];
       }
       if (surplus == 1) {
         numberText = 'mười'; 
       }
       if (surplus > 1) {
         numberText = `${textOfNumber[surplus]} mươi`;
       }
       if (surplus != 0 && bytext[inPos -1 ] == '') numberText += ` ${unitName[Math.floor(inPos/3)]}` ;
       return numberText;

     },

     // xử lý đơn vị trăm
     processHundreds: (newValue,  surplus, inPos, bytext) => {
       let numberText = '';
       if (surplus != 0 ) numberText = `${textOfNumber[surplus]} trăm`; 
       else {
          numberText = bytext[inPos -1 ] != '' ? `${textOfNumber['10']} trăm`:'';
       }

       if (  surplus != 0 && bytext[inPos -1] == '' 
             && bytext[inPos - 2] == '') numberText += ` ${unitName[Math.floor(inPos/3)]}`;

       return numberText;    
     }
}

const processGroup = (newValue, surplus, inPos, bytext) => {    
     let posOf = inPos % 3; 
     let convert = unitProcess[unitNameProcess[posOf]](newValue, surplus, inPos, bytext);     
     bytext.push(convert);     
     return bytext;
}
 
const trantlateNumbertoVNString = (bytext, value, postion) => {        
     // bytext là array chứa 
     let newValue = Math.floor(value/10); // chi lấy phần nguyên
     let surplus = value%10; // chia lấy số dư 
     
     bytext = processGroup(newValue, surplus, postion, bytext);        
     if (newValue > 0 )  {                
       postion++; 
       bytext = trantlateNumbertoVNString(bytext, newValue, postion); 
     }     
     return bytext.filter(bt => bt !='' ).map(bt => bt.trim());

}
export default trantlateNumbertoVNString;