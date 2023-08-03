const fectchDefault = {
    mode: 'cors', 
    ache: 'no-cache', 
    credentials: 'same-origin', 
    headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', 
    referrerPolicy: 'no-referrer',
    method: 'GET',     
}

const fchRequest = ({ftchURI, data}) => {
    // data = {method, body}
    let option = { ...fectchDefault, ...data};
    return fetch(ftchURI,option)
        .then(response => {
            return response.json();
        })
        .catch(function(error) {
            return error;
        });      
}
/*const xhrRequest = data => {

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload =  result => {
            if (xhr.status == 200) {
                console.log(xhr.responseText);	                
                //let inMessage = JSON.parse(xhr.responseText)
                //console.log(inMessage);	 
                resolve(inMessage)
            } else {
                console.log(xhr.responseText)
                reject('error')					
            }
        }			
        xhr.open('POST','/wp-admin/admin-ajax.php');
        xhr.send(data);		
    })		
}*/

export default fchRequest;
