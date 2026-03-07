
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

let sessionMinutes=99;
let loginTime=Date.now();


fetch(scriptURL+"?action=getSettings")
.then(r=>r.json())
.then(settings=>{
sessionMinutes=parseInt(settings.SessionTimeoutMinutes)||30;
});




function formatDateTime(dateISO, timeISO){

const dateObj = new Date(dateISO);
const timeObj = new Date(timeISO);

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const day = String(dateObj.getDate()).padStart(2,'0');
const month = months[dateObj.getMonth()];
const year = dateObj.getFullYear();

let hours = timeObj.getHours();
let minutes = String(timeObj.getMinutes()).padStart(2,'0');

const ampm = hours >= 12 ? "PM" : "AM";

hours = hours % 12;
hours = hours ? hours : 12;

return {
date: `${day}-${month}-${year}`,
time: `${hours}:${minutes} ${ampm}`
};

}



function sendComplaintWhatsApp(i,phone,name,complaint){

const reply=document.getElementById("reply"+i).value;

const data=new URLSearchParams();

data.append("action","sendComplaintWhatsApp");
data.append("phone",phone);
data.append("name",name);
data.append("complaint",complaint);
data.append("reply",reply);

fetch(scriptURL,{
method:"POST",
body:data
})
.then(r=>r.text())
.then(res=>{

document.getElementById("waStatus"+i).innerHTML=res;

})
.catch(()=>{

document.getElementById("waStatus"+i).innerHTML="<span style='color:red'>Failed</span>";

});

}




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

const data=new URLSearchParams();

data.append("action","adminLogout");
data.append("admin",sessionStorage.getItem("adminUser"));

fetch(scriptURL,{
method:"POST",
body:data
});

sessionStorage.clear();
location="admin-login.html";

}

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

/* ANALYTICS SUMMARY */

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

/* PAYMENTS-------------------------------------------------------------------------------------------------------------------------------------------------------- */

fetch(scriptURL+"?action=getAllPayments")
.then(r=>r.json())
.then(data=>{

paymentData=data;

renderPayments(data);

});

function renderPayments(data){

let html="<table>";

html+="<tr>";
html+="<th>Date & Time</th>";
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

const dt = formatDateTime(r[1], r[2]);
  
html+=`
<tr>
<td class="dateCell">
<div class="dateText">${dt.date}</div>
<div class="timeText">${dt.time}</div>
</td>
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

/* COMPLAINTS ----------------------- --------------------------------------------------------------------------------------------------------------------- */

fetch(scriptURL+"?action=getAllComplaints")
.then(r=>r.json())
.then(data=>{

let html="<table>";

html+=`
<tr>
<th>Date & Time</th>
<th>Complaint ID</th>
<th>Name</th>
<th>Phone</th>
<th>Email</th>
<th>Complaint</th>
<th>File</th>
<th>Status</th>
<th>Reply</th>
<th>WhatsApp</th>
<th>Action</th>
</tr>
`;

data.forEach((r,i)=>{

const d=new Date(r[0]);

const date=d.toLocaleDateString("en-IN",{
day:"2-digit",
month:"short",
year:"numeric"
});

const time=d.toLocaleTimeString("en-IN",{
hour:"2-digit",
minute:"2-digit"
});

html+=`
<tr>

<td class="dateCell">
<div class="dateText">${date}</div>
<div class="timeText">${time}</div>
</td>

<td>${r[1]}</td>

<td>${r[2]}</td>

<td>${r[4]}</td>

<td>${r[5]}</td>

<td>${r[6]}</td>

<td>
${r[11] && r[11].startsWith("http")
? `<a href="${r[11]}" target="_blank">View</a>`
: "No File"}
</td>

<td id="compStatus${i}">${r[7]}</td>

<td>
<textarea id="reply${i}">${r[8] || ""}</textarea>
</td>

<td>
<button onclick="sendComplaintWhatsApp(${i},'${r[4]}','${r[2]}','${r[6]}')" class="btnVerify">
Send WhatsApp
</button>

<div id="waStatus${i}">
${r[10] || "Pending"}
</div>
</td>

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




/* ADMIN ACTIVITY */



fetch(scriptURL + "?action=getAdminActivity")
.then(r => r.json())
.then(data => {

let html="";

if(!data || data.length===0){
html="<div class='activityItem'>No admin activity yet</div>";
}

data.reverse().forEach((r,index) => {

let d = new Date(r.time);
let formattedTime = d.toLocaleString("en-IN",{
day:"2-digit",
month:"short",
year:"numeric",
hour:"2-digit",
minute:"2-digit"
});

html += `
<div class="activityItem">
<span class="activitySerial">#${index+1}</span>

${r.refId==="LOGIN"
? `<b>${r.admin}</b> logged into admin panel`
: `<b>${r.admin}</b> updated <b>${r.refId}</b> from <b>${r.oldStatus}</b> to <b>${r.newStatus}</b>`
}

<span class="activityTime">${formattedTime}</span>
</div>
`;

});

document.getElementById("adminActivity").innerHTML = html;

})
.catch(err=>{
console.log("Activity load error:",err);
});











