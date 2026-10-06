const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const defaults={opelSpeed:'40',bmwSpeed:'18',initialGap:'20.5',turn:'90',reaction:'0.7',decel:'6.5',bmwObservedMove:'0.3',timeline:'0',bmwProfile:'i3_94',zafiraProfile:'zafira_a',bmwLoad:'75',opelLoad:'75'};
const elements={};
function element(id){return elements[id]||(elements[id]={id,value:defaults[id]||'',checked:false,textContent:'',className:'',style:{},listeners:{},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)},dispatchEvent(event){for(const fn of this.listeners[event.type]||[])fn(event)},querySelector(){return element(id+'-span')}})}
const context=new Proxy({canvas:{},createLinearGradient(){return{addColorStop(){}}}},{get:(o,k)=>k in o?o[k]:(...args)=>{},set:(o,k,v)=>(o[k]=v,true)});
const canvas=element('scene');canvas.getContext=()=>context;
element('observedFinal').checked=true;
global.document={querySelector(sel){return sel==='#scene'?canvas:element(sel.replace('#',''))}};
global.requestAnimationFrame=()=>{};
const api=new Function('require',script+';return {draw,controls,findCollision,prePositions,postPositions,scenarioAt,overlaps,bmwDoorSillPoint,zafiraLeftFrontPoint};')(require);
if(elements.hitResult.textContent!=='Ütközés'&&elements.hitResult.textContent!=='Elkerülve')throw new Error('Outcome was not calculated');
const baseline=[elements.hitResult.textContent,elements.impactSpeed.textContent,elements.pushResult.textContent];
if(!elements.speedAdvice.textContent.includes('km/h'))throw new Error('Speed-only avoidance result missing');
if(!elements.steeringAdvice.textContent.includes('elkerülhető'))throw new Error('Straight-steering counterfactual missing');
const start=api.prePositions(0).opel;api.controls.opel.value='30';const slow=api.prePositions(1).opel;api.controls.opel.value='60';const fast=api.prePositions(1).opel;if(Math.hypot(fast.x-start.x,fast.y-start.y)<=Math.hypot(slow.x-start.x,slow.y-start.y))throw new Error('Speed slider does not change vehicle motion');api.controls.opel.value='40';
api.controls.initialGap.value='40';const farStart=api.prePositions(0).opel;if(farStart.y-start.y<350)throw new Error('Initial distance slider does not change Zafira start position');api.controls.initialGap.value='20.5';
const eventStart=Date.now();api.controls.initialGap.value='30';api.controls.initialGap.dispatchEvent({type:'input'});if(Date.now()-eventStart>120)throw new Error('Initial distance slider input blocks the UI');if(elements.initialGapVal.textContent!=='30,0 m')throw new Error('Initial distance slider label did not update');api.controls.initialGap.value='20.5';
api.controls.view.value='3d';api.draw();if(elements.hitResult.textContent!==baseline[0]||elements.impactSpeed.textContent!==baseline[1]||elements.pushResult.textContent!==baseline[2])throw new Error('View change altered simulation result');api.controls.view.value='top';
const hit=api.findCollision(),door=api.bmwDoorSillPoint(hit.state.bmw),corner=api.zafiraLeftFrontPoint(hit.state.opel);if(Math.hypot(door.x-corner.x,door.y-corner.y)>18)throw new Error('Wrong impact corner geometry');
const opelHeading={x:Math.sin(hit.state.opel.a),y:-Math.cos(hit.state.opel.a)},bmwHeading={x:Math.sin(hit.state.bmw.a),y:-Math.cos(hit.state.bmw.a)};if(opelHeading.x*bmwHeading.x+opelHeading.y*bmwHeading.y>=0)throw new Error('Vehicles are not approaching from opposite directions');let priorDistance=0,priorRotation=0;
for(let dt=0;dt<=2;dt+=.1){const p=api.postPositions(hit.time+dt,hit),d=Math.hypot(p.bmw.x-hit.state.bmw.x,p.bmw.y-hit.state.bmw.y),r=Math.abs(p.bmw.a-hit.state.bmw.a);if(d+.001<priorDistance||r+.001<priorRotation)throw new Error('BMW post-impact motion reversed');priorDistance=d;priorRotation=r}
api.controls.braking.checked=true;api.draw();
if(elements.hitResult.textContent!=='Elkerülve')throw new Error('Braking scenario should avoid collision with defaults');
api.controls.braking.checked=false;api.controls.opel.value='53';api.controls.bmw.value='22';const hit5322=api.findCollision();if(!hit5322)throw new Error('53/22 km/h scenario should collide');if(Math.abs(hit5322.impactSpeed-53/3.6)>.01)throw new Error('53 km/h was not preserved as physical impact speed');
api.controls.opel.value='40';api.controls.bmw.value='18';for(const gap of [5,10,15,20.5,25,30,40,60,80]){api.controls.initialGap.value=String(gap);const variableHit=api.findCollision();if(variableHit){const after=api.scenarioAt(variableHit.time+.05,variableHit);if(api.overlaps(after.bmw,after.opel))throw new Error('Vehicles overlap after collision at initial gap '+gap+' m')}}api.controls.initialGap.value='20.5';
console.log('Runtime smoke test OK: baseline',...baseline,'; braking',elements.hitResult.textContent,elements.impactSpeed.textContent,elements.pushResult.textContent);
