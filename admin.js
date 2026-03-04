const scriptURL="YOUR_WEB_APP_URL";

let paymentUpdates=[];
let complaintUpdates=[];

/* LOGOUT */

function logout(){
sessionStorage.clear();
location="admin-login.html";
}

/* SESSION TIMER */

let sessionMinutes=30;
let loginTime=sessionStorage.getItem("loginTime");

if(!loginTime){
loginTime=Date.now();
sessionStorage.setItem("loginTime",loginTime);
}

setInterval(()=>{

const now=Date.now();
let remaining=sessionMinutes*60000-(now-loginTime);

if(remaining<=0) logout();

let m=Math.floor(remaining/60000);
let s=Math.floor((remaining%60000)/1000);

let timer=document.getElementById("timer");

timer.innerText="Session "+m+":"+s.toString().padStart(2,"0");

if(m<5){
timer.classList.add("blink");
}

},1000);



/* SUMMARY */

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
plugins:{legend:{display:false}}
}
});

});



/* PAYMENTS */

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

<td id="payStatus${i}" class="${statusClass}">
${r[9]}
</td>

<td>

<button class="symbolBtn verify"
onclick="changePaymentStatus(${i},'Verified')">✓</button>

<button class="symbolBtn reject"
onclick="changePaymentStatus(${i},'Not Verified')">✗</button>

</td>

</tr>
`;

});

html+="</table>";

document.getElementById("paymentTable").innerHTML=html;

});

function changePaymentStatus(i,status){

let cell=document.getElementById("payStatus"+i);

cell.innerText=status;

cell.className=
status=="Verified"
?"statusVerified"
:"statusNotVerified";

paymentUpdates.push({
row:i+2,
status
});

}



/* SAVE PAYMENTS */

function savePayments(){

document.getElementById("paymentLoader").style.display="inline-block";

const data=new URLSearchParams();

data.append("action","updatePayments");
data.append("data",JSON.stringify(paymentUpdates));

fetch(scriptURL,{method:"POST",body:data})
.then(()=>location.reload());

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

<button class="symbolBtn verify"
onclick="changeComplaintStatus(${i},'Resolved')">✓</button>

<button class="symbolBtn reject"
onclick="changeComplaintStatus(${i},'Pending')">✗</button>

</td>

</tr>

`;

});

html+="</table>";

document.getElementById("complaintTable").innerHTML=html;

});


function changeComplaintStatus(i,status){

document.getElementById("compStatus"+i).innerText=status;

let reply=document.getElementById("reply"+i).value;

complaintUpdates.push({
row:i+2,
status,
reply
});

}



/* SAVE COMPLAINTS */

function saveComplaints(){

document.getElementById("complaintLoader").style.display="inline-block";

const data=new URLSearchParams();

data.append("action","updateComplaints");
data.append("data",JSON.stringify(complaintUpdates));

fetch(scriptURL,{method:"POST",body:data})
.then(()=>location.reload());

}
