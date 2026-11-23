/* Phase 45: Recipe import OCR and PDF extraction.
   Processing logic is moved from the main app without changing recognition rules. */
(function(global){
'use strict';
let activeStatus=null;
function setStatus(value){if(activeStatus)activeStatus.textContent=value==null?'':String(value)}
async function loadTesseract(){if(window.Tesseract)return;await new Promise((res,rej)=>{let sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';sc.onload=res;sc.onerror=()=>rej(Error('OCR could not load. Check your internet connection and try again.'));document.head.append(sc)});if(!window.Tesseract)throw Error('OCR did not start correctly. Please try again.')}
async function prepareOcrImage(source){
 let bitmap;
 try{bitmap=await createImageBitmap(source)}catch(e){return source}
 const maxSide=2600,scale=Math.min(2.5,maxSide/Math.max(bitmap.width,bitmap.height));
 const w=Math.max(1,Math.round(bitmap.width*scale)),h=Math.max(1,Math.round(bitmap.height*scale));
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(bitmap,0,0,w,h);bitmap.close?.();
 const frame=ctx.getImageData(0,0,w,h),d=frame.data;
 // Grayscale and gently increase contrast while preserving thin printed strokes.
 for(let i=0;i<d.length;i+=4){let y=.299*d[i]+.587*d[i+1]+.114*d[i+2];y=Math.max(0,Math.min(255,(y-128)*1.28+128));d[i]=d[i+1]=d[i+2]=y;}
 ctx.putImageData(frame,0,0);return canvas;
}
async function recognizeImage(source,label='Reading recipe photo'){
 await loadTesseract();
 setStatus('Preparing photo for clearer text…');
 let worker;
 try{
  const scanSource=await prepareOcrImage(source);
  setStatus('Loading text recognition… please keep this screen open.');
  worker=await Tesseract.createWorker('eng',1,{
   logger:m=>{
    if(m.status==='loading tesseract core')setStatus('Preparing scanner…');
    else if(m.status==='loading language traineddata')setStatus('Loading English text data…');
    else if(m.status==='recognizing text')setStatus('Reading recipe: '+Math.round((m.progress||0)*100)+'%');
   },
   errorHandler:e=>console.error('Recipe OCR:',e)
  });
  await worker.setParameters({preserve_interword_spaces:'1'});
  // Full-page layout works better for printed recipe sheets; compare it with
  // sparse-text recognition and keep the pass with the strongest confidence.
  setStatus('Reading page layout…');
  await worker.setParameters({tessedit_pageseg_mode:Tesseract.PSM.AUTO});
  const pageResult=await worker.recognize(scanSource);
  setStatus('Checking ingredient lines…');
  await worker.setParameters({tessedit_pageseg_mode:Tesseract.PSM.SPARSE_TEXT});
  const sparseResult=await worker.recognize(scanSource);
  const candidates=[pageResult,sparseResult].map(r=>({
   text:(r&&r.data&&r.data.text||'').replace(/\\u0000/g,'').trim(),
   confidence:Number(r&&r.data&&r.data.confidence||0)
  })).filter(r=>r.text.replace(/\\s/g,'').length>=8);
  if(!candidates.length)throw Error('I could not read enough text in that picture. Try a brighter, sharper photo with the whole recipe in view.');
  candidates.sort((a,b)=>b.confidence-a.confidence);
  const best=candidates[0];
  if(best.confidence>0&&best.confidence<28)throw Error('The photo is too difficult to read clearly. Please retake it in good light, keep the page flat, and fill the frame with the recipe.');
  return best.text;
 }catch(e){
  if(e&&/fetch|network|failed to load|worker|wasm|traineddata/i.test(e.message||''))throw Error('The text scanner could not load. Check that your phone is online, then try again.');
  throw e;
 }finally{if(worker)await worker.terminate().catch(()=>{})}
}
async function pdfImageData(obj){
 try{
  const w=obj.width||obj.bitmap?.width,h=obj.height||obj.bitmap?.height;if(!w||!h||w<80||h<60||w*h>12000000)return '';
  const c=document.createElement('canvas'),scale=Math.min(1,850/Math.max(w,h));c.width=Math.max(1,Math.round(w*scale));c.height=Math.max(1,Math.round(h*scale));const x=c.getContext('2d',{alpha:false});if(!x)return '';
  if(obj.bitmap||(typeof ImageBitmap!=='undefined'&&obj instanceof ImageBitmap)||obj instanceof HTMLCanvasElement||obj instanceof HTMLImageElement){x.drawImage(obj.bitmap||obj,0,0,c.width,c.height)}
  else if(obj.data&&obj.data.length===w*h*4){const tmp=document.createElement('canvas');tmp.width=w;tmp.height=h;tmp.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(obj.data),w,h),0,0);x.drawImage(tmp,0,0,c.width,c.height);tmp.width=tmp.height=1}
  else if(obj.data&&obj.data.length===w*h*3){const rgba=new Uint8ClampedArray(w*h*4);for(let i=0,j=0;i<obj.data.length;i+=3,j+=4){rgba[j]=obj.data[i];rgba[j+1]=obj.data[i+1];rgba[j+2]=obj.data[i+2];rgba[j+3]=255}const tmp=document.createElement('canvas');tmp.width=w;tmp.height=h;tmp.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);x.drawImage(tmp,0,0,c.width,c.height);tmp.width=tmp.height=1}
  else return '';
  let data=c.toDataURL('image/jpeg',.72);if(data.length>420000)data=c.toDataURL('image/jpeg',.55);c.width=c.height=1;return data.length<=600000?data:'';
 }catch(e){return ''}
}
async function extractPdfImages(pdf){
 const found=[];
 for(let n=1;n<=pdf.numPages&&found.length<12;n++){
  const page=await pdf.getPage(n),ops=await page.getOperatorList(),seen=new Set();
  for(let i=0;i<ops.fnArray.length&&found.length<12;i++){
   if(ops.fnArray[i]!==pdfjsLib.OPS.paintImageXObject)continue;
   const name=ops.argsArray[i]?.[0];if(!name||seen.has(name))continue;seen.add(name);
   try{const obj=await new Promise(resolve=>page.objs.get(name,resolve));const data=await pdfImageData(obj);if(data&&!found.includes(data))found.push(data)}catch(e){}
  }
 }
 return found;
}
async function pdfText(file){
 let pendingPdfImages=[];
 if(!window.pdfjsLib){await new Promise((res,rej)=>{let s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=res;s.onerror=()=>rej(Error('PDF support could not load. Check internet, or paste the PDF text.'));document.head.append(s)});window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'}
 let pdf=await pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise,out=[];
 try{pendingPdfImages=await extractPdfImages(pdf)}catch(e){pendingPdfImages=[]}
 for(let n=1;n<=pdf.numPages;n++){
  let page=await pdf.getPage(n),content=await page.getTextContent();
  let items=content.items.filter(x=>x.str&&x.str.trim()).map(x=>({t:x.str.trim(),x:x.transform[4],y:x.transform[5]})).sort((a,b)=>b.y-a.y||a.x-b.x);
  // Assign each PDF text item to exactly one visual line.
  let groups=[];
  for(let item of items){let line=groups.find(g=>Math.abs(g.y-item.y)<=1.25);if(!line){line={y:item.y,items:[]};groups.push(line)}line.items.push(item)}
  let lines=groups.sort((a,b)=>b.y-a.y).map(g=>g.items.sort((a,b)=>a.x-b.x).map(i=>i.t).join(' ').replace(/\s+/g,' ').trim()).filter(Boolean);
  out.push(lines.join('\n'));
 }
 let extracted=out.join('\n\n').trim();
 if(extracted.replace(/\s/g,'').length>=30)return {text:extracted,images:pendingPdfImages};
 setStatus('Scanned PDF detected. Starting OCR…');let recognized=[];
 for(let n=1;n<=pdf.numPages;n++){let page=await pdf.getPage(n),viewport=page.getViewport({scale:1.7}),canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;recognized.push(await recognizeImage(canvas,'Reading scanned PDF page '+n+' of '+pdf.numPages));canvas.width=canvas.height=1}
 return {text:recognized.join('\n\n'),images:pendingPdfImages}
}

global.MRBRecipeImportOCR={
 recognizeImage:async function(source,label,statusElement){activeStatus=statusElement||null;return recognizeImage(source,label)},
 pdfText:async function(file,statusElement){activeStatus=statusElement||null;return pdfText(file)}
};
})(window);
