const STORAGE_KEY = "crypto-watchlist-v1";

const form = document.querySelector("#watchlist-form");
const watchlistEl = document.querySelector("#watchlist");
const clearAllBtn = document.querySelector("#clear-all");
const emptyStateEl = document.querySelector("#empty-state");
const itemTemplate = document.querySelector("#item-template");

const getStoredItems = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

let items = getStoredItems();

const normalizeSymbol = (value) =>
  value.toUpperCase().replace(/\s+/g, "").replace("-", "/");

const toBinancePair = (symbol) => normalizeSymbol(symbol).replace("/", "_");

const persistItems = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const render = () => {
  watchlistEl.innerHTML = "";

  if (!items.length) {
    emptyStateEl.hidden = false;
    return;
  }

  emptyStateEl.hidden = true;

  items.forEach((item) => {
    const node = itemTemplate.content.firstElementChild.cloneNode(true);

    node.querySelector(".name").textContent = item.name;
    node.querySelector(".meta").textContent = `交易对：${item.symbol} · 添加于：${item.createdAt}`;
    node.querySelector(".notes").textContent = item.notes || "无备注";

    const link = node.querySelector(".binance-link");
    link.href = `https://www.binance.com/zh-CN/trade/${toBinancePair(item.symbol)}`;

    node.querySelector(".remove").addEventListener("click", () => {
      items = items.filter((entry) => entry.id !== item.id);
      persistItems();
      render();
    });

    watchlistEl.append(node);
  });
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.querySelector("#name").value.trim();
  const symbol = normalizeSymbol(document.querySelector("#symbol").value);
  const notes = document.querySelector("#notes").value.trim();

  if (!name || !symbol) return;

  items.unshift({
    id: crypto.randomUUID(),
    name,
    symbol,
    notes,
    createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
  });

  persistItems();
  render();
  form.reset();
});

clearAllBtn.addEventListener("click", () => {
  items = [];
  persistItems();
  render();
});

render();
