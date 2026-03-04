const scriptURL="YOUR_WEB_APP_URL";

let paymentUpdates=[];
let complaintUpdates=[];

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

<td class="${statusClass}" id="payStatus${i}">
${r[9]}
</td>

<td>

<button class="btnVerify"
onclick="setPaymentStatus(${i},'Verified')">✓</button>

<button class="btnReject"
onclick="setPaymentStatus(${i},'Not Verified')">✗</button>

</td>

</tr>
`;

});

html+="</table>";

document.getElementById("paymentTable").innerHTML=html;

});

function setPaymentStatus(i,status){

document.getElementById("payStatus"+i).innerText=status;

paymentUpdates.push({
row:i+2,
status
});

}


/* SAVE PAYMENT CHANGES */

function savePayments(){

document.getElementById("paymentLoader").style.display="inline-block";

const data=new URLSearchParams();

data.append("action","updatePayments");
data.append("data",JSON.stringify(paymentUpdates));

fetch(scriptURL,{
method:"POST",
body:data
})
.then(()=>location.reload());

}



/* COMPLAINT TABLE */

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

<button class="btnVerify"
onclick="setComplaintStatus(${i},'Resolved')">✓</button>

<button class="btnReject"
onclick="setComplaintStatus(${i},'Pending')">✗</button>

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

function saveComplaints(){

document.getElementById("complaintLoader").style.display="inline-block";

const data=new URLSearchParams();

data.append("action","updateComplaints");
data.append("data",JSON.stringify(complaintUpdates));

fetch(scriptURL,{
method:"POST",
body:data
})
.then(()=>location.reload());

}
