const scriptURL="https://script.google.com/macros/s/AKfycbwJyAXoVHvwcjV9DPQpMxbKvqMW38-gHE3i-VsG-7qpRy7B9nV4YAQw4xOwMbHgl17n/exec";

function loadEventName(){

fetch(scriptURL+"?action=getSettings")

.then(res=>res.json())

.then(data=>{

if(data.EventName){

const title=document.getElementById("eventTitle");

if(title){
title.innerText=data.EventName;
}

}

})

.catch(()=>{});

}

document.addEventListener("DOMContentLoaded",loadEventName);
