export class UIManager {
  constructor() {
    // Top Bar elements
    this.distanceVal = document.getElementById('distanceVal');
    this.distanceProgress = document.getElementById('distanceProgress');
    this.timerVal = document.getElementById('timerVal');
    this.missionAlert = document.getElementById('missionAlert');

    // Bottom Bar elements
    this.speedVal = document.getElementById('speedVal');
    this.speedGaugeFill = document.getElementById('speedGaugeFill');
    this.hbStatus = document.getElementById('hbStatus');
    this.hbIcon = document.getElementById('hbIcon');

    // Screens
    this.hud = document.getElementById('hud');
    this.startScreen = document.getElementById('startScreen');
    this.gameOverScreen = document.getElementById('gameOverScreen');
    this.victoryScreen = document.getElementById('victoryScreen');
    this.eventBanner = document.getElementById('eventBanner');

    // Result Stats
    this.statDist = document.getElementById('statDist');
    this.statYields = document.getElementById('statYields');
    this.statVicTime = document.getElementById('statVicTime');
    this.statVicYields = document.getElementById('statVicYields');
    this.statVicScore = document.getElementById('statVicScore');

    // Touch controls
    this.btnGas = document.getElementById('btnGas');
    this.btnBrake = document.getElementById('btnBrake');
    this.btnLeft = document.getElementById('btnLeft');
    this.btnRight = document.getElementById('btnRight');
    this.btnHighBeam = document.getElementById('btnHighBeam');

    this.bannerTimer = null;
  }

  showHUD() {
    this.hud.classList.remove('hidden');
    this.startScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
  }

  showGameOver(distance, yields) {
    this.hud.classList.add('hidden');
    this.gameOverScreen.classList.remove('hidden');
    this.statDist.textContent = Math.floor(distance);
    this.statYields.textContent = yields;
  }

  showVictory(timeTaken, yields, score) {
    this.hud.classList.add('hidden');
    this.victoryScreen.classList.remove('hidden');
    this.statVicTime.textContent = timeTaken.toFixed(1);
    this.statVicYields.textContent = yields;
    this.statVicScore.textContent = score;
  }

  triggerBanner(text) {
    if (this.bannerTimer) clearTimeout(this.bannerTimer);
    this.eventBanner.textContent = text;
    this.eventBanner.classList.remove('hidden');

    this.bannerTimer = setTimeout(() => {
      this.eventBanner.classList.add('hidden');
    }, 1200);
  }

  update(speedKmh, currentZ, totalDistance, timeRemaining, isHighBeam) {
    // 1. Speedometer
    const speedInt = Math.floor(speedKmh);
    this.speedVal.textContent = speedInt;
    const speedPct = Math.min((speedKmh / 240) * 100, 100);
    this.speedGaugeFill.style.width = `${speedPct}%`;

    // Speed color transition
    if (speedKmh > 180) {
      this.speedVal.style.color = '#ff0055';
      this.missionAlert.textContent = 'SUPERSONIC BOOST!';
      this.missionAlert.style.color = '#ff0055';
    } else if (speedKmh > 130) {
      this.speedVal.style.color = '#ffaa00';
      this.missionAlert.textContent = 'FAST LANE CRUISING';
      this.missionAlert.style.color = '#ffaa00';
    } else {
      this.speedVal.style.color = '#00f0ff';
      this.missionAlert.textContent = 'APPROACHING TRAFFIC';
      this.missionAlert.style.color = '#00f0ff';
    }

    // 2. Distance remaining
    const remainingM = Math.max(Math.floor(totalDistance - currentZ), 0);
    this.distanceVal.textContent = remainingM;
    const distPct = Math.min((currentZ / totalDistance) * 100, 100);
    this.distanceProgress.style.width = `${distPct}%`;

    // 3. Timer
    this.timerVal.textContent = Math.max(timeRemaining, 0).toFixed(1);
    if (timeRemaining < 20) {
      this.timerVal.style.color = '#ff3333';
    } else {
      this.timerVal.style.color = '#ffaa00';
    }

    // 4. High Beam Status
    if (isHighBeam) {
      this.hbStatus.textContent = 'FLASHING!';
      this.hbStatus.className = 'hb-badge flashing';
      this.hbIcon.style.color = '#fff';
      this.hbIcon.style.transform = 'scale(1.25)';
    } else {
      this.hbStatus.textContent = 'READY [SPACE]';
      this.hbStatus.className = 'hb-badge ready';
      this.hbIcon.style.color = '#00f0ff';
      this.hbIcon.style.transform = 'scale(1.0)';
    }
  }

  bindControls(player, onStart, onRestart) {
    // Button clicks
    document.getElementById('btnStartGame').addEventListener('click', onStart);
    document.getElementById('btnRetry').addEventListener('click', onRestart);
    document.getElementById('btnRestartVictory').addEventListener('click', onRestart);

    // Keyboard Inputs
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          player.inputs.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          player.inputs.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          player.inputs.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          player.inputs.right = true;
          break;
        case 'Space':
          player.inputs.highBeam = true;
          player.triggerHighBeam(true);
          break;
        case 'KeyH':
        case 'KeyB':
          player.inputs.horn = true;
          import('./audio.js').then(m => m.sound.playHorn());
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          player.inputs.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          player.inputs.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          player.inputs.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          player.inputs.right = false;
          break;
        case 'Space':
          player.inputs.highBeam = false;
          player.triggerHighBeam(false);
          break;
      }
    });

    // Touch controls for mobile / lab testing
    const setupTouchBtn = (btn, onPress, onRelease) => {
      if (!btn) return;
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); onPress(); }, { passive: false });
      btn.addEventListener('touchend', (e) => { e.preventDefault(); onRelease(); }, { passive: false });
      btn.addEventListener('mousedown', onPress);
      btn.addEventListener('mouseup', onRelease);
    };

    setupTouchBtn(this.btnGas, () => { player.inputs.forward = true; }, () => { player.inputs.forward = false; });
    setupTouchBtn(this.btnBrake, () => { player.inputs.backward = true; }, () => { player.inputs.backward = false; });
    setupTouchBtn(this.btnLeft, () => { player.inputs.left = true; }, () => { player.inputs.left = false; });
    setupTouchBtn(this.btnRight, () => { player.inputs.right = true; }, () => { player.inputs.right = false; });
    setupTouchBtn(this.btnHighBeam, () => {
      player.inputs.highBeam = true;
      player.triggerHighBeam(true);
    }, () => {
      player.inputs.highBeam = false;
      player.triggerHighBeam(false);
    });
  }
}
