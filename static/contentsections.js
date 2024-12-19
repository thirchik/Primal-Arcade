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
