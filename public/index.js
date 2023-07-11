
console.log(document.getElementById("createdoc"));
document.getElementById('createdoc').addEventListener("click",async()=>{
    axios.defaults.withCredentials = true;
    const getDocId = await axios.get(`http://localhost:3000/api/v1/createDocument`,{withCredentials: true,crossDomain: true})
    .then((res)=>res.data)
    .catch((err)=>{window.location.href=`http://localhost:3000/loginPage`});
    if(getDocId){
        window.location.href=`http://localhost:3000/api/v1/document?docId=${getDocId.document_id}`;
    }
    
});