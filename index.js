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
document.getElementById("eventTitle").innerText=data.EventName;
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


/* REF ID */

function generateRefID(){
return "REF"+Date.now();
}


/* PAYMENT */

function goToPayment(){

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

function openUPI(){
window.location.href=upiLink;
}


/* FINISH PAYMENT */

function finishPayment(){

const utr=document.getElementById("utr").value.trim();

if(!utr){
alert("Enter UTR Number");
return;
}

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

if(res==="Inserted"){

showReceipt(utr);

}

else{
alert(res);
}

});

}


/* RECEIPT */

function showReceipt(utr){

document.getElementById("receiptBox").style.display="block";

document.getElementById("r_name").innerText="Name: "+userData.name;
document.getElementById("r_village").innerText="Village: "+userData.village;
document.getElementById("r_phone").innerText="Phone: "+userData.phone;
document.getElementById("r_amount").innerText="Amount: ₹"+userData.amount;
document.getElementById("r_utr").innerText="UTR: "+utr;
document.getElementById("r_ref").innerText="RefID: "+userData.refid;

downloadReceipt();

}


/* DOWNLOAD */

function downloadReceipt(){

html2canvas(document.getElementById("receipt")).then(canvas=>{

let link=document.createElement("a");

link.download="receipt.png";

link.href=canvas.toDataURL();

link.click();

});

}
