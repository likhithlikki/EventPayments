document.addEventListener("DOMContentLoaded",function(){

const scriptURL="https://script.google.com/macros/s/AKfycbwJyAXoVHvwcjV9DPQpMxbKvqMW38-gHE3i-VsG-7qpRy7B9nV4YAQw4xOwMbHgl17n/exec";

let userData={};
let upiLink="";
let upiID="";

/* LOAD SETTINGS */

fetch(scriptURL+"?action=getSettings")

.then(res=>res.json())

.then(data=>{

upiID=data.UPI_ID;

if(data.EventName){
document.getElementById("weddingTitle").innerText=data.EventName;
}

});

/* VALIDATION */

const nameInput=document.getElementById("name");
const phoneInput=document.getElementById("phone");
const amountInput=document.getElementById("amount");
const proceedBtn=document.getElementById("proceedBtn");

function validateForm(){

let valid=true;

if(!/^[A-Za-z ]+$/.test(nameInput.value.trim())){
nameInput.classList.add("invalid");
valid=false;
}else nameInput.classList.remove("invalid");

if(!/^[6-9]\d{9}$/.test(phoneInput.value.trim())){
phoneInput.classList.add("invalid");
valid=false;
}else phoneInput.classList.remove("invalid");

if(Number(amountInput.value)<50){
amountInput.classList.add("invalid");
valid=false;
}else amountInput.classList.remove("invalid");

proceedBtn.disabled=!valid;

}

nameInput.addEventListener("input",validateForm);

phoneInput.addEventListener("input",function(){
this.value=this.value.replace(/\D/g,"").slice(0,10);
validateForm();
});

amountInput.addEventListener("input",validateForm);

/* GENERATE REFID */

function generateRefID(){
return "REF"+Date.now();
}

/* PAYMENT PAGE */

window.goToPayment=function(){

userData={
refid:generateRefID(),
name:nameInput.value.trim(),
village:document.getElementById("village").value.trim(),
phone:phoneInput.value.trim(),
amount:amountInput.value.trim()
};

upiLink=`upi://pay?pa=${upiID}&pn=Event&am=${userData.amount}&cu=INR&tn=${userData.refid}`;

document.getElementById("formSection").style.display="none";
document.getElementById("paymentSection").style.display="block";

document.getElementById("qrcode").innerHTML="";

new QRCode(document.getElementById("qrcode"),upiLink);

}

/* OPEN UPI */

window.openUPI=function(){
window.location.href=upiLink;
}

/* PROGRESS BAR */

function startProgressBar(){

const msg=document.getElementById("message");

msg.innerHTML='<div class="progressBar"><div class="progressFill" id="progressFill"></div></div>';

const bar=document.getElementById("progressFill");

setTimeout(()=>{bar.style.width="80%"},100);
setTimeout(()=>{bar.style.width="95%"},3000);

}

function completeProgress(){

const bar=document.getElementById("progressFill");

if(bar) bar.style.width="100%";

}

/* FINISH PAYMENT */

window.finishPayment=function(){

const utr=document.getElementById("utr").value.trim();

const msg=document.getElementById("message");

if(!utr){
alert("Enter UTR Number");
return;
}

startProgressBar();

const data=new URLSearchParams();

data.append("action","insertPayment");
data.append("refid",userData.refid);
data.append("name",userData.name);
data.append("village",userData.village);
data.append("phone",userData.phone);
data.append("amount",userData.amount);
data.append("utr",utr);

fetch(scriptURL,{method:"POST",body:data})

.then(res=>res.text())

.then(res=>{

completeProgress();

if(res==="DuplicateRef"){

msg.innerHTML="<span class='error'>Duplicate Reference ID</span>";

}
else if(res==="DuplicatePhone"){

msg.innerHTML="<span class='error'>Phone already used</span>";

}
else if(res==="Inserted"){

msg.innerHTML="<span class='success'>Payment submitted successfully</span>";

showReceipt(utr);

}
else{

msg.innerHTML="<span class='error'>Server error</span>";

}

})

.catch(()=>{

msg.innerHTML="<span class='error'>Server connection error</span>";

});

}

/* SHOW RECEIPT */

function showReceipt(utr){

document.getElementById("paymentSection").style.display="none";
document.getElementById("receiptSection").style.display="block";

document.getElementById("receiptContent").innerHTML=`
<h3>Payment Receipt</h3>
<p><b>Name:</b> ${userData.name}</p>
<p><b>Village:</b> ${userData.village}</p>
<p><b>Phone:</b> ${userData.phone}</p>
<p><b>Amount:</b> ₹${userData.amount}</p>
<p><b>Reference ID:</b> ${userData.refid}</p>
<p><b>UTR:</b> ${utr}</p>
<p><b>Status:</b> Pending Verification</p>
`;

}

/* DOWNLOAD RECEIPT */

window.downloadReceipt=function(){

startProgressBar();

setTimeout(()=>{

const { jsPDF } = window.jspdf;

const doc=new jsPDF({unit:"mm",format:[80,120]});

let y=10;

doc.addImage("sbi-logo.png","PNG",30,3,20,10);

y+=18;

doc.text(document.getElementById("weddingTitle").innerText,40,y,{align:"center"});

y+=8;

doc.text("Payment Receipt",40,y,{align:"center"});

y+=10;

doc.text("Name: "+userData.name,5,y); y+=6;
doc.text("Village: "+userData.village,5,y); y+=6;
doc.text("Phone: "+userData.phone,5,y); y+=6;
doc.text("Amount: ₹"+userData.amount,5,y); y+=6;
doc.text("RefID: "+userData.refid,5,y); y+=6;

const utr=document.getElementById("utr").value;

doc.text("UTR: "+utr,5,y);

y+=10;

doc.addImage("sign.jpeg","JPEG",45,y,25,10);

doc.save("payment_receipt.pdf");

completeProgress();

},700);

}

});
