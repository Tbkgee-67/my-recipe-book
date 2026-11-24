// Phase 19: Baking countdown timer — robust button binding and independent state.
(function(){
 'use strict';
 function init(){
  const $=id=>document.getElementById(id);
  const ids=['timerDisplay','timerMinutes','timerSeconds','timerStatus','timerStartBtn','timerResetBtn','timerStopAlarmBtn'];
  if(ids.some(id=>!$(id))) return;
  const minutes=$('timerMinutes'),seconds=$('timerSeconds'),display=$('timerDisplay'),status=$('timerStatus'),start=$('timerStartBtn'),reset=$('timerResetBtn'),stop=$('timerStopAlarmBtn');
  if(start.dataset.mrbTimerBound==='yes') return;
  start.dataset.mrbTimerBound='yes';
  let remaining=300,interval=null,endAt=0,audio=null,alarmInterval=null,alarmNodes=[];
  const draw=()=>{remaining=Math.max(0,Math.ceil(remaining));display.textContent=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0')};
  function stopAlarm(){if(alarmInterval!==null){clearInterval(alarmInterval);alarmInterval=null}alarmNodes.forEach(n=>{try{n.stop()}catch{}});alarmNodes=[];try{if('vibrate'in navigator)navigator.vibrate(0)}catch{}}
  function stopCountdown(){if(interval!==null){clearInterval(interval);interval=null}}
  function beep(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!audio)audio=new AC();if(audio.state==='suspended')audio.resume();const now=audio.currentTime,osc=audio.createOscillator(),gain=audio.createGain();osc.type='square';osc.frequency.setValueAtTime(1450,now);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.2,now+.012);gain.gain.setValueAtTime(.2,now+.18);gain.gain.exponentialRampToValueAtTime(.0001,now+.24);osc.connect(gain);gain.connect(audio.destination);osc.start(now);osc.stop(now+.25);alarmNodes.push(osc);osc.onended=()=>{alarmNodes=alarmNodes.filter(x=>x!==osc)}}catch{}}
  function readInputs(){const m=Number(minutes.value),s=Number(seconds.value);if(!Number.isInteger(m)||!Number.isInteger(s)||m<0||m>999||s<0||s>59){status.textContent='Enter whole minutes (0–999) and seconds (0–59).';return false}const total=m*60+s;if(total<1){status.textContent='Set the timer for at least 1 second.';return false}remaining=total;draw();return true}
  function tick(){if(interval===null)return;remaining=Math.max(0,Math.ceil((endAt-Date.now())/1000));draw();if(remaining===0){stopCountdown();start.textContent='▶ Start';status.textContent='⏰ Time is up! Alarm sounding — tap Stop alarm to silence.';beep();alarmInterval=setInterval(beep,450);try{if('vibrate'in navigator)navigator.vibrate([250,120,250,120,250])}catch{}}}
  start.onclick=()=>{if(interval!==null){remaining=Math.max(0,Math.ceil((endAt-Date.now())/1000));stopCountdown();draw();start.textContent='▶ Resume';status.textContent='Paused.';return}if(remaining<=0||status.textContent==='Ready when you are.'||status.textContent.startsWith('Set the timer')||status.textContent.startsWith('Enter whole')){if(!readInputs())return}stopAlarm();endAt=Date.now()+remaining*1000;interval=setInterval(tick,200);start.textContent='Ⅱ Pause';status.textContent='Timer running…';tick()};
  reset.onclick=()=>{stopCountdown();stopAlarm();if(readInputs()){start.textContent='▶ Start';status.textContent='Ready when you are.'}};
  stop.onclick=()=>{stopCountdown();stopAlarm();remaining=0;draw();start.textContent='▶ Start';status.textContent='Timer stopped. Set a new timer when ready.'};
  const inputChanged=()=>{if(interval===null){if(readInputs()){status.textContent='Ready when you are.';start.textContent='▶ Start'}}};
  minutes.onchange=inputChanged;seconds.onchange=inputChanged;
  draw();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
