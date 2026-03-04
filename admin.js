const scriptURL="https://script.google.com/macros/s/AKfycbwJyAXoVHvwcjV9DPQpMxbKvqMW38-gHE3i-VsG-7qpRy7B9nV4YAQw4xOwMbHgl17n/exec";

const user=sessionStorage.getItem("adminUser");
const role=sessionStorage.getItem("adminRole");

if(!user){
location="admin-login.html";
}

/* SESSION TIMER */

let sessionMinutes=30;
let loginTime=sessionStorage.getItem("loginTime");

if(!loginTime){
loginTime=Date.now();
sessionStorage.setItem("loginTime",loginTime);
}

fetch(scriptURL+"?action=getSettings")
.then(r=>r.json())
.then(s=>{
sessionMinutes=parseInt(s.SessionTimeoutMinutes||30);
startTimer();
});

function startTimer(){

setInterval(()=>{

const now=Date.now();

let remaining=sessionMinutes*60000-(now-loginTime);

if(remaining<=0){
logout();
}

let m=Math.floor(remaining/60000);
let s=Math.floor((remaining%60000)/1000);

document.getElementById("timer").innerText=
"Session "+m+":"+s.toString().padStart(2,"0");

},1000);

}

function logout(){
sessionStorage.clear();
location="admin-login.html";
}



/* PAYMENT SUMMARY */

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



/* PAYMENTS TABLE */

let paymentUpdates=[];

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
<td>${r[9]}</td>

<td>

<button onclick="setStatus(${i+2},'Verified')">✓</button>

<button onclick="setStatus(${i+2},'Not Verified')">✗</button>

</td>

</tr>

`;

});

html+="</table>";

document.getElementById("paymentTable").innerHTML=html;

});

function setStatus(row,status){

paymentUpdates.push({row,status});

}



/* SAVE PAYMENT CHANGES */

document.getElementById("savePayments").onclick=function(){

if(paymentUpdates.length===0) return;

const data=new URLSearchParams();

data.append("action","updatePayments");
data.append("data",JSON.stringify(paymentUpdates));

fetch(scriptURL,{
method:"POST",
body:data
})
.then(()=>{

alert("Payments updated");

location.reload();

});

};



/* COMPLAINT TABLE */

let complaintUpdates=[];

fetch(scriptURL+"?action=getAllComplaints")
.then(r=>r.json())
.then(data=>{

let html="<table>";

html+="<tr>";

html+="<th>Name</th>";
html+="<th>Phone</th>";
html+="<th>Complaint</th>";
html+="<th>Status</th>";
html+="<th>Reply</th>";

html+="</tr>";

data.forEach((r,i)=>{

html+=`

<tr>

<td>${r[2]}</td>

<td>${r[4]}</td>

<td>${r[6]}</td>

<td>

<select onchange="updateComplaint(${i+2},this.value,null)">

<option ${r[7]=="Pending"?"selected":""}>Pending</option>

<option ${r[7]=="Resolved"?"selected":""}>Resolved</option>

</select>

</td>

<td>

<textarea onchange="updateComplaint(${i+2},null,this.value)">${r[8]||""}</textarea>

</td>

</tr>

`;

});

html+="</table>";

document.getElementById("complaintTable").innerHTML=html;

});

function updateComplaint(row,status,reply){

complaintUpdates.push({row,status,reply});

}



/* SAVE COMPLAINT CHANGES */

document.getElementById("saveComplaints").onclick=function(){

if(complaintUpdates.length===0) return;

const data=new URLSearchParams();

data.append("action","updateComplaints");
data.append("data",JSON.stringify(complaintUpdates));

fetch(scriptURL,{
method:"POST",
body:data
})
.then(()=>{

alert("Complaints updated");

location.reload();

});

};
