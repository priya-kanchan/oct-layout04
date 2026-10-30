const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{spawn}=require('node:child_process');
const root=__dirname;
const cssPath=path.join(root,'css/intlTelInput.min.css');
fs.writeFileSync(cssPath,fs.readFileSync(cssPath,'utf8').replace(/url\([^)]*\.(?:png|svg)[^)]*\)/g,'none'));
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{let relative=decodeURIComponent(req.url.split('?')[0]);if(relative==='/')relative='/index.html';const p=path.resolve(root,'.'+relative);if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(p,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});res.end(e?'Not found':b)})});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
await new Promise(r=>server.listen(4173,'127.0.0.1',r));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--disable-extensions','--no-first-run','--no-default-browser-check','--remote-debugging-port=9228','--user-data-dir='+path.join(root,'.qa-browser'),'about:blank'],{stdio:'ignore',windowsHide:true});
let ws;
try{
 let pages;for(let i=0;i<40;i++){try{pages=await(await fetch('http://127.0.0.1:9228/json')).json();if(pages.length)break}catch{}await delay(250)}
 ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
 let seq=0;let crmMode='ready';const pending=new Map(),errors=[],missing=[];
 ws.onmessage=e=>{const msg=JSON.parse(e.data);if(msg.id){pending.get(msg.id)?.(msg);pending.delete(msg.id)}if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails.text+' '+(msg.params.exceptionDetails.exception?.description||''));if(msg.method==='Network.responseReceived'&&msg.params.response.status>=400)missing.push(msg.params.response.url);if(msg.method==='Fetch.requestPaused'){const requestId=msg.params.requestId;if(crmMode==='fail'){cmd('Fetch.failRequest',{requestId,errorReason:'Failed'});return;}const fulfill=()=>cmd('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/javascript'}],body:Buffer.from('window.__gtfCalls=[];window.SubmitQueryData=function(agent,fields){window.__gtfCalls.push({agent:agent,fields:fields,country:document.getElementById(fields.SenderControlCountryCodeID).value})};').toString('base64')}).catch(err=>errors.push(String(err)));if(crmMode==='slow')setTimeout(fulfill,1000);else fulfill();}};
 const cmd=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,r=>r.error?reject(r.error):resolve(r.result));ws.send(JSON.stringify({id,method,params}))});
 const evaluate=async expression=>(await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
 await cmd('Runtime.enable');await cmd('Page.enable');await cmd('Network.enable');
 // Intercept the CRM script: verify mappings without downloading the service or sending leads.
 await cmd('Fetch.enable',{patterns:[{urlPattern:'https://api2.gtftech.com/*',requestStage:'Request'}]});
 const results=[];
 for(const width of [1440,1920,1024,768,390,360,320]){
 await cmd('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<700});
 await cmd('Page.navigate',{url:'http://127.0.0.1:4173/'});await delay(1300);
 for(let wait=0;wait<30;wait++){if(await evaluate(`document.querySelectorAll('.iti').length===2`))break;await delay(200);}
 results.push(await evaluate(`({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,sections:document.querySelectorAll('main>section').length,brokenImages:[...document.images].filter(i=>i.src&&!i.src.endsWith('/')&&i.getAttribute('src')&&i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src')),forms:document.forms.length,countryPickers:document.querySelectorAll('.iti').length})`));
 if(width===1440||width===390){const img=await cmd('Page.captureScreenshot',{format:'webp',quality:85});fs.writeFileSync(path.join(root,'preview-'+width+'.webp'),Buffer.from(img.data,'base64'));}
 }
 const bannerChecks=[];
 for(const [width,height] of [[1920,1080],[1536,864],[1440,900],[1366,768],[1280,620],[1024,768],[768,1024],[390,844],[375,667],[320,640],[844,390]]){
 await cmd('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<701});
 await evaluate(`scrollTo({top:0,behavior:'instant'})`);await delay(1100);
 bannerChecks.push(await evaluate(`(()=>{const hero=document.querySelector('#home').getBoundingClientRect();const copy=document.querySelector('.hero-content').getBoundingClientRect();const nav=document.querySelector('.sidebar nav');const actions=document.querySelector('.mobile-actions');const bar=getComputedStyle(actions).display!=='none'?actions.getBoundingClientRect().top:Infinity;const cta=document.querySelector('.hero-ctas').getBoundingClientRect();return {width:innerWidth,height:innerHeight,bannerHeight:Math.round(hero.height),overflow:document.documentElement.scrollWidth>innerWidth,copyInsideBanner:copy.top>=hero.top&&copy.bottom<=hero.bottom,actionsUncovered:hero.height>innerHeight||cta.bottom<=bar,ctaFont:getComputedStyle(document.querySelector('.hero-ctas .btn')).fontSize,navFont:getComputedStyle(document.querySelector('.sidebar nav a')).fontSize,bodyFont:getComputedStyle(document.querySelector('.hero-description')).fontSize,menuCanScroll:nav.scrollHeight>nav.clientHeight}})()`));
 if(width===1280||width===375){const shot=await cmd('Page.captureScreenshot',{format:'webp',quality:85});fs.writeFileSync(path.join(root,'preview-banner-'+width+'.webp'),Buffer.from(shot.data,'base64'));}
 if(width===375){const order=await evaluate(`(()=>{const image=document.querySelector('.hero-art').getBoundingClientRect();const copy=document.querySelector('.hero-content').getBoundingClientRect();const form=document.querySelector('#enquireBody').closest('.form-card').getBoundingClientRect();return {imageFirst:image.bottom<=copy.top,formAfterContent:copy.bottom<=form.top,uniqueNameID:document.querySelectorAll('#qSenderName').length,uniqueSubmitID:document.querySelectorAll('#SubmitQuery').length}})()`);bannerChecks.at(-1).mobileOrder=order;const heroHeight=await evaluate(`document.querySelector('#home').offsetHeight`);const shot=await cmd('Page.captureScreenshot',{format:'webp',quality:85,captureBeyondViewport:true,clip:{x:0,y:0,width,height:heroHeight,scale:1}});fs.writeFileSync(path.join(root,'preview-mobile-hero.webp'),Buffer.from(shot.data,'base64'));}
 }
 const sectionChecks=[];
 for(const width of [1440,390]){
 await cmd('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<700});
 for(const id of ['overview','price','highlights','amenities','floor-plans','site-tour','location','gallery','developer','faq','contact']){
 await evaluate(`document.getElementById('${id}').scrollIntoView({behavior:'instant'})`);await delay(120);
 sectionChecks.push(await evaluate(`({width:innerWidth,id:'${id}',overflow:document.documentElement.scrollWidth>innerWidth})`));
 if(width===1440&&['overview','price','gallery','contact'].includes(id)){await delay(1100);const shot=await cmd('Page.captureScreenshot',{format:'webp',quality:85});fs.writeFileSync(path.join(root,'preview-'+id+(id==='contact'?'-desktop':'')+'.webp'),Buffer.from(shot.data,'base64'));}
 }
 await delay(1100);
 if(width===390){const img=await cmd('Page.captureScreenshot',{format:'webp',quality:85});fs.writeFileSync(path.join(root,'preview-contact.webp'),Buffer.from(img.data,'base64'));}
 }
 const interactions={};
 await evaluate(`document.querySelector('#overview').scrollIntoView({behavior:'instant'})`);await delay(100);
 interactions.scrollAnimation=await evaluate(`document.querySelector('#overview .section-head').getAnimations().length>0`);
 await evaluate(`document.querySelector('#home').scrollIntoView({behavior:'instant'})`);await delay(100);
 await evaluate(`document.querySelector('#overview').scrollIntoView({behavior:'instant'})`);await delay(100);
 interactions.animationReplays=await evaluate(`document.querySelector('#overview .section-head').getAnimations().length>0`);
 await delay(1100);
 interactions.connector=await evaluate(`(()=>{const label=document.querySelector('#overview .section-label').getBoundingClientRect();const node=document.querySelector('.journey-node').getBoundingClientRect();return {nodes:document.querySelectorAll('.journey-node').length,alignmentError:Math.round(Math.abs((label.top+label.height/2)-(node.top+node.height/2))),progress:document.querySelector('.journey-fill').style.transform}})()`);
 interactions.menu=await evaluate(`document.querySelector('#menuToggle').click();document.querySelector('#sidebar').classList.contains('is-open')`);
 interactions.navigate=await evaluate(`document.querySelector('nav a[href="#price"]').click();({hash:location.hash,animated:document.querySelector('#price').classList.contains('section-arrive'),menuClosed:!document.querySelector('#sidebar').classList.contains('is-open')})`);
 interactions.modal=await evaluate(`document.querySelector('[data-popup]').click();({visible:!document.querySelector('#enquiryModal').hidden,focused:document.activeElement.className})`);
 interactions.form=await evaluate(`(()=>{const f=document.querySelector('#enquireBodypopup');f.querySelector('#qSenderNamepopup').value='';f.querySelector('#qEmailIDpopup').value='invalid-email';const phone=f.querySelector('#qMobileNopopup');phone.value='AB 12345678901234567890';phone.dispatchEvent(new Event('input'));f.querySelector('[type="checkbox"]').checked=false;document.querySelector('#SubmitQuerypopup').click();document.querySelector('#SubmitQuery').click();return {directCalls:window.__gtfCalls,requiredInputs:document.querySelectorAll('#enquireBody [required],#enquireBodypopup [required]').length,phoneTextPreserved:phone.value,phoneMaxLength:phone.maxLength,phonePattern:phone.pattern,containers:[document.querySelector('#enquireBody').tagName,document.querySelector('#enquireBodypopup').tagName]}})()`);
 await evaluate(`document.querySelector('#enquiryModal [data-close]').click();document.querySelector('.gallery-item').click()`);
 interactions.gallery=await evaluate(`!document.querySelector('#lightbox').hidden&&document.querySelector('#lbImg').src.endsWith('.webp')`);
 await evaluate(`document.querySelector('[data-lb="close"]').click();document.querySelector('#openPrivacy').click()`);
 interactions.privacy=await evaluate(`!document.querySelector('#privacyModal').hidden`);
 interactions.countryCode=await evaluate(`(()=>{const i=document.querySelector('#qMobileNopopup');window.intlTelInputGlobals.getInstance(i).setCountry('ae');document.querySelector('#SubmitQuerypopup').click();return window.__gtfCalls.at(-1).country})()`);
 await evaluate(`document.querySelector('#privacyModal [data-close]').click()`);
 await cmd('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await delay(100);
 await evaluate(`document.querySelector('nav a[href="#overview"]').click()`);await delay(100);
 interactions.reducedMotion=await evaluate(`document.querySelector('#overview .section-head').getAnimations().length===0`);
 await cmd('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await delay(150);
 interactions.spacing=await evaluate(`(()=>{const form=document.querySelector('#contact .form-card').getBoundingClientRect();const body=document.querySelector('#enquireBody').getBoundingClientRect();const quote=document.querySelector('#overview .quote-card').getBoundingClientRect();const copy=document.querySelector('#overview .overview-text').getBoundingClientRect();const label=document.querySelector('#overview .section-label').getBoundingClientRect();const branch=document.querySelector('.journey-link').getBoundingClientRect();return {contactBottomPadding:Math.round(form.bottom-body.bottom),overviewCopyGap:Math.round(copy.top-quote.bottom),heroHighlights:document.querySelectorAll('.hero-fact').length,residenceOptions:document.querySelectorAll('.signature-residence,.residence-option').length,headingLineError:Math.round(Math.abs(branch.right-label.left-26))}})()`);
 const modalChecks=[];
 for(const [width,height] of [[390,844],[375,667],[320,568],[844,390]]){
 await cmd('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<701});
 await evaluate(`scrollTo({top:700,behavior:'instant'});document.querySelector('[data-popup]').click();document.querySelector('#popupTitle').textContent='Unlock Price Breakdown – 4 BHK + Staff Grande'`);await delay(100);
 const check=await evaluate(`(()=>{const box=document.querySelector('#enquiryModal .modal-box');const r=box.getBoundingClientRect();const consent=box.querySelector('.checkbox-section').getBoundingClientRect();return {width:innerWidth,height:innerHeight,contentFits:box.scrollHeight<=box.clientHeight+1,boxInsideScreen:r.top>=0&&r.bottom<=innerHeight,consentVisible:consent.bottom<=r.bottom,pageLocked:document.documentElement.classList.contains('dialog-open')&&getComputedStyle(document.body).position==='fixed',overflow:getComputedStyle(box).overflowY}})()`);
 await cmd('Input.dispatchMouseEvent',{type:'mouseWheel',x:2,y:Math.round(height/2),deltaX:0,deltaY:300});await delay(80);
 check.backgroundStayedLocked=await evaluate(`scrollY===0&&document.body.getBoundingClientRect().top===-700`);
 if(width===390||width===320){const shot=await cmd('Page.captureScreenshot',{format:'webp',quality:85});fs.writeFileSync(path.join(root,'preview-modal-'+width+'.webp'),Buffer.from(shot.data,'base64'));}
 await evaluate(`document.querySelector('#enquiryModal .modal-close').click()`);
 check.restoresScroll=await evaluate(`scrollY===700&&!document.documentElement.classList.contains('dialog-open')`);
 modalChecks.push(check);
 }
 console.log(JSON.stringify({results,bannerChecks,sectionChecks,modalChecks,interactions,errors,missing},null,2));
 fs.writeFileSync(path.join(root,'qa-results.json'),JSON.stringify({results,bannerChecks,sectionChecks,modalChecks,interactions,errors,missing},null,2));
 await cmd('Browser.close');
}finally{ws?.close();chrome.kill();server.close()}
})().catch(err=>{console.error(err);process.exitCode=1;server.close()});
