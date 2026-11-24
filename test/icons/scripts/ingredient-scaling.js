/* My Recipe Book — Phase 42 ingredient amount and scaling helpers.
   Pure helpers extracted without changing their established behavior. */
(()=>{'use strict';
const fractionValues=[['⅛',1/8],['⅙',1/6],['⅕',1/5],['¼',1/4],['⅓',1/3],['⅜',3/8],['⅖',2/5],['½',1/2],['⅗',3/5],['⅝',5/8],['⅔',2/3],['¾',3/4],['⅘',4/5],['⅚',5/6],['⅞',7/8]];
const unicodeFractions={'⅛':1/8,'⅙':1/6,'⅕':1/5,'¼':1/4,'⅓':1/3,'⅜':3/8,'⅖':2/5,'½':1/2,'⅗':3/5,'⅝':5/8,'⅔':2/3,'¾':3/4,'⅘':4/5,'⅚':5/6,'⅞':7/8};
function amountNumber(raw){const x=String(raw||'').trim();if(!x)return null;if(unicodeFractions[x]!=null)return unicodeFractions[x];let m=x.match(/^(\d+)\s*([½⅓⅔¼¾⅛⅜⅝⅞⅙⅚⅕⅖⅗⅘])$/);if(m)return Number(m[1])+unicodeFractions[m[2]];if(/^\d+\s+\d+\/\d+$/.test(x)){let a=x.split(/\s+/);let f=a[1].split('/');return Number(a[0])+Number(f[0])/Number(f[1])}if(/^\d+\/\d+$/.test(x)){let a=x.split('/');return Number(a[0])/Number(a[1])}let n=Number(x);return Number.isFinite(n)?n:null}
function readLeadingAmount(line){const m=String(line??'').match(/^\s*(?:(?:[-*•▪‣]+)\s*)?((?:\d+\s+\d+\/\d+|\d+\s*[½⅓⅔¼¾⅛⅜⅝⅞⅙⅚⅕⅖⅗⅘]|\d+\/\d+|\d+(?:\.\d+)?|[½⅓⅔¼¾⅛⅜⅝⅞⅙⅚⅕⅖⅗⅘]))(?=\s|$)/);if(!m)return null;const raw=m[1],start=m.index+m[0].lastIndexOf(raw);return{raw,value:amountNumber(raw),start,end:start+raw.length}}
function formatAmount(n){if(!Number.isFinite(n)||n<0)return String(n);let whole=Math.floor(n+1e-8),frac=n-whole;if(frac<.0125)return String(whole);let best=fractionValues.reduce((a,b)=>Math.abs(b[1]-frac)<Math.abs(a[1]-frac)?b:a);if(Math.abs(best[1]-frac)<.025){if(whole===0)return best[0];return whole+' '+best[0]}return String(Math.round(n*100)/100).replace(/\.0$/,'')}
function scaleIngredientLine(line,factor){line=String(line??'');const a=readLeadingAmount(line);if(!a||a.value==null)return line;const value=formatAmount(a.value*factor);return line.slice(0,a.start)+value+line.slice(a.end)}
window.MRBIngredientScalingBridge={amountNumber,readLeadingAmount,formatAmount,scaleIngredientLine};
})();
