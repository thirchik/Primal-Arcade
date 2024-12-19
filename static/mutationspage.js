const displayStates = Object.freeze({
  initial: 'Press "Spin" to try your luck',
  loading: "Spinning...",
  result: "You got...",
});

const dnaAmountDisplay = document.getElementById("dna-amount");
const rnaAmountDisplay = document.getElementById("rna-amount");
const stardustAmountDisplay = document.getElementById("stardust-amount");
const progressDisplay = document.getElementById("progress-display");
const resultDisplay = document.getElementById("result-display");
const resultStarsDisplay = document.getElementById("result-display-stars");
const pendingCard = document.getElementById("pending-card");
const mutationsContainer = document.getElementById("mutations-container");

const user = window.user;
const spinCost = window.spin_cost;

document.getElementById("spin-button").addEventListener("click", handleSpin);

let abortController = new AbortController();
let timeoutId = null;
let spinCurrency = "dna";

document.getElementById("currency-select").addEventListener("change", (e) => {
  spinCurrency = e.target.value;
});

function handleSpin() {
  spin(spinCurrency);
}

function spin(currency) {
  abortController.abort();
  clearTimeout(timeoutId);

  progressDisplay.textContent = displayStates.loading;
  resultDisplay.style.visibility = "hidden";
  pendingCard.style.visibility = "visible";
  const endpoint = currency === "dna" ? "/api/spin/dna" : "/api/spin/stardust";

  timeoutId = setTimeout(() => {
    abortController = new AbortController();
    fetch(endpoint, { method: "POST", signal: abortController.signal })
      .then(async (r) => {
        const obj = await r.json();
        if (r.status !== 200) throw obj;
        return obj;
      })
      .then((mutation) => {
        if (currency === "dna") {
          user.dna_amount -= spinCost.DNA;
          dnaAmountDisplay.textContent = user.dna_amount;
        } else {
          user.stardust_amount -= spinCost.STARDUST;
          stardustAmountDisplay.textContent = user.stardust_amount;
        }

        progressDisplay.textContent = displayStates.result;
        resultStarsDisplay.textContent = mutation.stars_count;
        resultDisplay.style.visibility = "visible";
        mutationsContainer.insertBefore(
          createMutationCard(mutation),
          document.querySelector(".mut-card") ?? pendingCard
        );
      })
      .catch((error) => {
        progressDisplay.textContent = error.message;
      })
      .finally(() => {
        pendingCard.style.visibility = "hidden";
      });
  }, 1000);
}

function createMutationCard(mutation) {
  const container = document.createElement("div");
  const textWrapper = document.createElement("p");
  const starsText = document.createElement("span");
  const starIcon = document.createElement("i");
  const typeText = document.createTextNode(
    mutation.type === 1 ? "COMBAT MUTATION" : "ARMOUR MUTATION"
  );

  container.classList.add("mut-card");
  starsText.style.fontFamily = "'Jersey 25', serif";
  starsText.textContent = mutation.stars_count;
  starIcon.classList.add("fa-solid", "fa-star", "fa-xs");

  container.appendChild(textWrapper);
  textWrapper.append(starsText, " ", starIcon, " ", typeText);

  return container;
}
