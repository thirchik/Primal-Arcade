const tabs = document.querySelectorAll('[role="tab"][data-tabid]');
const tablists = document.querySelectorAll('[role="tablist"][data-tabid]');

tabs.forEach((tab) => {
  tab.addEventListener("click", (e) => showTab(e.target.dataset.tabid));
});

document.querySelector("#roles").addEventListener("change", changeRole);

const applyMutationButtons = document.querySelectorAll(
  "button[data-mutation-id][data-applied]"
);

applyMutationButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    if (e.target.dataset.applied === "true") return;

    applyMutation(e.target.dataset.mutationId).then((mutation) => {
      const applied = [...applyMutationButtons].find(
        (btn) => btn.dataset.mutationId === String(mutation.id)
      );

      if (!applied) return;

      applyMutationButtons.forEach((btn) => {
        btn.classList.remove("applied");
        btn.textContent = "Apply";
        btn.dataset.applied = "false";
      });

      applied.classList.add("applied");
      applied.textContent = "Applied";
      applied.dataset.applied = "true";
    });
  });
});

if (location.hash) {
  showTab(location.hash.substring(1));
}

if (window.active_role) {
  setRole(window.active_role.id);
}

function showTab(tabId) {
  const tablistToShow = [...tablists].find((t) => t.dataset.tabid === tabId);

  if (!tablistToShow) return;

  tablists.forEach((tablist) => tablist.classList.remove("active"));
  tablistToShow.classList.add("active");
}

function setRole(roleId) {
  const options = [...document.querySelectorAll("option[data-role]")];
  const optionToSelect = options.find((o) => o.value === String(roleId));

  if (!optionToSelect) return;

  options.forEach((o) => o.removeAttribute("selected"));
  optionToSelect.setAttribute("selected", "true");
}

function changeRole(e) {
  const roleId = e.target.value;
  fetch(`/api/role/${roleId}/activate`, { method: "PUT" }).then((role) =>
    setRole(role.id)
  );
}

function applyMutation(mutationId) {
  return fetch(`/api/mutation/${mutationId}/activate`, { method: "PUT" }).then(
    (r) => r.json()
  );
}


// Season and Disaster data
const seasonsData = {
  winter: {
    name: "WINTER",
    description: "You gain additional 850 combat weight during winter, as well as becoming slower, unless you're a feathered or furred dinosaur.",
    color: "#4a90e2",
    possibleDisasters: ["blizzard"] // Winter can only have blizzard
  },
  spring: {
    name: "SPRING",
    description: "Increased plant growth provides more food sources. Juveniles and adolescents gain a increased growing speed.",
    color: "#7ed957",
    possibleDisasters: ["heavyRain"] // Spring can only have heavy rain
  },
  summer: {
    name: "SUMMER",
    description: "Higher temperatures increase thirst rate. Water sources slowly evaporate, creating scarcity.",
    color: "#ff6b35",
    possibleDisasters: ["drought", "wildfire"] // Summer can have drought or wildfire
  },
  autumn: {
    name: "AUTUMN",
    description: "Cooling temperatures prepare dinosaurs for winter. Food becomes scarce as plants die off.",
    color: "#d4a017",
    possibleDisasters: ["famine"] // Autumn can have wildfire or earthquake
  }
};

const disastersData = {
  blizzard: {
    name: "BLIZZARD",
    description: "Blizzard impacts dinosaurs of all ages, causing health to lower rapidly. Stay in shelter to slow down the hypothermia and gain advantage.",
    warning: "!Slower-healing large dinosaurs are more vulnerable, making it crucial to seek safety!",
    color: "#89CFF0"
  },
  heavyRain: {
    name: "HEAVY RAIN",
    description: "Heavy rainfall causes decreased terrain visibility.",
    warning: "!Avoid appearing mud piles in chase as they significantly slow you down, or use them to your advantage!",
    color: "#4A90E2"
  },
  drought: {
    name: "DROUGHT",
    description: "Extended drought dries up smaller water sources. Increased risk of heat exhaustion for larger dinosaurs.",
    warning: "!Stay near remaining water sources! Dehydration happens 2x faster during drought!",
    color: "#D4601A"
  },
  wildfire: {
    name: "WILDFIRE",
    description: "Dry conditions spark wildfires across the map.",
    warning: "!Fire deals massive damage over time! Seek water or rocky terrain for safety!",
    color: "#FF4500"
  },
  famine: {
  name: "FAMINE",
  description: "Food sources become scarce across the land.",
  warning: "!Hunger depletes 2x faster! Hunt or forage immediately to avoid starvation!",
  color: "#8B4513"
  },
  none: {
    name: "NONE",
    description: "The weather is calm. No active natural disasters.",
    color: "#FFFFFF"
  }
};

// Timer settings
const SEASON_DURATION = 30; // 30 seconds per season
const DISASTER_DURATION = 10; // 10 seconds per disaster

// Current state
let currentSeason = "winter";
let currentDisaster = "none"; // Start with no disaster
let seasonTimeRemaining = SEASON_DURATION;
let disasterTimeRemaining = 0; // No disaster active at start
let seasonInterval;
let disasterInterval;
let seasonOrder = Object.keys(seasonsData);
let seasonIndex = 0;
let isDisasterActive = false; // Track if a disaster is currently active

// Format time as MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Get random disaster for current season
function getRandomDisasterForSeason() {
  const possibleDisasters = seasonsData[currentSeason].possibleDisasters;
  const randomIndex = Math.floor(Math.random() * possibleDisasters.length);
  return possibleDisasters[randomIndex];
}

// Start a new disaster during the season
function startDisaster() {
  if (!isDisasterActive) {
    const newDisaster = getRandomDisasterForSeason();
    currentDisaster = newDisaster;
    disasterTimeRemaining = DISASTER_DURATION;
    isDisasterActive = true;
    updateDisasterDisplay();
  }
}

// End current disaster and set to none
function endDisaster() {
  if (isDisasterActive) {
    currentDisaster = "none";
    disasterTimeRemaining = 0;
    isDisasterActive = false;
    updateDisasterDisplay();
  }
}

// Update season display
function updateSeasonDisplay() {
  const seasonData = seasonsData[currentSeason];
  const seasonNameElem = document.getElementById('seasonName');
  const seasonDescElem = document.getElementById('seasonDescription');
  const seasonTimerElem = document.getElementById('seasonTimer');
  
  if (seasonNameElem) {
    seasonNameElem.style.opacity = '0';
    setTimeout(() => {
      seasonNameElem.textContent = seasonData.name;
      seasonNameElem.style.color = seasonData.color;
      seasonNameElem.style.opacity = '1';
    }, 300);
  }
  
  if (seasonDescElem) {
    seasonDescElem.style.opacity = '0';
    setTimeout(() => {
      seasonDescElem.textContent = seasonData.description;
      seasonDescElem.style.opacity = '1';
    }, 300);
  }
  
  if (seasonTimerElem) {
    seasonTimerElem.textContent = formatTime(seasonTimeRemaining);
  }
}

// Update disaster display
function updateDisasterDisplay() {
  const disasterData = disastersData[currentDisaster];
  const disasterNameElem = document.getElementById('disasterName');
  const disasterDescElem = document.getElementById('disasterDescription');
  const disasterWarningElem = document.getElementById('disasterWarning');
  const disasterTimerElem = document.getElementById('disasterTimer');
  
  if (disasterNameElem) {
    disasterNameElem.style.opacity = '0';
    setTimeout(() => {
      disasterNameElem.textContent = disasterData.name;
      disasterNameElem.style.color = disasterData.color;
      disasterNameElem.style.opacity = '1';
    }, 300);
  }
  
  if (disasterDescElem) {
    disasterDescElem.style.opacity = '0';
    setTimeout(() => {
      disasterDescElem.textContent = disasterData.description;
      disasterDescElem.style.opacity = '1';
    }, 300);
  }
  
  if (disasterWarningElem) {
    disasterWarningElem.style.opacity = '0';
    setTimeout(() => {
      disasterWarningElem.textContent = disasterData.warning;
      disasterWarningElem.style.opacity = '1';
    }, 300);
  }
  
  if (disasterTimerElem) {
    if (isDisasterActive) {
      disasterTimerElem.textContent = formatTime(disasterTimeRemaining);
    } else {
      disasterTimerElem.textContent = "00:00";
    }
  }
}

// Move to next season
function nextSeason() {
  // End any active disaster when season changes
  endDisaster();
  
  // Move to next season
  seasonIndex = (seasonIndex + 1) % seasonOrder.length;
  currentSeason = seasonOrder[seasonIndex];
  seasonTimeRemaining = SEASON_DURATION;
  
  updateSeasonDisplay();
  
  // Start a new disaster shortly after season begins (delay of 2 seconds)
  setTimeout(() => {
    startDisaster();
  }, 2000);
}

// Season timer countdown
function startSeasonTimer() {
  if (seasonInterval) clearInterval(seasonInterval);
  
  seasonInterval = setInterval(() => {
    if (seasonTimeRemaining > 0) {
      seasonTimeRemaining--;
      const timerElem = document.getElementById('seasonTimer');
      if (timerElem) timerElem.textContent = formatTime(seasonTimeRemaining);
    } else {
      nextSeason();
    }
  }, 1000);
}

// Disaster timer countdown
function startDisasterTimer() {
  if (disasterInterval) clearInterval(disasterInterval);
  
  disasterInterval = setInterval(() => {
    if (isDisasterActive && disasterTimeRemaining > 0) {
      disasterTimeRemaining--;
      const timerElem = document.getElementById('disasterTimer');
      if (timerElem) timerElem.textContent = formatTime(disasterTimeRemaining);
      
      // When disaster timer reaches 0, end the disaster
      if (disasterTimeRemaining === 0) {
        endDisaster();
      }
    }
  }, 1000);
}

// Manual override for testing (optional)
function skipSeason() {
  nextSeason();
}

function forceStartDisaster() {
  if (!isDisasterActive) {
    startDisaster();
  }
}

// Initialize everything
function initializeBannerTimers() {
  // Start with no disaster
  currentDisaster = "none";
  isDisasterActive = false;
  disasterTimeRemaining = 0;
  
  updateSeasonDisplay();
  updateDisasterDisplay();
  startSeasonTimer();
  startDisasterTimer();
  
  // Start first disaster 2 seconds after page loads
  setTimeout(() => {
    startDisaster();
  }, 2000);
}

// Start when page loads
document.addEventListener('DOMContentLoaded', initializeBannerTimers);