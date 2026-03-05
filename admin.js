
const scriptURL="https://script.google.com/macros/s/AKfycbwJyAXoVHvwcjV9DPQpMxbKvqMW38-gHE3i-VsG-7qpRy7B9nV4YAQw4xOwMbHgl17n/exec";


/* =========================
TIMER
========================= */

function startTimer(){

const timer=document.getElementById("timer");

setInterval(()=>{

const now=new Date();

timer.innerHTML=now.toLocaleString();

},1000);

}

startTimer();



/* =========================
LOGOUT
========================= */

function logout(){

sessionStorage.clear();
window.location="admin-login.html";

}



/* =========================
PAYMENT PROGRESS BAR
========================= */

function startPaymentProgress(){

const box=document.getElementById("paymentProgress");
const bar=document.getElementById("paymentFill");

box.style.display="block";
bar.style.width="0%";

setTimeout(()=>{bar.style.width="25%"},1000);
setTimeout(()=>{bar.style.width="60%"},3000);
setTimeout(()=>{bar.style.width="80%"},5000);
setTimeout(()=>{bar.style.width="90%"},7000);

}

function completePaymentProgress(){

const bar=document.getElementById("paymentFill");

bar.style.width="100%";

setTimeout(()=>{

document.getElementById("paymentProgress").style.display="none";
bar.style.width="0%";

},800);

}



/* =========================
COMPLAINT PROGRESS BAR
========================= */

function startComplaintProgress(){

const box=document.getElementById("complaintProgress");
const bar=document.getElementById("complaintFill");

box.style.display="block";
bar.style.width="0%";

setTimeout(()=>{bar.style.width="25%"},1000);
setTimeout(()=>{bar.style.width="60%"},3000);
setTimeout(()=>{bar.style.width="80%"},5000);
setTimeout(()=>{bar.style.width="90%"},7000);

}

function completeComplaintProgress(){

const bar=document.getElementById("complaintFill");

bar.style.width="100%";

setTimeout(()=>{

document.getElementById("complaintProgress").style.display="none";
bar.style.width="0%";

},800);

}



/* =========================
LOAD DATA
========================= */

function loadData(){

const data=new URLSearchParams();

data.append("action","getAdminData");

fetch(scriptURL,{
method:"POST",
body:data
})

.then(res=>res.json())

.then(res=>{

renderPayments(res.payments);
renderComplaints(res.complaints);
updateSummary(res.payments);

});

}

loadData();



/* =========================
SUMMARY CALCULATION
========================= */

function updateSummary(payments){

let total=0;
let verified=0;
let pending=0;
let notVerified=0;

payments.forEach(p=>{

const amt=parseFloat(p.amount)||0;

total+=amt;

if(p.status==="Verified") verified+=amt;
else if(p.status==="Pending") pending+=amt;
else notVerified+=amt;

});

document.getElementById("totalAmount").innerText="₹"+total;
document.getElementById("verifiedAmount").innerText="₹"+verified;
document.getElementById("pendingAmount").innerText="₹"+pending;
document.getElementById("notVerifiedAmount").innerText="₹"+notVerified;

}



/* =========================
RENDER PAYMENT TABLE
========================= */

function renderPayments(payments){

let html="<table>";

html+="<tr><th>Name</th><th>Village</th><th>Amount</th><th>Status</th></tr>";

payments.forEach((p,i)=>{

html+=`
<tr>
<td>${p.name}</td>
<td>${p.village}</td>
<td>${p.amount}</td>

<td>

<select data-index="${i}" class="paymentStatus">

<option ${p.status==="Verified"?"selected":""}>Verified</option>
<option ${p.status==="Pending"?"selected":""}>Pending</option>
<option ${p.status==="Not Verified"?"selected":""}>Not Verified</option>

</select>

</td>

</tr>
`;

});

html+="</table>";

document.getElementById("paymentTable").innerHTML=html;

}



/* =========================
RENDER COMPLAINT TABLE
========================= */

function renderComplaints(complaints){

let html="<table>";

html+="<tr><th>Name</th><th>Complaint</th><th>Status</th></tr>";

complaints.forEach((c,i)=>{

html+=`
<tr>

<td>${c.name}</td>

<td>${c.text}</td>

<td>

<select data-index="${i}" class="complaintStatus">

<option ${c.status==="Open"?"selected":""}>Open</option>
<option ${c.status==="Resolved"?"selected":""}>Resolved</option>

</select>

</td>

</tr>
`;

});

html+="</table>";

document.getElementById("complaintTable").innerHTML=html;

}



/* =========================
SAVE PAYMENT CHANGES
========================= */

function savePayments(){

startPaymentProgress();

const statuses=document.querySelectorAll(".paymentStatus");

let updates=[];

statuses.forEach((s,i)=>{

updates.push({

index:i,
status:s.value

});

});

const data=new URLSearchParams();

data.append("action","savePayments");
data.append("updates",JSON.stringify(updates));

fetch(scriptURL,{
method:"POST",
body:data
})

.then(res=>res.json())

.then(res=>{

completePaymentProgress();

document.getElementById("message").innerHTML="Payments updated successfully";

});

}



/* =========================
SAVE COMPLAINT CHANGES
========================= */

function saveComplaints(){

startComplaintProgress();

const statuses=document.querySelectorAll(".complaintStatus");

let updates=[];

statuses.forEach((s,i)=>{

updates.push({

index:i,
status:s.value

});

});

const data=new URLSearchParams();

data.append("action","saveComplaints");
data.append("updates",JSON.stringify(updates));

fetch(scriptURL,{
method:"POST",
body:data
})

.then(res=>res.json())

.then(res=>{

completeComplaintProgress();

document.getElementById("message").innerHTML="Complaints updated successfully";

});

}



/* =========================
SORT PAYMENTS
========================= */

function sortPayments(){

loadData();

}
