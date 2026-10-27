'use strict';
// Content: edit controls and environments to change the architecture text,
// overviewNodes and scenarios further down to change the journeys.
const controls = [
{title:'Network & segmentation',short:'Network & segmentation',icon:'⬡',desc:'Constrain ingress, egress and lateral movement with explicit, narrowly scoped paths. A permitted network connection still requires identity and application checks.',good:['Default-deny between security zones; allow only documented flows.','Keep data services private and separate administrative access.','Review outbound destinations and monitor denied connections.'],tools:['Firewall','Network policy','DDoS protection','IDS / IPS'],risk:'Without segmentation, one compromised workload can reach more of the estate.',env:{onprem:['Internet client','DMZ firewall','App VLAN','Data VLAN'],cloud:['Internet client','Edge gateway','Private workload','Private data service'],hybrid:['On-premises app','Egress policy','Encrypted interconnect','Cloud private service']},labels:['Scoped ingress','Allowlisted route','Explicit service port'],event:'Connection decision'},
{title:'Encryption in transit',short:'TLS & transport',icon:'↔',desc:'Protect each sensitive network hop with encryption and peer authentication. An encrypted tunnel does not replace authorisation at the destination.',good:['Validate peer identities and certificate chains.','Protect internal service hops as well as the public edge.','Automate certificate renewal and monitor expiry.'],tools:['TLS termination','Certificate authority','Mutual TLS','Encrypted tunnel'],risk:'A clear-text internal hop can expose data even when the external connection is encrypted.',env:{onprem:['Client','TLS reverse proxy','Re-encrypted app hop','Authenticated data peer'],cloud:['Client','TLS edge endpoint','Service identity / mTLS','Private data endpoint'],hybrid:['On-premises service','Authenticated tunnel','Cloud ingress / TLS','Authenticated API']},labels:['Validate certificate','Encrypted session','Verify destination'],event:'Certificate / handshake event'},
{title:'Identity & MFA',short:'Identity & MFA',icon:'◎',desc:'Establish who or what is requesting access. Use phishing-resistant MFA for people and short-lived, scoped identities for workloads.',good:['Check user and device context before a session is issued.','Prefer phishing-resistant MFA; control recovery and enrolment.','Use workload identities instead of embedded account passwords.'],tools:['Identity provider','MFA','Identity federation','Device posture'],risk:'A stolen password becomes much more useful when additional identity checks are absent.',env:{onprem:['Managed endpoint','Identity service + MFA','Session policy','Internal application'],cloud:['User / workload','Identity service','Short-lived token','Private application'],hybrid:['On-premises user','Federated identity + MFA','Cloud token validation','Cloud application']},labels:['Authentication','Scoped token','Session validation'],event:'Sign-in / token event'},
{title:'Least-privilege access',short:'Access control',icon:'⌘',desc:'Decide what an authenticated identity may do to a specific resource. Evaluate authorisation at the service, not just at the network boundary.',good:['Deny by default and check object-level access on every operation.','Grant the minimum role, scope and duration needed.','Separate privileged accounts; approve and record elevated sessions.'],tools:['Role / attribute policy','Privileged access','Policy engine','Service authorisation'],risk:'A valid session with excessive permissions can read or change data outside its intended scope.',env:{onprem:['Authenticated user','Privileged access broker','Application policy','Scoped data record'],cloud:['Workload identity','Policy decision','API authorisation','Scoped data resource'],hybrid:['Federated principal','Mapped claims','Destination policy','Authorised resource']},labels:['Identity + context','Evaluate action','Permit scoped access'],event:'Authorisation decision'},
{title:'Application & input safety',short:'Application security',icon:'⌗',desc:'Treat incoming data as untrusted. Enforce schemas, encode output and use parameterised data access; edge filtering is an additional layer.',good:['Validate inputs against explicit schemas at the application.','Use parameterised queries and context-aware output encoding.','Apply request limits and safe error handling.'],tools:['WAF','Schema validation','Secure coding','API gateway'],risk:'Edge filtering alone cannot guarantee that application queries or object permissions are safe.',env:{onprem:['Untrusted request','Reverse proxy / WAF','Application validator','Parameterised query'],cloud:['API request','API gateway / WAF','Schema + logic checks','Scoped data query'],hybrid:['Partner / site request','Cross-estate API gateway','Destination validator','Parameterised query']},labels:['Size / rate check','Schema validation','Bound parameters'],event:'Rejected input / request event'},
{title:'Data protection',short:'Data encryption',icon:'▤',desc:'Protect stored information according to its sensitivity. Combine encryption with access policy, retention and deletion; encryption alone does not stop an authorised read.',good:['Classify and minimise sensitive data before storage.','Encrypt storage and backups; restrict decryption privileges.','Separate key administration and test retention and deletion.'],tools:['Storage encryption','Data classification','Key management','DLP'],risk:'Encryption at rest does not prevent a compromised application from reading data it is allowed to decrypt.',env:{onprem:['Application record','Data access policy','Storage encryption','Encrypted database'],cloud:['Application record','Private data API','Managed key boundary','Encrypted data store'],hybrid:['Classified local data','Transfer policy','Cloud encryption','Encrypted replica']},labels:['Classify / minimise','Authorised write','Encrypted persistence'],event:'Data access / export event'},
{title:'Endpoint & workload defence',short:'Endpoint & workload',icon:'▣',desc:'Reduce the chance that a device or workload becomes a foothold, and detect suspicious execution when preventive controls fail.',good:['Use hardened baselines, minimal images and controlled software.','Collect process and workload signals; investigate detections.','Isolate a compromised host without losing investigation evidence.'],tools:['EDR','Workload protection','Application allowlisting','Device management'],risk:'An unmonitored workload can execute malicious code and retain a foothold for longer.',env:{onprem:['Managed device','Execution policy','Endpoint sensor','Isolation workflow'],cloud:['Signed workload image','Admission policy','Runtime sensor','Quarantine workload'],hybrid:['Endpoint / workload','Common baseline','Cross-estate detection','Isolate affected zone']},labels:['Verify baseline','Observe execution','Contain on detection'],event:'Endpoint / runtime signal'},
{title:'Secrets & key management',short:'Secrets & keys',icon:'⚿',desc:'Keep credentials and cryptographic keys out of source code and images. Let approved identities obtain only the secret or operation they require.',good:['Use short-lived credentials and rotate long-lived secrets.','Restrict secret access to the workload and environment.','Audit retrieval and separate key custodians from data operators.'],tools:['Secrets vault','Key management','Hardware key protection','Rotation automation'],risk:'A hard-coded credential can outlive the workload and expose unrelated systems.',env:{onprem:['Application identity','Secrets vault policy','Audited retrieval','Target service'],cloud:['Workload identity','Secrets / key policy','Short-lived credential','Private service'],hybrid:['Federated workload','Destination vault policy','Scoped secret lease','Target estate service']},labels:['Authenticate workload','Issue scoped lease','Use credential'],event:'Secret retrieval / key operation'},
{title:'Monitoring & response',short:'Monitoring & response',icon:'⌁',desc:'Collect useful signals across the estate, correlate them and route actionable incidents to an owner. Monitoring detects and informs; response contains the event.',good:['Centralise identity, network, application and data audit signals.','Protect log integrity, synchronise clocks and control retention.','Test detections, escalation routes and containment runbooks.'],tools:['Log pipeline','SIEM','Detection rules','Response orchestration'],risk:'Logs without ownership and response playbooks may never turn into effective containment.',env:{onprem:['Network / host / app logs','Protected log collector','Correlation + triage','Response team'],cloud:['Audit / runtime events','Central log account','Detection + investigation','Containment workflow'],hybrid:['Both estates’ signals','Normalised log pipeline','Cross-estate correlation','Coordinated response']},labels:['Collect securely','Correlate + alert','Investigate + contain'],event:'Incident evidence store'},
{title:'Patching & exposure',short:'Patching & exposure',icon:'⊞',desc:'Find exposed assets and vulnerable dependencies, prioritise them by risk and verify that remediation actually closes the exposure.',good:['Maintain an owned inventory of hosts, services and dependencies.','Prioritise exposed and exploitable weaknesses; test changes.','Re-scan after remediation and track time-limited exceptions.'],tools:['Asset inventory','Vulnerability scanning','Patch orchestration','Dependency scanning'],risk:'An installed patch is not proof of remediation until the affected service and exposure are rechecked.',env:{onprem:['Asset inventory','Authenticated scanner','Tested patch rollout','Verification scan'],cloud:['Resource / image inventory','Config + dependency scan','Rebuild / redeploy','Exposure verification'],hybrid:['Unified asset inventory','Cross-estate assessment','Coordinated remediation','Both estates verified']},labels:['Discover exposure','Prioritise + remediate','Verify closure'],event:'Remediation evidence'},
{title:'Recovery & resilience',short:'Recovery & resilience',icon:'↺',desc:'Prepare to restore trusted services after a destructive event. Design backup isolation and restoration around business recovery objectives.',good:['Set recovery point and recovery time objectives with owners.','Keep isolated or immutable copies under separate credentials.','Test clean restores, dependencies and integrity regularly.'],tools:['Immutable backup','Recovery orchestration','Replication','Restore testing'],risk:'Replication can copy corruption. A backup is only useful when it can be restored safely.',env:{onprem:['Production data','Isolated backup gateway','Immutable / offline copy','Clean restore zone'],cloud:['Production service','Separate backup identity','Isolated backup store','Recovery environment'],hybrid:['Critical data + dependencies','Cross-estate backup policy','Isolated recovery copy','Tested recovery estate']},labels:['Protected backup','Isolated retention','Restore + verify'],event:'Restore test evidence'},
{title:'Foundations & governance',short:'Foundations & governance',icon:'◇',desc:'Make the controls sustainable through ownership, secure change, physical protection and supplier assurance. Technical layers depend on accountable operations.',good:['Assign service, data and control owners; review the threat model.','Protect facilities and hardware; verify provider responsibilities.','Assess supplier access and record secure change decisions.'],tools:['Asset ownership register','Change control','Physical access','Assurance evidence'],risk:'Unowned controls and unclear provider responsibilities create gaps between the technical layers.',env:{onprem:['Facility / asset owner','Physical access control','Approved configuration','Assurance review'],cloud:['Service / data owner','Shared-responsibility map','Policy as code','Assurance review'],hybrid:['Cross-estate owner','Responsibility + trust map','Coordinated change','End-to-end assurance']},labels:['Assign ownership','Enforce change','Review evidence'],event:'Control assurance record'}
];
const environments={
cloud:{label:'Cloud',title:'Cloud, with intent.',desc:'A public entry point, private workloads and data, with identity and policy at every service boundary.',good:['Private workload and data tiers; controlled egress.','Short-lived identities and explicit service permissions.','Separate administration, audit and recovery boundaries.'],tools:['Private networking','Workload identity','Policy as code','Central audit'],note:'Shared responsibility: the provider protects underlying services; your data, identities and configuration still need clear owners.',zones:['PUBLIC EDGE','PRIVATE WORKLOAD ZONE','PROTECTED DATA ZONE'],nodes:['User device','Edge gateway','Private workload','Private database','Identity + MFA','Admin broker','Security operations','Isolated backups']},
onprem:{label:'On-premises',title:'Your estate. Clear boundaries.',desc:'A controlled DMZ, segmented application and data networks, plus dedicated administration and physical protection.',good:['Separate DMZ, application and data VLANs with explicit policy.','Dedicated management network and privileged access broker.','Redundant facilities, controlled hardware access and isolated backups.'],tools:['Firewall','Network access control','Privileged access','Physical security'],note:'Owning the hardware also means owning its physical security, capacity, availability and lifecycle.',zones:['DMZ / EDGE','APPLICATION VLAN','DATA VLAN'],nodes:['User device','DMZ gateway','Application server','Database server','Identity + MFA','Admin broker','Security operations','Offline / immutable backup']},
hybrid:{label:'Hybrid',title:'Connected. Never implicitly trusted.',desc:'A deliberately scoped connection between estates, with destination-side checks and a common view of security events.',good:['Constrain cross-estate routes and encrypt the connection.','Federate identity; authorise again at the destination.','Correlate logs and test recovery across both estates.'],tools:['Encrypted interconnect','Federated identity','Route policy','Unified telemetry'],note:'A private connection provides reachability. It does not establish trust or grant permission to a resource.',zones:['ON-PREMISES','CLOUD WORKLOAD ZONE','CLOUD DATA ZONE'],nodes:['Site user / device','Encrypted interconnect','Cloud application','Cloud data service','Federated identity','Admin broker','Unified security ops','Isolated recovery copy']}
};
// Overview components, in the order the diagram uses them. sub is the line
// under the name; tools and risk feed the inspector when one is selected.
const overviewNodes=[
  {sub:'Untrusted input',title:'Request origin',text:'Treat the originating device and its inputs as untrusted until the required checks succeed.',good:['Verify device posture where relevant.','Send only the data needed for the operation.'],tools:['Device management','Device posture'],risk:'An unmanaged or compromised device can start the journey. Identity checks have to make up the difference.'},
  {sub:'Filter + rate limit',title:'Enforcement boundary',text:'Apply the control here and record its decision. A failure here should never quietly grant wider access further in.',good:['Enforce explicit policy with secure defaults.','Log denied decisions as well as allowed ones.','Rate limit before the request reaches a workload.'],tools:['WAF','API gateway','DDoS protection'],risk:'The workload is exposed directly, so every remaining check has to hold on its own.'},
  {sub:'Validate + authorise',title:'Workload boundary',text:'The application must validate inputs and enforce resource-level authorisation, even after an edge check.',good:['Validate every input and authorise each operation.','Use a scoped service identity for downstream calls.'],tools:['Schema validation','Service identity','Runtime protection'],risk:'Input and authorisation checks disappear at the point where data is actually used.'},
  {sub:'Encrypted at rest',title:'Protected destination',text:'Limit the data or service operation to what the authenticated principal needs.',good:['Keep the resource off the public network.','Protect stored data and separate key privileges.'],tools:['Storage encryption','Key management','Private endpoints'],risk:'Any compromise upstream reaches the data with nothing left in the way.'},
  {sub:'Verify user + device',title:'Identity plane',text:'Validate the user or workload, device context and session before access is granted.',good:['Prefer phishing-resistant MFA for human access.','Use scoped, short-lived tokens for workloads.'],tools:['Identity provider','MFA','Conditional access'],risk:'A password alone, or no identity at all, is enough to reach the workload.'},
  {sub:'Separate admin path',title:'Administration plane',text:'Privileged operations need a separate, controlled route.',good:['Use just-in-time privileges and dedicated admin identities.','Record sessions and restrict management interfaces.'],tools:['Privileged access','Just-in-time elevation','Session recording'],risk:'Administration shares a path with ordinary traffic, so a stolen admin credential goes much further.'},
  {sub:'Audit + identity events',title:'Evidence plane',text:'Collect useful signals in a protected destination with an accountable owner.',good:['Control retention and preserve integrity.','Test detection, triage and response regularly.'],tools:['SIEM','Log pipeline','Response playbooks'],risk:'Attacks still happen, but nobody sees them in time to contain them.',tele:true},
  {sub:'Separate identity',title:'Recovery plane',text:'Keep recoverable copies independent of production credentials.',good:['Isolate backups and validate restoration.','Test business recovery objectives with their dependencies.'],tools:['Immutable backup','Separate backup identity','Restore testing'],risk:'Ransomware or a bad change can take the only copies with it.'}
];

// Each journey lists the components it passes through. off holds the outcome
// when one of those components is switched off. The previous build had one
// gap (the edge) and appended unrelated journey text to control traces, which
// produced contradictions such as an MFA trace ending in a ransomware story.
const scenarios={
  normal:{name:'Authorised request',path:[0,1,4,2,3],good:'Identity and policy checks succeed. The application validates the request and reads only the data it is permitted to.',off:{
    0:'Device posture is not checked, so an unmanaged device can make the request. Identity, application and data checks still apply.',
    1:'Without the edge gateway the workload is exposed directly. Identity, validation and data checks still apply, but the attack surface is larger.',
    4:'Without identity checks the request reaches the workload unauthenticated. The application must refuse it, or the data is open to anyone.',
    2:'The workload skips validation and authorisation, so an authenticated user can reach data outside their scope.',
    3:'With the data store unprotected, any compromise of the workload or its credentials exposes the data directly.'}},
  identity:{name:'Stolen password',path:[0,1,4],good:'Phishing-resistant MFA rejects the password on its own. Session theft and account recovery still need their own defences.',off:{
    0:'An unmanaged device can attempt the sign-in. MFA still rejects the password on its own.',
    1:'Removing the edge does not bypass MFA. Identity checks still reject the password-only sign-in.',
    4:'With MFA switched off, the stolen password is enough to open a session. Access control and monitoring now carry the whole load.'}},
  injection:{name:'Malicious input',path:[0,1,2,6],good:'The edge passes the request, then application validation rejects the malformed input and records an event. Parameterised queries would have stopped it a second time.',off:{
    0:'The source is untrusted by definition, so nothing changes. Validation still rejects the input.',
    1:'Without edge filtering the malformed input reaches the application. Validation still rejects it; a firewall was never the only defence.',
    2:'Without application validation the input reaches the query. Parameterised queries and least-privilege data access are what remain.',
    6:'The input is still rejected, but nobody sees the attempt, so repeated probing goes unnoticed.'}},
  ransomware:{name:'Ransomware event',path:[2,6,7],good:'A compromised workload triggers investigation and containment. Recovery uses an isolated copy, restored and verified in a clean environment.',off:{
    2:'With no workload hardening the foothold is easier to gain and keep. Detection and isolated backups now decide the outcome.',
    6:'Without security operations, encryption runs until someone notices. Recovery from the isolated copy still works, but the damage is wider.',
    7:'Without isolated backups, recovery depends on copies the attacker may already have encrypted. Detection and containment are all that limit the damage.'}}
};

const roles=['SOURCE','POLICY','ENFORCEMENT','DESTINATION'];
const groups=[[0,'PREVENT'],[8,'DETECT & RESPOND'],[10,'RECOVER & GOVERN']];
const tick='<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5 L6.5 12 L13 4.5"/></svg>';
const arrowSvg='<svg width="28" height="10" viewBox="0 0 28 10" class="arrow" aria-hidden="true"><path d="M1 5 H24"/><path d="M20 1 L25 5 L20 9"/></svg>';

let state={env:'cloud',control:-1,node:null,gap:-1};
let timer=null;
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const narrow=matchMedia('(max-width:1320px)');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');

// Layer list, grouped so Monitoring and Recovery no longer sit under "Prevent".
$('controls').innerHTML=controls.map((c,i)=>{
  const g=groups.find(x=>x[0]===i);
  return (g?`<div class="layer-group" aria-hidden="true">${esc(g[1])}</div>`:'')+`<button type="button" class="layer-btn" data-control="${i}" aria-pressed="false"><span class="num">${pad(i+1)}</span>${esc(c.short)}</button>`;
}).join('');

function nodeName(i){
  const c=controls[state.control];
  if(c)return i<4?c.env[state.env][i]:'Protected audit store';
  return environments[state.env].nodes[i];
}

function nodeButton(i){
  const n=overviewNodes[i],off=state.gap===i,sel=state.node===i;
  return `<button type="button" class="node${n.tele?' tele':''}${off?' off':''}" data-node="${i}" aria-pressed="${sel}"><span class="node-name">${esc(environments[state.env].nodes[i])}</span><span class="node-sub">${off?'Switched off':esc(n.sub)}</span></button>`;
}

function overviewHTML(){
  const e=environments[state.env];
  const hop2=state.env==='hybrid'?'TLS + policy':'Re-encrypted';
  return `<div class="arch">
<div class="arch-row">
<div class="zone zone-plain"><span class="zone-label">UNTRUSTED</span>${nodeButton(0)}</div>
<div class="zone"><span class="zone-label">${esc(e.zones[0])}</span>${nodeButton(1)}</div>
<div class="zone"><span class="zone-label">${esc(e.zones[1])}</span>${nodeButton(2)}</div>
<div class="zone"><span class="zone-label">${esc(e.zones[2])}</span>${nodeButton(3)}</div>
</div>
<ul class="hops" aria-label="Hops on the data path">
<li>Device ${arrowSvg} edge: TLS 443</li>
<li>Edge ${arrowSvg} workload: ${esc(hop2)}</li>
<li>Workload ${arrowSvg} data: scoped query</li>
</ul>
<div><span class="zone-label planes-title">SUPPORTING PLANES</span>
<div class="planes">${[4,5,6,7].map(nodeButton).join('')}</div></div>
</div>`;
}

function stepHTML(i){
  const c=controls[state.control],off=state.gap===i,sel=state.node===i;
  const meta=i<4?`${pad(i+1)} · ${roles[i]}`:'EVIDENCE';
  const via=i>0&&i<4?`<span class="step-via">Hop: ${esc(c.labels[i-1])}</span>`:'';
  return `<div class="step${off?' off':''}${sel?' selected':''}" data-step="${i}">
<button type="button" class="step-main" data-node="${i}" aria-pressed="${sel}"><span class="step-meta">${off?'SWITCHED OFF':esc(meta)}</span><span class="step-name">${esc(nodeName(i))}</span>${via}</button>
<button type="button" class="switch" data-gap="${i}" aria-pressed="${off}" aria-label="${off?'Switch back on':'Switch off'}: ${esc(nodeName(i))}">${off?'Switch back on':'Switch off'}</button>
</div>`;
}

function controlHTML(){
  const c=controls[state.control];
  return `<div class="flow-box">
<div class="flow-row">${[0,1,2,3].map(i=>(i?`<div class="step-arrow">${arrowSvg}</div>`:'')+stepHTML(i)).join('')}</div>
<div class="evidence-row"><svg width="56" height="10" viewBox="0 0 56 10" aria-hidden="true"><path class="tele-line" d="M0 5 H52"/></svg><span class="tele-label">${esc(c.event)}</span>${stepHTML(4)}</div>
</div>`;
}

function setDetails(o){
  $('detailTitle').textContent=o.title;
  $('detailText').textContent=o.text;
  $('goodList').innerHTML=o.good.map(s=>`<li>${tick}<span>${esc(s)}</span></li>`).join('');
  $('toolTags').innerHTML=o.tools.map(s=>`<span>${esc(s)}</span>`).join('');
  $('calloutLabel').textContent=o.risk?'IF THIS FAILS':'WORTH KNOWING';
  $('calloutBox').classList.toggle('risk',!!o.risk);
  $('callout').textContent=o.note;
  const gb=$('nodeGap');
  gb.hidden=!o.gapButton;
  if(o.gapButton){const off=state.gap===state.node;gb.setAttribute('aria-pressed',String(off));gb.textContent=off?'Switch this component back on':'Switch this component off';}
}

function details(){
  const e=environments[state.env],c=controls[state.control],i=state.node;
  if(!c&&i===null)return setDetails({title:e.title,text:e.desc,good:e.good,tools:e.tools,note:e.note});
  if(!c){const n=overviewNodes[i];return setDetails({title:e.nodes[i],text:n.text,good:n.good,tools:n.tools,note:n.risk,risk:true,gapButton:true});}
  if(i===null)return setDetails({title:c.title,text:c.desc,good:c.good,tools:c.tools,note:c.risk,risk:true});
  if(i===4){const n=overviewNodes[6];return setDetails({title:'Protected audit store',text:n.text,good:n.good,tools:n.tools,note:'Without retained evidence nobody can prove this control worked, or investigate when it did not.',risk:true});}
  setDetails({title:c.env[state.env][i],text:`Step ${i+1} of 4 in the ${c.title.toLowerCase()} flow, ${e.label.toLowerCase()} environment. ${c.desc}`,good:c.good,tools:c.tools,note:c.risk,risk:true});
}

function setResult(kind,label,text){
  const r=$('traceResult');
  r.classList.toggle('done',kind==='done');r.classList.toggle('warn',kind==='warn');
  $('resultLabel').textContent=label;$('resultText').textContent=text;
}

function idleResult(){
  if(state.gap>=0)setResult('warn',`${nodeName(state.gap).toUpperCase()} SWITCHED OFF`,'Trace the flow to see what still holds.');
  else setResult('','READY',state.control>=0?'Trace this layer’s own flow, or switch a step off first.':'Choose a journey and trace how the layers respond.');
}

function cancelTrace(){clearTimeout(timer);timer=null;$('play').disabled=false;$('play').textContent='Trace flow';}

function render(){
  cancelTrace();
  const e=environments[state.env],c=controls[state.control];
  document.querySelectorAll('[data-env]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.env===state.env)));
  document.querySelectorAll('[data-control]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.control)===state.control)));
  $('overview').setAttribute('aria-pressed',String(!c));
  $('contextLabel').textContent=e.label.toUpperCase()+' / '+(c?'CONTROL DEEP DIVE':'REFERENCE ARCHITECTURE');
  $('canvasTitle').textContent=c?c.title:'A connected system of defence';
  $('canvasTag').textContent=c?`Layer ${pad(state.control+1)} of 12`:'12 layers working together';
  $('flowHint').textContent=c?'Select a step to inspect it, or switch it off to see what still holds.':'Select a component to inspect it or switch it off.';
  $('scenarioWrap').hidden=!!c;
  $('diagram').innerHTML=c?controlHTML():overviewHTML();
  details();idleResult();
}

function select(i){
  state.node=state.node===i?null:i;
  render();
  // On narrower screens the notes sit below the diagram, so a tap used to
  // change text two screens away with no visible effect.
  if(state.node!==null&&narrow.matches){$('inspector').scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});$('inspector').focus({preventScroll:true});}
}
function toggleGap(i){state.gap=state.gap===i?-1:i;render();}

$('diagram').addEventListener('click',ev=>{
  const g=ev.target.closest('[data-gap]');
  if(g){toggleGap(Number(g.dataset.gap));const again=$('diagram').querySelector(`[data-gap="${g.dataset.gap}"]`);if(again)again.focus();return;}
  const n=ev.target.closest('[data-node]');
  if(n){select(Number(n.dataset.node));const again=$('diagram').querySelector(`[data-node="${n.dataset.node}"]`);if(again&&!narrow.matches)again.focus();}
});
$('nodeGap').addEventListener('click',()=>{if(state.node!==null)toggleGap(state.node);});
document.querySelectorAll('[data-env]').forEach(b=>b.addEventListener('click',()=>{state.env=b.dataset.env;state.node=null;state.gap=-1;render();}));
document.querySelectorAll('[data-control]').forEach(b=>b.addEventListener('click',()=>{state.control=Number(b.dataset.control);state.node=null;state.gap=-1;render();}));
$('overview').addEventListener('click',()=>{state.control=-1;state.node=null;state.gap=-1;render();});
$('reset').addEventListener('click',()=>{state={env:'cloud',control:-1,node:null,gap:-1};$('scenario').value='normal';render();});
$('scenario').addEventListener('change',()=>{cancelTrace();clearLit();idleResult();});
document.querySelectorAll('[data-switch]').forEach(b=>b.addEventListener('click',()=>{state.env=b.dataset.switch;state.control=-1;state.node=null;state.gap=-1;render();$('explorer').scrollIntoView({behavior:reduced.matches?'auto':'smooth'});}));

function clearLit(){document.querySelectorAll('#diagram .lit').forEach(el=>el.classList.remove('lit'));}
function light(i){
  clearLit();
  const el=state.control>=0?$('diagram').querySelector(`[data-step="${i}"]`):$('diagram').querySelector(`.node[data-node="${i}"]`);
  if(el)el.classList.add('lit');
}

function outcome(){
  const c=controls[state.control],g=state.gap;
  if(!c){
    const s=scenarios[$('scenario').value];
    if(g<0)return['done',`TRACE COMPLETE · ${s.path.length} STEPS`,s.good];
    const t=s.off[g];
    return['warn',`${nodeName(g).toUpperCase()} SWITCHED OFF`,t||`${nodeName(g)} is not on this journey’s path, so the outcome does not change. ${s.good}`];
  }
  const n=c.env[state.env];
  if(g<0)return['done','TRACE COMPLETE · 5 STEPS',`Every step held. ${c.good[0]} Evidence of each ${c.event.toLowerCase()} goes to the protected audit store.`];
  const t=[
    `${n[0]} is trusted on arrival without the checks this layer expects at the source. ${c.risk}`,
    `${n[1]} is switched off, so nothing applies this layer’s policy. ${c.risk}`,
    `The decision is made, but ${n[2].toLowerCase()} does not enforce it. ${c.risk}`,
    `${n[3]} accepts whatever arrives without its own check. ${c.risk}`,
    `Every step still works, but no ${c.event.toLowerCase()} is kept. Nobody can prove the control worked, or investigate when it did not.`
  ][g];
  return['warn',`${nodeName(g).toUpperCase()} SWITCHED OFF`,t];
}

$('play').addEventListener('click',()=>{
  cancelTrace();
  const c=controls[state.control];
  const path=c?[0,1,2,3,4]:scenarios[$('scenario').value].path;
  const label=c?c.title:scenarios[$('scenario').value].name;
  $('play').disabled=true;$('play').textContent='Tracing…';
  const step=reduced.matches?250:650;
  let i=0;
  const tickFn=()=>{
    light(path[i]);
    setResult('',`STEP ${i+1} OF ${path.length}`,`${label}: ${nodeName(path[i])}${state.gap===path[i]?' (switched off)':''}`);
    i++;
    if(i<path.length){timer=setTimeout(tickFn,step);return;}
    timer=setTimeout(()=>{cancelTrace();clearLit();setResult(...outcome());},step);
  };
  tickFn();
});

$('download').addEventListener('click',()=>{
  const e=environments[state.env];
  const lines=['DEPTH: '+e.label+' design review checklist','Learning reference. Check every item against your own system and threat model.','',e.desc,...e.good.map(s=>'[ ] '+s),'',
    ...controls.flatMap((c,i)=>[`${i+1}. ${c.title}`,`Flow: ${c.env[state.env].join(' > ')}`,...c.good.map(s=>'[ ] '+s),'Tooling: '+c.tools.join(', '),'If it fails: '+c.risk,'']),
    'References:','https://www.nist.gov/publications/zero-trust-architecture','https://www.ncsc.gov.uk/collection/cloud/the-cloud-security-principles'];
  // charset matters: the content has curly apostrophes, and without it some
  // text viewers guess a legacy encoding and show garbage characters.
  const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=`depth-${state.env}-checklist.txt`;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});

render();
