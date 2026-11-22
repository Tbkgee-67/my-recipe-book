// Phase 19: Baking countdown timer separated from the main app script.
// This timer is independent of recipe storage and app-private JavaScript helpers.
(function(){
 const $=id=>document.getElementById(id);
 const required=['timerDisplay','timerMinutes','timerSeconds','timerStatus','timerStartBtn','timerResetBtn','timerStopAlarmBtn'];
 if(required.some(id=>!$(id))) return;
 let timerRemaining=300,timerInterval=null,timerEndAt=0,timerAudioContext=null,timerAlarmInterval=null,timerAlarmNodes=[];
 function timerUnlockAudio(){try{const AC=window.AudioContext||window.webkitAudioContext;if(AC){if(!timerAudioContext)timerAudioContext=new AC();if(timerAudioContext.state==='suspended')timerAudioContext.resume()}}catch{}}
 function timerAlarmBeep(){try{timerUnlockAudio();if(!timerAudioContext)return;const ctx=timerAudioContext,osc=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;osc.type='square';osc.frequency.setValueAtTime(1450,now);gain.gain.setValueAtTime(0.0001,now);gain.gain.exponentialRampToValueAtTime(0.22,now+0.012);gain.gain.setValueAtTime(0.22,now+0.18);gain.gain.exponentialRampToValueAtTime(0.0001,now+0.24);osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+0.25);timerAlarmNodes.push(osc);osc.onended=()=>{timerAlarmNodes=timerAlarmNodes.filter(n=>n!==osc)}}catch{}}
 function timerStopAlarm(){if(timerAlarmInterval!==null){clearInterval(timerAlarmInterval);timerAlarmInterval=null}timerAlarmNodes.forEach(n=>{try{n.stop()}catch{}});timerAlarmNodes=[];try{if('vibrate'in navigator)navigator.vibrate(0)}catch{}}
 function timerAlarm(){timerStopAlarm();timerAlarmBeep();timerAlarmInterval=setInterval(timerAlarmBeep,380);$('timerStopAlarmBtn').textContent='■ Stop alarm';$('timerStatus').textContent='⏰ Time is up! Alarm sounding — tap Stop alarm to silence.'}
 function timerFormat(seconds){seconds=Math.max(0,Math.ceil(seconds));return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')}
 function timerDraw(){$('timerDisplay').textContent=timerFormat(timerRemaining)}
 function timerStop(){if(timerInterval!==null){clearInterval(timerInterval);timerInterval=null}}
 function timerSetFromInputs(){const m=Number($('timerMinutes').value),s=Number($('timerSeconds').value);if(!Number.isFinite(m)||!Number.isFinite(s)||m<0||s<0||s>59||!Number.isInteger(m)||!Number.isInteger(s)||m>999){$('timerStatus').textContent='Enter whole minutes (0–999) and seconds (0–59).';return false}const total=m*60+s;if(total<1){$('timerStatus').textContent='Set the timer for at least 1 second.';return false}timerRemaining=total;timerDraw();return true}
 function timerTick(){timerRemaining=Math.max(0,Math.ceil((timerEndAt-Date.now())/1000));timerDraw();if(timerRemaining<=0){timerStop();$('timerStartBtn').textContent='▶ Start';$('timerStatus').textContent='⏰ Time is up!';timerAlarm();try{if('vibrate'in navigator)navigator.vibrate([250,120,250,120,250])}catch{}}}
 $('timerStartBtn').onclick=()=>{timerUnlockAudio();if(timerInterval!==null){timerRemaining=Math.max(0,Math.ceil((timerEndAt-Date.now())/1000));timerStop();timerDraw();$('timerStartBtn').textContent='▶ Resume';$('timerStatus').textContent='Paused.';return}if(timerRemaining<=0||$('timerStatus').textContent==='Ready when you are.'||$('timerStatus').textContent.startsWith('Set the timer')){if(!timerSetFromInputs())return}timerEndAt=Date.now()+timerRemaining*1000;timerInterval=setInterval(timerTick,250);$('timerStartBtn').textContent='Ⅱ Pause';$('timerStatus').textContent='Timer running…';timerTick()};
 $('timerResetBtn').onclick=()=>{timerStop();timerStopAlarm();if(timerSetFromInputs()){$('timerStartBtn').textContent='▶ Start';$('timerStatus').textContent='Ready when you are.'}};
 $('timerStopAlarmBtn').onclick=()=>{timerStopAlarm();$('timerStatus').textContent=timerRemaining<=0?'Alarm stopped. Set a new timer when ready.':'Alarm stopped.'};
 $('timerMinutes').onchange=()=>{if(timerInterval===null){timerSetFromInputs();$('timerStatus').textContent='Ready when you are.';$('timerStartBtn').textContent='▶ Start'}};$('timerSeconds').onchange=$('timerMinutes').onchange;
 timerDraw();
})();
