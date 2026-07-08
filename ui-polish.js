// UI polish layer: shortens the report without changing the analyzer engine.
(function () {
  const $ = (id) => document.getElementById(id);

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function unique(items) {
    const seen = new Set();
    return items.map(cleanText).filter(item => {
      const key = item.toLowerCase();
      if (!item || key.includes("nothing found here") || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function parseDetectedJob() {
    const source = $("jobTypeOutput");
    const text = cleanText(source ? source.innerText : "");
    const looksLike = text.match(/This job looks like:\s*(.*?)\s*Job family:/i);
    if (looksLike && looksLike[1]) return looksLike[1];
    const family = text.match(/Job family:\s*(.*?)\s*Confidence:/i);
    if (family && family[1]) return family[1];
    return "Use the closest job title from the posting.";
  }

  function polishBestDirection() {
    const box = $("bestDirectionOutput");
    if (!box) return;
    const direction = parseDetectedJob();
    box.innerHTML = `
      <div class="simple-result-card">
        <p class="simple-label">Best resume direction</p>
        <h4>${escapeHTML(direction)}</h4>
        <p>Use this direction when generating the resume for this job.</p>
      </div>
    `;
  }

  function polishMissingProof() {
    const container = $("missingKeywords");
    if (!container || container.dataset.simplified === "true") return;
    const items = unique([...container.querySelectorAll(".chip")].map(chip => chip.textContent)).slice(0, 6);
    container.dataset.simplified = "true";
    if (!items.length) {
      container.innerHTML = `<p class="empty-proof">✅ No important proof gaps found.</p>`;
      return;
    }
    container.innerHTML = `
      <p class="simple-help">These job-post requirements are not clearly proven by the resume yet. Add them only if they are true.</p>
      <div class="chip-list missing-proof-list">
        ${items.map(item => `<span class="chip">${escapeHTML(item)}</span>`).join("")}
      </div>
    `;
  }

  function polishProofFound() {
    const container = $("matchedKeywords");
    if (!container || container.dataset.simplified === "true") return;
    const items = unique([...container.querySelectorAll(".chip")].map(chip => chip.textContent)).slice(0, 14);
    if (!items.length) return;
    container.dataset.simplified = "true";
    container.innerHTML = items.map(item => `<span class="chip">${escapeHTML(item)}</span>`).join("");
  }

  function polishScoreText() {
    const scoreTitle = document.querySelector(".score-panel h3");
    if (scoreTitle) scoreTitle.textContent = "Resume Match";
    const msg = $("scoreMessage");
    if (msg) msg.textContent = msg.textContent.replace(/match\./i, "resume match.").replace(/match/i, "resume match");
  }

  function polishReport() {
    polishScoreText();
    polishBestDirection();
    polishMissingProof();
    polishProofFound();
  }

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>'"]/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[char]));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const analyze = $("analyzeBtn");
    if (analyze) analyze.addEventListener("click", () => setTimeout(polishReport, 100));
    const results = $("results");
    if (results) {
      new MutationObserver(() => setTimeout(polishReport, 20)).observe(results, { childList: true, subtree: true, characterData: true });
    }
  });
})();
