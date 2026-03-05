const scriptURL="https://script.google.com/macros/s/AKfycbwJyAXoVHvwcjV9DPQpMxbKvqMW38-gHE3i-VsG-7qpRy7B9nV4YAQw4xOwMbHgl17n/exec";

let paymentUpdates=[];
let complaintUpdates=[];
let paymentData=[];

/* SESSION CHECK */

const token=sessionStorage.getItem("adminToken");
const expiry=sessionStorage.getItem("adminExpiry");

if(!token){
location="admin-login.html";
}

if(expiry && new Date()>new Date(expiry)){
alert("Session expired");
sessionStorage.clear();
location="admin-login.html";
}

/* SESSION TIMER */

let sessionMinutes=30;
let loginTime=Date.now();

fetch(scriptURL+"?action=getSettings")
.then(r=>r.json())
.then(settings=>{
sessionMinutes=parseInt(settings.SessionTimeoutMinutes)||30;
});

function startTimer(){

setInterval(()=>{

let now=Date.now();
let remaining=sessionMinutes*60000-(now-loginTime);

let m=Math.floor(remaining/60000);
let s=Math.floor((remaining%60000)/1000);

let timer=document.getElementById("timer");

if(timer){

timer.innerText="Session "+m+":"+s.toString().padStart(2,"0");

if(m<5){
timer.classList.add("blink");
}

}

if(remaining<=0){
logout();
}

},1000);

}

startTimer();

function logout(){
sessionStorage.clear();
location="admin-login.html";
}


/* ANALYTICS SUMMARY */
/* SAVE BUTTON LOADER */

function startSaveLoader(containerId){

const container=document.getElementById(containerId);

container.innerHTML=
'<div class="progressBar"><div class="progressFill" id="'+containerId+'Fill"></div></div>';

const bar=document.getElementById(containerId+"Fill");

setTimeout(()=>{bar.style.width="50%"},1000);
setTimeout(()=>{bar.style.width="80%"},3000);
setTimeout(()=>{bar.style.width="90%"},5000);

}

function completeSaveLoader(containerId){

const bar=document.getElementById(containerId+"Fill");

if(bar) bar.style.width="100%";

}


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
},
options:{
plugins:{
legend:{display:false}
}
}
});

});


/* PAYMENTS */

fetch(scriptURL+"?action=getAllPayments")
.then(r=>r.json())
.then(data=>{

paymentData=data;

renderPayments(data);

});


function renderPayments(data){

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

let statusClass="statusPending";

if(r[9]=="Verified") statusClass="statusVerified";
if(r[9]=="Not Verified") statusClass="statusNotVerified";

html+=`
<tr>
<td>${r[1]}</td>
<td>${r[2]}</td>
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

}


function setPaymentStatus(i,status){

let cell=document.getElementById("payStatus"+i);

cell.innerText=status;

cell.className=status==="Verified"?"statusVerified":"statusNotVerified";

paymentUpdates.push({row:i+2,status});

}


/* SORTING */

function sortPayments(){

let type=document.getElementById("sortSelect").value;

let sorted=[...paymentData];

if(type==="amount"){
sorted.sort((a,b)=>Number(b[7])-Number(a[7]));
}

if(type==="date"){
sorted.sort((a,b)=>new Date(b[1])-new Date(a[1]));
}

if(type==="village"){
sorted.sort((a,b)=>a[5].localeCompare(b[5]));
}

if(type==="name"){
sorted.sort((a,b)=>a[4].localeCompare(b[4]));
}

renderPayments(sorted);

}


/* SAVE PAYMENTS */
function savePayments(btn){

startSaveLoader("paymentLoader");

const data=new URLSearchParams();

data.append("action","updatePayments");
data.append("data",JSON.stringify(paymentUpdates));
data.append("admin",sessionStorage.getItem("adminUser"));

fetch(scriptURL,{method:"POST",body:data})
.then(()=>{

completeSaveLoader("paymentLoader");

setTimeout(()=>{
location.reload();
},500);

});

}

/* COMPLAINTS */

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

html+=`
<tr>

<td>${r[0]}</td>
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

});


function setComplaintStatus(i,status){

document.getElementById("compStatus"+i).innerText=status;

const reply=document.getElementById("reply"+i).value;

complaintUpdates.push({
row:i+2,
status,
reply
});

}


/* SAVE COMPLAINTS */
function saveComplaints(btn){

startSaveLoader("complaintLoader");

const data=new URLSearchParams();

data.append("action","updateComplaints");
data.append("data",JSON.stringify(complaintUpdates));
data.append("admin",sessionStorage.getItem("adminUser"));

fetch(scriptURL,{
method:"POST",
body:data
})
.then(()=>{

completeSaveLoader("complaintLoader");

setTimeout(()=>{
location.reload();
},500);

});

}

