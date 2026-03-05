const scriptURL="https://script.google.com/macros/s/AKfycbwJyAXoVHvwcjV9DPQpMxbKvqMW38-gHE3i-VsG-7qpRy7B9nV4YAQw4xOwMbHgl17n/exec";

let paymentUpdates=[];
let complaintUpdates=[];

/* -------- DATE FORMAT -------- */

function formatDate(dateStr){

const d=new Date(dateStr);

return d.toLocaleDateString("en-IN",{
day:"2-digit",
month:"short",
year:"numeric"
});

}

function formatTime(dateStr){

const d=new Date(dateStr);

return d.toLocaleTimeString("en-IN",{
hour:"2-digit",
minute:"2-digit"
});

}

/* -------- LOADER -------- */

function startLoader(){

document.getElementById("message").innerHTML=
'<div class="progressBar"><div class="progressFill" id="progressFill"></div></div>';

const bar=document.getElementById("progressFill");

setTimeout(()=>{bar.style.width="60%"},100);
setTimeout(()=>{bar.style.width="90%"},2000);

}

function stopLoader(){

const bar=document.getElementById("progressFill");

if(bar) bar.style.width="100%";

setTimeout(()=>{
document.getElementById("message").innerHTML="";
},500);

}

/* -------- SESSION TIMER -------- */

let sessionMinutes=30;
let loginTime=Date.now();

function startTimer(){

setInterval(()=>{

let now=Date.now();
let remaining=sessionMinutes*60000-(now-loginTime);

let m=Math.floor(remaining/60000);
let s=Math.floor((remaining%60000)/1000);

let timer=document.getElementById("timer");

timer.innerText="Session "+m+":"+s.toString().padStart(2,"0");

if(remaining<=0){
alert("Session expired");
location="admin-login.html";
}

},1000);

}

startTimer();

/* -------- PAGE LOAD -------- */

startLoader();

/* -------- SUMMARY -------- */

fetch(scriptURL+"?action=getPaymentSummary")
.then(r=>r.json())
.then(d=>{

document.getElementById("totalAmount").innerText="₹"+d.total;
document.getElementById("verifiedAmount").innerText="₹"+d.verified;
document.getElementById("pendingAmount").innerText="₹"+d.pending;
document.getElementById("notVerifiedAmount").innerText="₹"+d.notverified;

new Chart(document.getElementById("pieChart"),{
type:"pie",
data:{
labels:["Verified","Pending","Not Verified"],
datasets:[{
data:[d.verified,d.pending,d.notverified],
backgroundColor:["#22c55e","#3b82f6","#ef4444"]
}]
}
});

});

/* -------- PAYMENTS -------- */

fetch(scriptURL+"?action=getAllPayments")
.then(r=>r.json())
.then(data=>{

let html="<table>";

html+="<tr>";
html+="<th>Date</th>";
html+="<th>Time</th>";
html+="<th>RefID</th>";
html+="<th>Name</th>";
html+="<th>Village</th>";
html+="<th>Phone</th>";
html+="<th>Amount</th>";
html+="<th>UTR</th>";
html+="<th>Status</th>";
html+="<th>Action</th>";
html+="</tr>";

data.forEach((r,i)=>{

let date=formatDate(r[1]);
let time=formatTime(r[2]);

let statusClass="statusPending";
if(r[9]=="Verified") statusClass="statusVerified";
if(r[9]=="Not Verified") statusClass="statusNotVerified";

html+=`
<tr>
<td>${date}</td>
<td>${time}</td>
<td>${r[3]}</td>
<td>${r[4]}</td>
<td>${r[5]}</td>
<td>${r[6]}</td>
<td>${r[7]}</td>
<td>${r[8]}</td>
<td id="payStatus${i}" class="${statusClass}">${r[9]}</td>

<td>
<button class="btnVerify" onclick="setPaymentStatus(${i},'Verified')">✓</button>
<button class="btnReject" onclick="setPaymentStatus(${i},'Not Verified')">✗</button>
</td>
</tr>
`;

});

html+="</table>";

document.getElementById("paymentTable").innerHTML=html;

});

/* -------- PAYMENT STATUS -------- */

function setPaymentStatus(i,status){

let cell=document.getElementById("payStatus"+i);

cell.innerText=status;

cell.className=status==="Verified"?"statusVerified":"statusNotVerified";

paymentUpdates.push({row:i+2,status});

}

/* -------- SAVE PAYMENTS -------- */

function savePayments(){

startLoader();

const data=new URLSearchParams();

data.append("action","updatePayments");
data.append("data",JSON.stringify(paymentUpdates));

fetch(scriptURL,{method:"POST",body:data})
.then(()=>{
stopLoader();
location.reload();
});

}

/* -------- COMPLAINTS -------- */

fetch(scriptURL+"?action=getAllComplaints")
.then(r=>r.json())
.then(data=>{

let html="<table>";

html+="<tr>";
html+="<th>Date</th>";
html+="<th>Name</th>";
html+="<th>Phone</th>";
html+="<th>Complaint</th>";
html+="<th>Status</th>";
html+="<th>Reply</th>";
html+="<th>WhatsApp</th>";
html+="<th>Action</th>";
html+="</tr>";

data.forEach((r,i)=>{

let date=formatDate(r[0]);

html+=`
<tr>
<td>${date}</td>
<td>${r[2]}</td>
<td>${r[4]}</td>
<td>${r[6]}</td>

<td id="compStatus${i}">${r[7]}</td>

<td>
<textarea id="reply${i}">${r[8]||""}</textarea>
</td>

<td>${r[10]||"Pending"}</td>

<td>
<button class="btnVerify" onclick="setComplaintStatus(${i},'Resolved')">✓</button>
<button class="btnReject" onclick="setComplaintStatus(${i},'Pending')">✗</button>
</td>

</tr>
`;

});

html+="</table>";

document.getElementById("complaintTable").innerHTML=html;

stopLoader();

});

/* -------- COMPLAINT STATUS -------- */

function setComplaintStatus(i,status){

document.getElementById("compStatus"+i).innerText=status;

const reply=document.getElementById("reply"+i).value;

complaintUpdates.push({
row:i+2,
status,
reply
});

}

/* -------- SAVE COMPLAINTS -------- */

function saveComplaints(){

startLoader();

const data=new URLSearchParams();

data.append("action","updateComplaints");
data.append("data",JSON.stringify(complaintUpdates));

fetch(scriptURL,{
method:"POST",
body:data
})
.then(()=>{
stopLoader();
location.reload();
});

}
