/* timers.js
 * Stage 2: timer logic separated from app-core.js.
 * Loaded before app-core.js. Timer state stays here so both timers retain
 * their state while the recipe dialog is opened and closed.
 */
(function (window) {
  'use strict';

  function create(deps) {
    const $ = deps.$;

    // Main standalone timer state.
    let timerRemaining = 300;
    let timerInterval = null;
    let timerEndAt = 0;
    let timerAudioContext = null;
    let timerAlarmInterval = null;
    let timerAlarmNodes = [];

    // Per-recipe timer state.
    let recipeTimerRemaining = 300;
    let recipeTimerInterval = null;
    let recipeTimerEndAt = 0;
    let recipeTimerAlarmInterval = null;

    function timerUnlockAudio() {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          if (!timerAudioContext) timerAudioContext = new AC();
          if (timerAudioContext.state === 'suspended') timerAudioContext.resume();
        }
      } catch (_) {}
    }

    function timerAlarmBeep() {
      try {
        timerUnlockAudio();
        if (!timerAudioContext) return;
        const ctx = timerAudioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        osc.type = 'square';
        osc.frequency.setValueAtTime(1450, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.22, now + 0.012);
        gain.gain.setValueAtTime(0.22, now + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
        timerAlarmNodes.push(osc);
        osc.onended = () => { timerAlarmNodes = timerAlarmNodes.filter(node => node !== osc); };
      } catch (_) {}
    }

    function timerStopAlarm() {
      if (timerAlarmInterval !== null) {
        clearInterval(timerAlarmInterval);
        timerAlarmInterval = null;
      }
      timerAlarmNodes.forEach(node => { try { node.stop(); } catch (_) {} });
      timerAlarmNodes = [];
      try { if ('vibrate' in navigator) navigator.vibrate(0); } catch (_) {}
    }

    function timerAlarm() {
      timerStopAlarm();
      timerAlarmBeep();
      timerAlarmInterval = setInterval(timerAlarmBeep, 380);
      $('timerStopAlarmBtn').textContent = '■ Stop timer';
      $('timerStatus').textContent = '⏰ Time is up! Alarm sounding — tap Stop alarm to silence.';
    }

    function timerFormat(seconds) {
      seconds = Math.max(0, Math.ceil(seconds));
      return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
    }

    function timerDraw() { $('timerDisplay').textContent = timerFormat(timerRemaining); }
    function timerStop() {
      if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    function timerSetFromInputs() {
      const minutes = Number($('timerMinutes').value);
      const seconds = Number($('timerSeconds').value);
      if (!Number.isFinite(minutes) || !Number.isFinite(seconds) || minutes < 0 || seconds < 0 || seconds > 59 || !Number.isInteger(minutes) || !Number.isInteger(seconds) || minutes > 999) {
        $('timerStatus').textContent = 'Enter whole minutes (0–999) and seconds (0–59).';
        return false;
      }
      const total = minutes * 60 + seconds;
      if (total < 1) {
        $('timerStatus').textContent = 'Set the timer for at least 1 second.';
        return false;
      }
      timerRemaining = total;
      timerDraw();
      return true;
    }

    function timerTick() {
      timerRemaining = Math.max(0, Math.ceil((timerEndAt - Date.now()) / 1000));
      timerDraw();
      if (timerRemaining <= 0) {
        timerStop();
        $('timerStartBtn').textContent = '▶ Start';
        $('timerStatus').textContent = '⏰ Time is up!';
        timerAlarm();
        try { if ('vibrate' in navigator) navigator.vibrate([250, 120, 250, 120, 250]); } catch (_) {}
      }
    }

    function initMain() {
      $('timerStartBtn').onclick = () => {
        timerUnlockAudio();
        if (timerInterval !== null) {
          timerRemaining = Math.max(0, Math.ceil((timerEndAt - Date.now()) / 1000));
          timerStop();
          timerDraw();
          $('timerStartBtn').textContent = '▶ Resume';
          $('timerStatus').textContent = 'Paused.';
          return;
        }
        if (timerRemaining <= 0 || $('timerStatus').textContent === 'Ready when you are.' || $('timerStatus').textContent.startsWith('Set the timer')) {
          if (!timerSetFromInputs()) return;
        }
        timerEndAt = Date.now() + timerRemaining * 1000;
        timerInterval = setInterval(timerTick, 250);
        $('timerStartBtn').textContent = 'Ⅱ Pause';
        $('timerStatus').textContent = 'Timer running…';
        timerTick();
      };
      $('timerResetBtn').onclick = () => {
        timerStop();
        timerStopAlarm();
        if (timerSetFromInputs()) {
          $('timerStartBtn').textContent = '▶ Start';
          $('timerStatus').textContent = 'Ready when you are.';
        }
      };
      $('timerStopAlarmBtn').onclick = () => {
        if (timerInterval !== null) {
          timerRemaining = Math.max(0, Math.ceil((timerEndAt - Date.now()) / 1000));
          timerStop();
        }
        timerStopAlarm();
        timerDraw();
        $('timerStartBtn').textContent = '▶ Start';
        $('timerStatus').textContent = timerRemaining <= 0 ? 'Timer stopped. Set a new timer when ready.' : 'Timer stopped.';
      };
      $('timerMinutes').onchange = () => {
        if (timerInterval === null) {
          timerSetFromInputs();
          $('timerStatus').textContent = 'Ready when you are.';
          $('timerStartBtn').textContent = '▶ Start';
        }
      };
      $('timerSeconds').onchange = $('timerMinutes').onchange;
    }

    // Recipe timer helpers. Alarm audio is shared with the main timer, as in
    // the original app, while the countdown state remains independent.
    function recipeTimerFmt(seconds) {
      seconds = Math.max(0, Math.ceil(seconds));
      return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
    }
    function recipeTimerDraw() {
      const display = $('recipeTimerDisplay');
      if (display) display.textContent = recipeTimerFmt(recipeTimerRemaining);
    }
    function recipeTimerStopAlarm() {
      if (recipeTimerAlarmInterval !== null) {
        clearInterval(recipeTimerAlarmInterval);
        recipeTimerAlarmInterval = null;
      }
      timerStopAlarm();
    }
    function recipeTimerTick() {
      recipeTimerRemaining = Math.max(0, Math.ceil((recipeTimerEndAt - Date.now()) / 1000));
      recipeTimerDraw();
      if (recipeTimerRemaining <= 0) {
        clearInterval(recipeTimerInterval);
        recipeTimerInterval = null;
        const start = $('recipeTimerStart');
        const status = $('recipeTimerStatus');
        if (start) start.textContent = '▶ Start';
        if (status) status.textContent = '⏰ Time is up!';
        timerUnlockAudio();
        timerAlarmBeep();
        recipeTimerAlarmInterval = setInterval(timerAlarmBeep, 450);
        try { if ('vibrate' in navigator) navigator.vibrate([250, 120, 250, 120, 250]); } catch (_) {}
      }
    }

    function initRecipeBakingTimer() {
      const minutes = $('recipeTimerMinutes');
      const seconds = $('recipeTimerSeconds');
      const start = $('recipeTimerStart');
      const reset = $('recipeTimerReset');
      const stop = $('recipeTimerStopAlarm');
      if (!minutes || !seconds || !start || !reset || !stop) return;
      const status = $('recipeTimerStatus');

      if (recipeTimerInterval !== null) {
        minutes.value = Math.floor(recipeTimerRemaining / 60);
        seconds.value = recipeTimerRemaining % 60;
        start.textContent = 'Ⅱ Pause';
        status.textContent = 'Timer running…';
      } else if (recipeTimerRemaining !== 300) {
        minutes.value = Math.floor(recipeTimerRemaining / 60);
        seconds.value = recipeTimerRemaining % 60;
        start.textContent = recipeTimerRemaining > 0 ? '▶ Resume' : '▶ Start';
      }
      recipeTimerDraw();

      const set = () => {
        const mm = Number(minutes.value);
        const ss = Number(seconds.value);
        if (!Number.isInteger(mm) || !Number.isInteger(ss) || mm < 0 || mm > 999 || ss < 0 || ss > 59) {
          status.textContent = 'Enter whole minutes (0–999) and seconds (0–59).';
          return false;
        }
        const total = mm * 60 + ss;
        if (total < 1) {
          status.textContent = 'Set the timer for at least 1 second.';
          return false;
        }
        recipeTimerRemaining = total;
        recipeTimerDraw();
        return true;
      };

      start.onclick = () => {
        timerUnlockAudio();
        if (recipeTimerInterval !== null) {
          recipeTimerRemaining = Math.max(0, Math.ceil((recipeTimerEndAt - Date.now()) / 1000));
          clearInterval(recipeTimerInterval);
          recipeTimerInterval = null;
          recipeTimerDraw();
          start.textContent = '▶ Resume';
          status.textContent = 'Paused.';
          return;
        }
        if (recipeTimerRemaining <= 0 || status.textContent === 'Ready when you are.' || status.textContent.startsWith('Enter whole') || status.textContent.startsWith('Set the timer')) {
          if (!set()) return;
        }
        recipeTimerEndAt = Date.now() + recipeTimerRemaining * 1000;
        recipeTimerInterval = setInterval(recipeTimerTick, 250);
        start.textContent = 'Ⅱ Pause';
        status.textContent = 'Timer running…';
        recipeTimerTick();
      };
      reset.onclick = () => {
        if (recipeTimerInterval !== null) {
          clearInterval(recipeTimerInterval);
          recipeTimerInterval = null;
        }
        recipeTimerStopAlarm();
        if (set()) {
          start.textContent = '▶ Start';
          status.textContent = 'Ready when you are.';
        }
      };
      stop.onclick = () => {
        if (recipeTimerInterval !== null) {
          recipeTimerRemaining = Math.max(0, Math.ceil((recipeTimerEndAt - Date.now()) / 1000));
          clearInterval(recipeTimerInterval);
          recipeTimerInterval = null;
        }
        recipeTimerStopAlarm();
        recipeTimerDraw();
        start.textContent = '▶ Start';
        status.textContent = recipeTimerRemaining <= 0 ? 'Timer stopped. Set a new timer when ready.' : 'Timer stopped.';
      };
      [minutes, seconds].forEach(element => element.onchange = () => {
        if (recipeTimerInterval === null) {
          if (set()) status.textContent = 'Ready when you are.';
          start.textContent = '▶ Start';
        }
      });
    }

    return { initMain, initRecipeBakingTimer };
  }

  window.MRBTimers = { create };
})(window);
