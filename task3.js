// ===== Data and constants =====
const MAX_QTY = 10;
const CODE_LENGTH = 6;
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MIN_DATE = "2026-10-27";
const DASH = "—";

const EVENTS = [
  { id: "rock", name: "Rock Night", soldOut: ["2026-12-05", "2026-12-19"] },
  { id: "jazz", name: "Jazz Evening", soldOut: ["2026-12-12"] },
  { id: "film", name: "Film Festival", soldOut: ["2026-12-26"] }
];
const TYPES = [
  { id: "standard", name: "Standard", price: 20, seats: 10 },
  { id: "vip", name: "VIP", price: 50, seats: 4 },
  { id: "student", name: "Student", price: 10, seats: 6 }
];
const PROMOS = [
  { id: "WELCOME10", percent: 10 },
  { id: "ASTANA20", percent: 20 },
  { id: "CINEMA15", percent: 15 }
];
const BAD_DOMAINS = ["mailinator.com", "tempmail.com", "10minutemail.com"];
const LABELS = { event: "Event", date: "Date", type: "Ticket type", quantity: "Quantity", name: "Name", email: "Email" };

const form = document.getElementById("ticketForm");
form.noValidate = true; 
const summary = document.getElementById("summary");
const ticketsEl = document.getElementById("tickets");

const eventEl = document.getElementById("event");
const dateEl = document.getElementById("date");
const typeEl = document.getElementById("type");
const quantityEl = document.getElementById("quantity");
const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const promoEl = document.getElementById("promo");
const fields = [eventEl, dateEl, typeEl, quantityEl, nameEl, emailEl, promoEl];

dateEl.setAttribute("min", MIN_DATE);

const booked = []; 

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function findById(list, id) {
  for (const item of list) {
    if (item.id === id) {
      return item;
    }
  }
  return null;
}

function money(number) {
  return "$" + number.toFixed(2);
}

function getTotal(type, qty, promo) {
  let percent = 0;
  if (promo !== null) {
    percent = promo.percent;
  }
  return type.price * qty * (1 - percent / 100);
}


function checkDate() {
  const chosen = findById(EVENTS, eventEl.value);
  if (chosen !== null && chosen.soldOut.includes(dateEl.value)) {
    return chosen.name + " is sold out on " + dateEl.value + ". Choose another date.";
  }
  return "";
}

function checkQuantity() {
  const type = findById(TYPES, typeEl.value);
  if (type !== null && Number(quantityEl.value) > type.seats) {
    return "Only " + type.seats + " " + type.name + " seats left.";
  }
  return "";
}

function checkName() {
  const text = nameEl.value.trim();
  let words = 1;
  let badSymbol = false;
  for (let i = 0; i < text.length; i++) {
    const char = text.slice(i, i + 1);
    if (char === " " && text.slice(i - 1, i) !== " ") {
      words++;
    }
    if (char !== " " && char.toLowerCase() === char.toUpperCase()) {
      badSymbol = true;
    }
  }
  if (badSymbol || words < 2) {
    return "Enter first and last name using letters only.";
  }
  return "";
}

function checkEmail() {
  const at = emailEl.value.indexOf("@");
  const domain = emailEl.value.slice(at + 1).toLowerCase();
  if (BAD_DOMAINS.includes(domain)) {
    return "Temporary email addresses are not accepted.";
  }
  if (typeEl.value === "student" && domain.slice(-4) !== ".edu" && domain.slice(-7) !== ".edu.kz") {
    return "Student tickets need a university email (.edu or .edu.kz).";
  }
  return "";
}

function checkPromo() {
  if (promoEl.value.trim() !== "" && findById(PROMOS, promoEl.value.trim().toUpperCase()) === null) {
    return "Unknown promo code.";
  }
  return "";
}

function validateField(el) {
  el.setCustomValidity("");
  const v = el.validity;
  let message = "";

  if (v.valueMissing) {
    message = LABELS[el.id] + " is required.";
  } else if (v.typeMismatch) {
    message = "Enter a valid email like name@example.com.";
  } else if (v.rangeUnderflow) {
    message = el.id === "date" ? "The date cannot be in the past." : "Minimum is " + el.min + ".";
  } else if (v.rangeOverflow) {
    message = "Maximum is " + MAX_QTY + " per booking.";
  } else if (v.badInput || v.stepMismatch) {
    message = "Enter a whole number.";
  } else if (el.id === "date") {
    message = checkDate();
  } else if (el.id === "quantity") {
    message = checkQuantity();
  } else if (el.id === "name") {
    message = checkName();
  } else if (el.id === "email") {
    message = checkEmail();
  } else if (el.id === "promo") {
    message = checkPromo();
  }

  el.setCustomValidity(message);
  document.getElementById("err-" + el.id).textContent = message;

  if (message === "") {
    el.setAttribute("aria-invalid", "false");
    el.className = el.value !== "" ? "is-valid" : "";
    return true;
  }
  el.setAttribute("aria-invalid", "true");
  el.className = "";
  return false;
}

function setText(id, text) {
  document.getElementById(id).textContent = text === "" ? DASH : text;
}

function updatePreview() {
  const chosenEvent = findById(EVENTS, eventEl.value);
  const type = findById(TYPES, typeEl.value);
  const promo = findById(PROMOS, promoEl.value.trim().toUpperCase());
  const qty = Number(quantityEl.value);

  setText("pvEvent", chosenEvent !== null ? chosenEvent.name : "");
  setText("pvDate", dateEl.value);
  setText("pvType", type !== null ? type.name : "");
  setText("pvQty", qty > 0 ? qty : "");
  setText("pvName", nameEl.value.trim());
  setText("pvEmail", emailEl.value.trim());
  setText("pvDiscount", promo !== null ? promo.percent + "% (" + promo.id + ")" : "");

  if (type !== null && qty > 0) {
    setText("pvTotal", money(getTotal(type, qty, promo)));
  } else {
    setText("pvTotal", "");
  }
  const hint = document.getElementById("hint-type");
  hint.textContent = type !== null ? "Seats left for " + type.name + ": " + type.seats : "";
}

function fillEvents() {
  for (const item of EVENTS) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    eventEl.appendChild(option);
  }
}

function fillTypes() {
  typeEl.textContent = "";
  const first = document.createElement("option");
  first.value = "";
  first.textContent = "Choose a type…";
  typeEl.appendChild(first);
  for (const item of TYPES) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name + " – $" + item.price + " (" + item.seats + " left)";
    typeEl.appendChild(option);
  }
}

function addRow(list, label, value) {
  const dt = document.createElement("dt");
  dt.textContent = label;
  const dd = document.createElement("dd");
  dd.textContent = value;
  list.appendChild(dt);
  list.appendChild(dd);
}

function renderTickets() {
  ticketsEl.textContent = "";
  if (booked.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No tickets yet. Book your first one!";
    ticketsEl.appendChild(empty);
  }
  for (let i = booked.length - 1; i >= 0; i--) {
    const b = booked[i];
    const box = document.createElement("article");
    box.className = "ticket";

    const title = document.createElement("h3");
    title.textContent = b.event + " – " + b.date;

    const code = document.createElement("p");
    code.className = "code";
    code.textContent = b.code;

    const list = document.createElement("dl");
    addRow(list, "Holder", b.name);
    addRow(list, "Email", b.email);
    addRow(list, "Type", b.type + " × " + b.qty);
    addRow(list, "Paid", b.total);

    box.appendChild(title);
    box.appendChild(code);
    box.appendChild(list);
    ticketsEl.appendChild(box);
  }
}

function makeCode() {
  let code = "TKT-";
  for (let i = 0; i < CODE_LENGTH; i++) {
    const index = randInt(0, CODE_CHARS.length - 1);
    code += CODE_CHARS.slice(index, index + 1);
  }
  return code;
}


form.addEventListener("input", function () {
  updatePreview();
  for (const el of fields) {
    if (el.dataset.touched === "1") {
      validateField(el);
    }
  }
});

for (const el of fields) {
  el.addEventListener("blur", function () {
    el.dataset.touched = "1";
    validateField(el);
  });
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  let errors = 0;
  let firstInvalid = null;
  for (const el of fields) {
    el.dataset.touched = "1";
    if (!validateField(el)) {
      errors++;
      if (firstInvalid === null) {
        firstInvalid = el;
      }
    }
  }

  if (errors > 0) {
    summary.textContent = "Please fix " + errors + " error(s) below.";
    summary.className = "msg error";
    firstInvalid.focus();
    return;
  }

  const type = findById(TYPES, typeEl.value);
  const promo = findById(PROMOS, promoEl.value.trim().toUpperCase());
  const qty = Number(quantityEl.value);
  const ticket = {
    code: makeCode(),
    event: findById(EVENTS, eventEl.value).name,
    date: dateEl.value,
    name: nameEl.value.trim(),
    email: emailEl.value.trim(),
    type: type.name,
    qty: qty,
    total: money(getTotal(type, qty, promo))
  };
  booked.push(ticket);
  type.seats = type.seats - qty;

  form.reset();
  for (const el of fields) {
    el.removeAttribute("data-touched");
    el.removeAttribute("aria-invalid");
    el.className = "";
    document.getElementById("err-" + el.id).textContent = "";
  }
  summary.textContent = "Success! Your booking code is " + ticket.code + ".";
  summary.className = "msg success";

  fillTypes();
  updatePreview();
  renderTickets();
});

fillEvents();
fillTypes();
updatePreview();
renderTickets();
