const WIP_LIMIT = 3; 
const DOING = 1;     

const COLUMNS = [
  { id: "todo", title: "To do" },
  { id: "doing", title: "In progress" },
  { id: "done", title: "Done" }
];
const PRIORITY_NAMES = ["", "Low", "Medium", "High"];


const tasks = [
  { id: 1, title: "Design festival poster", tag: "design", priority: 3, hours: 6, urgent: true, column: 0 },
  { id: 2, title: "Book the main stage", tag: "logistics", priority: 3, hours: 3, urgent: true, column: 1 },
  { id: 3, title: "Write press release", tag: "marketing", priority: 2, hours: 2, urgent: false, column: 0 },
  { id: 4, title: "Sell early-bird tickets", tag: "marketing", priority: 2, hours: 5, urgent: false, column: 1 },
  { id: 5, title: "Hire sound engineer", tag: "logistics", priority: 3, hours: 4, urgent: false, column: 0 },
  { id: 6, title: "Create Instagram teasers", tag: "design", priority: 1, hours: 3, urgent: false, column: 0 },
  { id: 7, title: "Order merch T-shirts", tag: "logistics", priority: 1, hours: 2, urgent: false, column: 0 },
  { id: 8, title: "Build ticket website", tag: "dev", priority: 3, hours: 12, urgent: true, column: 2 },
  { id: 9, title: "Set up QR check-in", tag: "dev", priority: 2, hours: 8, urgent: false, column: 0 },
  { id: 10, title: "Pick the playlist", tag: "music", priority: 1, hours: 2, urgent: false, column: 2 },
  { id: 11, title: "Rehearsal schedule", tag: "music", priority: 2, hours: 3, urgent: false, column: 0 },
  { id: 12, title: "Print wristbands", tag: "logistics", priority: 1, hours: 1, urgent: false, column: 0 }
];

let query = "";
let filterTag = "all";
let sortMode = "none";

const boardEl = document.getElementById("board");
const searchEl = document.getElementById("search");
const tagEl = document.getElementById("filterTag");
const sortEl = document.getElementById("sortBy");
const messageEl = document.getElementById("message");
const progressEl = document.getElementById("progress");
const progressText = document.getElementById("progressText");
const hoursLeftEl = document.getElementById("hoursLeft");

function say(text, type) {
  messageEl.textContent = text;
  messageEl.className = "msg " + type;
}

function countIn(column) {
  let count = 0;
  for (const task of tasks) {
    if (task.column === column) {
      count++;
    }
  }
  return count;
}

function hoursLeft() {
  let sum = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].column !== COLUMNS.length - 1) {
      sum += tasks[i].hours;
    }
  }
  return sum;
}

function getColumnTasks(column) {
  const list = [];
  for (const task of tasks) {
    const tagOk = filterTag === "all" || task.tag === filterTag;
    const textOk = task.title.toLowerCase().includes(query.trim().toLowerCase());
    if (task.column === column && tagOk && textOk) {
      list.push(task);
    }
  }
  return list;
}

function sortByPriority(list) {
  if (sortMode === "none") {
    return list;
  }
  let levels = [1, 2, 3];
  if (sortMode === "desc") {
    levels = [3, 2, 1];
  }
  const result = [];
  for (const level of levels) {
    for (const task of list) {
      if (task.priority === level) {
        result.push(task);
      }
    }
  }
  return result;
}

function makeButton(label, dir, task, disabled) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn";
  button.textContent = label;
  button.setAttribute("aria-label", "Move " + task.title + " " + (dir === -1 ? "left" : "right"));
  button.dataset.action = "move";
  button.dataset.dir = dir;
  button.dataset.id = task.id;
  button.disabled = disabled;
  return button;
}

function addBadge(parent, text, extraClass) {
  const badge = document.createElement("span");
  badge.className = "badge " + extraClass;
  badge.textContent = text;
  parent.appendChild(badge);
}

function createCard(task) {
  const card = document.createElement("article");
  card.className = "card p" + task.priority;

  const title = document.createElement("h3");
  title.textContent = task.title;

  const meta = document.createElement("p");
  meta.className = "meta";
  addBadge(meta, "#" + task.tag, "");
  addBadge(meta, PRIORITY_NAMES[task.priority] + " priority", "");
  addBadge(meta, task.hours + " h", "");
  if (task.urgent) {
    addBadge(meta, "Urgent", "urgent");
  }

  const actions = document.createElement("div");
  actions.className = "actions";
  actions.appendChild(makeButton("←", -1, task, task.column === 0));
  actions.appendChild(makeButton("→", 1, task, task.column === COLUMNS.length - 1));

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(actions);
  return card;
}

function render() {
  const filterActive = filterTag !== "all" || query.trim() !== "";

  for (let c = 0; c < COLUMNS.length; c++) {
    const box = document.getElementById("col-" + COLUMNS[c].id);
    const countEl = document.getElementById("count-" + COLUMNS[c].id);
    const wrapEl = document.getElementById("wrap-" + COLUMNS[c].id);
    const list = sortByPriority(getColumnTasks(c));

    box.textContent = "";
    if (list.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = filterActive ? "Nothing found for this search or filter." : "No cards here yet.";
      box.appendChild(empty);
    }
    for (const task of list) {
      box.appendChild(createCard(task));
    }

    countEl.textContent = countIn(c);
    wrapEl.className = "column";
    if (c === DOING) {
      countEl.textContent = countIn(c) + " / " + WIP_LIMIT;
      if (countIn(c) >= WIP_LIMIT) {
        wrapEl.className = "column full";
      }
    }
  }

  const done = countIn(COLUMNS.length - 1);
  progressEl.max = tasks.length;
  progressEl.value = done;
  progressText.textContent = done + " of " + tasks.length;
  hoursLeftEl.textContent = hoursLeft();
}

function move(id, dir) {
  let task = null;
  for (const item of tasks) {
    if (item.id === id) {
      task = item;
    }
  }
  const to = task.column + dir;
  if (to < 0 || to >= COLUMNS.length) {
    return;
  }

  if (to === DOING && countIn(DOING) >= WIP_LIMIT) {
    say('Blocked: "In progress" already has ' + WIP_LIMIT + " cards. Finish one first.", "error");
    return;
  }

  task.column = to;  
  say('"' + task.title + '" moved to "' + COLUMNS[to].title + '".', "success");
  render();          

boardEl.addEventListener("click", function (event) {
  const target = event.target;
  if (target.tagName === "BUTTON" && target.dataset.action === "move") {
    move(Number(target.dataset.id), Number(target.dataset.dir));
  }
});

searchEl.addEventListener("input", function () {
  query = searchEl.value;
  render();
});
tagEl.addEventListener("change", function () {
  filterTag = tagEl.value;
  render();
});
sortEl.addEventListener("change", function () {
  sortMode = sortEl.value;
  render();
});

function fillTags() {
  const tags = ["all"];
  for (const task of tasks) {
    if (!tags.includes(task.tag)) {
      tags.push(task.tag);
    }
  }
  for (const tag of tags) {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag === "all" ? "All tags" : "#" + tag;
    tagEl.appendChild(option);
  }
}

fillTags();
render();
say("Move cards with the arrow buttons.", "");
