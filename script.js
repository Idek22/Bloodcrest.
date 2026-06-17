const prologueMusic = document.getElementById('prologueMusic');
const chapterMusic = document.getElementById('chapterMusic');
const startOverlay = document.getElementById('startOverlay');
const startButton = document.getElementById('startButton');
const musicStatus = document.getElementById('musicStatus');

let audioUnlocked = false;
let currentTrack = null;

const tracks = {
  prologue: prologueMusic,
  chapter: chapterMusic,
};

for (const audio of Object.values(tracks)) {
  audio.volume = 0;
}

startButton.addEventListener('click', async () => {
  audioUnlocked = true;
  startOverlay.style.display = 'none';
  updateMusicForScroll();
});

function fadeTo(audio, targetVolume, duration = 900) {
  const startVolume = audio.volume;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    audio.volume = startVolume + (targetVolume - startVolume) * progress;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else if (targetVolume === 0) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  requestAnimationFrame(step);
}

async function playOnly(trackName) {
  if (!audioUnlocked || currentTrack === trackName) return;

  currentTrack = trackName;

  for (const [name, audio] of Object.entries(tracks)) {
    if (name === trackName) {
      try {
        await audio.play();
        fadeTo(audio, 0.75);
      } catch (error) {
        musicStatus.textContent = 'Music blocked: press Start again';
      }
    } else {
      fadeTo(audio, 0);
    }
  }

  musicStatus.textContent = trackName === 'prologue' ? 'Music: Prologue' : 'Music: Chase Scene';
}

function stopMusic() {
  if (currentTrack === null) return;
  currentTrack = null;
  for (const audio of Object.values(tracks)) fadeTo(audio, 0);
  musicStatus.textContent = 'Music: none';
}

function isInViewportRange(element) {
  const rect = element.getBoundingClientRect();
  const middle = window.innerHeight * 0.42;
  return rect.top <= middle && rect.bottom >= middle;
}

function updateMusicForScroll() {
  if (!audioUnlocked) return;

  const prologue = document.getElementById('prologue');
  const chase = document.getElementById('chaseScene');

  if (isInViewportRange(prologue)) {
    playOnly('prologue');
  } else if (isInViewportRange(chase)) {
    playOnly('chapter');
  } else {
    stopMusic();
  }
}

window.addEventListener('scroll', updateMusicForScroll, { passive: true });
window.addEventListener('resize', updateMusicForScroll);
