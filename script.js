const audio = document.querySelector("#siteAudio");
const musicToggle = document.querySelector("#musicToggle");
const musicToggleText = document.querySelector(".music-toggle-text");
const audioLoopStart = 28;
const mutedStorageKey = "proposal-site-muted";
const sceneStorageKey = "proposal-site-scene";
const validScenes = ["letter", "reasons", "answer"];

if (audio && musicToggle && musicToggleText) {
  const savedMutePreference = localStorage.getItem(mutedStorageKey);
  const shouldStartMuted = savedMutePreference === null ? false : savedMutePreference === "true";

  const updateMusicButton = () => {
    const isMuted = audio.muted;
    musicToggleText.textContent = isMuted ? "Unmute" : "Mute";
    musicToggle.classList.toggle("is-muted", isMuted);
    musicToggle.setAttribute("aria-label", isMuted ? "Unmute music" : "Mute music");
    musicToggle.setAttribute("aria-pressed", String(isMuted));
  };

  const tryPlayAudio = () => {
    if (
      audio.readyState >= 1 &&
      (audio.currentTime < audioLoopStart || Number.isNaN(audio.currentTime))
    ) {
      audio.currentTime = audioLoopStart;
    }

    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {});
    }
  };

  audio.muted = shouldStartMuted;
  audio.volume = 0.9;

  audio.addEventListener("loadedmetadata", () => {
    if (audio.currentTime < audioLoopStart) {
      audio.currentTime = audioLoopStart;
    }
  });

  audio.addEventListener("ended", () => {
    audio.currentTime = audioLoopStart;
    tryPlayAudio();
  });

  audio.addEventListener("timeupdate", () => {
    if (audio.duration && audio.currentTime >= audio.duration - 0.2) {
      audio.currentTime = audioLoopStart;
      tryPlayAudio();
    }
  });

  musicToggle.addEventListener("click", () => {
    audio.muted = !audio.muted;
    localStorage.setItem(mutedStorageKey, String(audio.muted));
    updateMusicButton();
    tryPlayAudio();
  });

  ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
    window.addEventListener(eventName, tryPlayAudio, { once: true });
  });

  updateMusicButton();
  tryPlayAudio();
}

const scenes = document.querySelectorAll("[data-scene]");
const sceneButtons = document.querySelectorAll("[data-go-scene]");
const initialSceneFromHash = window.location.hash.replace("#", "");
const savedScene = localStorage.getItem(sceneStorageKey);

const getDefaultScene = () => {
  if (validScenes.includes(initialSceneFromHash)) {
    return initialSceneFromHash;
  }

  if (validScenes.includes(savedScene)) {
    return savedScene;
  }

  return "letter";
};

const setScene = (sceneName) => {
  scenes.forEach((scene) => {
    scene.classList.toggle("is-active", scene.dataset.scene === sceneName);
  });

  localStorage.setItem(sceneStorageKey, sceneName);
  window.location.hash = sceneName;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

if (scenes.length) {
  setScene(getDefaultScene());
}

sceneButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetScene = button.dataset.goScene;
    if (validScenes.includes(targetScene)) {
      setScene(targetScene);
    }
  });
});

window.addEventListener("hashchange", () => {
  const targetScene = window.location.hash.replace("#", "");
  if (validScenes.includes(targetScene)) {
    setScene(targetScene);
  }
});

const reasonSlides = document.querySelectorAll("[data-slide]");
const dotsContainer = document.querySelector(".dots");
const prevSlideButton = document.querySelector("#prevSlide");
const nextSlideButton = document.querySelector("#nextSlide");
const slidesFrame = document.querySelector(".slides-frame");
const slideLabel = document.querySelector("#slideLabel");

let currentSlide = 0;

if (
  reasonSlides.length &&
  dotsContainer &&
  prevSlideButton &&
  nextSlideButton &&
  slidesFrame
) {
  reasonSlides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.addEventListener("click", () => updateSlide(index));
    dotsContainer.append(dot);
  });

  const dots = dotsContainer.querySelectorAll(".dot");

  const syncSlidesFrameHeight = () => {
    const activeSlide = reasonSlides[currentSlide];
    if (!activeSlide) {
      return;
    }

    const nextHeight = activeSlide.offsetHeight;
    if (nextHeight > 0) {
      slidesFrame.style.height = `${nextHeight}px`;
    }
  };

  function updateSlide(index) {
    currentSlide = index;

    reasonSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === currentSlide);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === currentSlide);
    });

    prevSlideButton.disabled = currentSlide === 0;
    nextSlideButton.textContent =
      currentSlide === reasonSlides.length - 1 ? "Take me to the answer" : "Next";
    if (slideLabel) {
      slideLabel.textContent = `Slide ${currentSlide + 1} of ${reasonSlides.length}`;
    }
    syncSlidesFrameHeight();
  }

  prevSlideButton.addEventListener("click", () => {
    if (currentSlide > 0) {
      updateSlide(currentSlide - 1);
    }
  });

  nextSlideButton.addEventListener("click", () => {
    if (currentSlide === reasonSlides.length - 1) {
      setScene("answer");
      return;
    }

    updateSlide(currentSlide + 1);
  });

  updateSlide(0);
  window.addEventListener("resize", syncSlidesFrameHeight);
}

const answerStage = document.querySelector("#answerStage");
const noButton = document.querySelector("#noButton");
const yesButton = document.querySelector("#yesButton");
const yesMessage = document.querySelector("#yesMessage");
const finalChaos = document.querySelector("#finalChaos");
const chaosVideo = document.querySelector("#chaosVideo");

if (answerStage && noButton && yesButton && yesMessage) {
  const moveNoButton = () => {
    const stageRect = answerStage.getBoundingClientRect();
    const buttonRect = noButton.getBoundingClientRect();

    const maxX = stageRect.width - buttonRect.width - 14;
    const maxY = stageRect.height - buttonRect.height - 14;
    const nextX = Math.max(14, Math.random() * maxX);
    const nextY = Math.max(14, Math.random() * maxY);

    noButton.style.left = `${nextX}px`;
    noButton.style.top = `${nextY}px`;
    noButton.style.transform = "translate(0, 0)";
  };

  ["mouseenter", "pointerdown", "focus"].forEach((eventName) => {
    noButton.addEventListener(eventName, moveNoButton);
  });

  yesButton.addEventListener("click", () => {
    yesMessage.hidden = false;
    yesButton.textContent = "Yay";
    noButton.hidden = true;
    if (finalChaos) {
      finalChaos.classList.add("is-celebrating");
    }
    if (chaosVideo) {
      const playAttempt = chaosVideo.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }
    }
  });
}
