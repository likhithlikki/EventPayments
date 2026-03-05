
const scriptURL="https://script.google.com/macros/s/AKfycbwJyAXoVHvwcjV9DPQpMxbKvqMW38-gHE3i-VsG-7qpRy7B9nV4YAQw4xOwMbHgl17n/exec";

/* ---------------- TIMER ---------------- */

function startTimer(){
setInterval(()=>{
const now=new Date();
document.getElementById("timer").innerText=now.toLocaleString();
},1000);
}

startTimer();

/* ---------------- LOGOUT ---------------- */

function logout(){
sessionStorage.clear();
window.location="admin-login.html";
}

/* ---------------- PROGRESS BAR ---------------- */

function startProgress(id){

const container=document.getElementById(id);
const bar=container.querySelector(".progressFill");

container.style.display="block";
bar.style.width="0%";

/* 1 sec → 50% */
setTimeout(()=>{
bar.style.width="50%";
},1000);

/* next 2 sec → 80% */
setTimeout(()=>{
bar.style.width="80%";
},3000);

/* next 2 sec → 90% */
setTimeout(()=>{
bar.style.width="90%";
},5000);

}

function finishProgress(id){

const container=document.getElementById(id);
const bar=container.querySelector(".progressFill");

bar.style.width="100%";

setTimeout(()=>{
container.style.display="none";
bar.style.width="0%";
},500);

}

/* ---------------- LOAD DASHBOARD DATA ---------------- */

function loadDashboard(){

fetch(scriptURL+"?action=getAdminData")
.then(res=>res.json())
.then(data=>{

document.getElementById("totalAmount").innerText="₹"+data.total;
document.getElementById("verifiedAmount").innerText="₹"+data.verified;
document.getElementById("pendingAmount").innerText="₹"+data.pending;
document.getElementById("notVerifiedAmount").innerText="₹"+data.notVerified;

renderPayments(data.payments);
renderComplaints(data.complaints);

drawChart(data);

});

}

window.onload=loadDashboard;

/* ---------------- PIE CHART ---------------- */

function drawChart(data){

new Chart(document.getElementById("pieChart"),{
type:"pie",
data:{
labels:["Verified","Pending","Not Verified"],
datasets:[{
data:[data.verified,data.pending,data.notVerified],
backgroundColor:["#22c55e","#3b82f6","#ef4444"]
}]
}
});

}

/* ---------------- PAYMENTS TABLE ---------------- */

function renderPayments(payments){

let html="<table>";
html+="<tr><th>Name</th><th>Village</th><th>Amount</th><th>Date</th><th>Status</th></tr>";

payments.forEach(p=>{

html+="<tr>";

html+="<td>"+p.name+"</td>";
html+="<td>"+p.village+"</td>";
html+="<td>"+p.amount+"</td>";
html+="<td>"+p.date+"</td>";

html+=`<td>
<select data-id="${p.id}">
<option ${p.status=="Verified"?"selected":""}>Verified</option>
<option ${p.status=="Pending"?"selected":""}>Pending</option>
<option ${p.status=="Not Verified"?"selected":""}>Not Verified</option>
</select>
</td>`;

html+="</tr>";

});

html+="</table>";

document.getElementById("paymentTable").innerHTML=html;

}

/* ---------------- COMPLAINTS TABLE ---------------- */

function renderComplaints(complaints){

let html="<table>";
html+="<tr><th>Name</th><th>Complaint</th><th>Status</th></tr>";

complaints.forEach(c=>{

html+="<tr>";

html+="<td>"+c.name+"</td>";
html+="<td>"+c.text+"</td>";

html+=`<td>
<select data-id="${c.id}">
<option ${c.status=="Open"?"selected":""}>Open</option>
<option ${c.status=="Closed"?"selected":""}>Closed</option>
</select>
</td>`;

html+="</tr>";

});

html+="</table>";

document.getElementById("complaintTable").innerHTML=html;

}

/* ---------------- SAVE PAYMENTS ---------------- */

function savePayments(){

startProgress("paymentProgress");

const rows=document.querySelectorAll("#paymentTable select");

let updates=[];

rows.forEach(r=>{
updates.push({
id:r.dataset.id,
status:r.value
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
finishProgress("paymentProgress");
})

.catch(()=>{
finishProgress("paymentProgress");
});

}

/* ---------------- SAVE COMPLAINTS ---------------- */

function saveComplaints(){

startProgress("complaintProgress");

const rows=document.querySelectorAll("#complaintTable select");

let updates=[];

rows.forEach(r=>{
updates.push({
id:r.dataset.id,
status:r.value
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
finishProgress("complaintProgress");
})

.catch(()=>{
finishProgress("complaintProgress");
});

}
