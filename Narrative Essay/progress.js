let page = 0; // current page
let genreColors = {
  "RPG": [200, 100, 255],
  "Strategy": [100, 200, 250],
  "Fighting": [255, 100, 100],
  "Sandbox": [255, 200, 100],
  "Adventure": [100, 255, 150]
};

// Images removed for in-canvas views; cover handles static images
let gameImages = {}; // kept as empty object for compatibility

let gamingData = [
  {day: "Mon", game: "Fire Emblem", genre: "Strategy", hours: 2, moodBefore: 2, moodAfter: 4},
  {day: "Tue", game: "Persona 5", genre: "RPG", hours: 3, moodBefore: 3, moodAfter: 4},
  {day: "Wed", game: "Smash Bros", genre: "Fighting", hours: 1, moodBefore: 4, moodAfter: 5},
  {day: "Thu", game: "Minecraft", genre: "Sandbox", hours: 4, moodBefore: 2, moodAfter: 3},
  {day: "Fri", game: "Zelda", genre: "Adventure", hours: 5, moodBefore: 3, moodAfter: 5},
  {day: "Sat", game: "Final Fantasy", genre: "RPG", hours: 6, moodBefore: 2, moodAfter: 3},
  {day: "Sun", game: "Persona 5", genre: "RPG", hours: 2, moodBefore: 3, moodAfter: 5}
];

// no preload

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent("canvas-container");
  textAlign(CENTER, CENTER);
}

function draw() {
  background(30);

  if (page === 0) {
    drawOverview();
  } else if (page === 1) {
    drawGenres();
  } else if (page === 2) {
    drawMoodScatter();
  }

  drawHud();
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    page = (page + 1) % 3;
  } else if (keyCode === LEFT_ARROW) {
    page = (page - 1 + 3) % 3;
  }
}

// PAGE 1: Bar chart of hours per day
function drawOverview() {
  fill(255);
  textSize(20);
  text("Gaming Time per Day", width/2, 30);
  drawSubtitle("How much do I play each day?");

  let barWidth = width / (gamingData.length + 1);

  for (let i = 0; i < gamingData.length; i++) {
    let d = gamingData[i];
    let barHeight = d.hours * 40;
    let x = (i+1) * barWidth;
    let y = height - barHeight - 50;

    fill(genreColors[d.genre]);
    rect(x, y, barWidth * 0.6, barHeight);

    // day labels
    fill(255);
    textSize(12);
    text(d.day, x + barWidth*0.3, height - 30);

    // label on bar
    fill(230);
    textSize(12);
    text(`${d.hours}h`, x + barWidth*0.3, y - 12);

    // hover interaction
    if (mouseX > x && mouseX < x + barWidth*0.6 && mouseY > y && mouseY < y+barHeight) {
      drawTooltip(`${d.day}: ${d.game} — ${d.hours} hrs`);
      drawGameBadge(width/2, 120, d.game);
    }
  }
}

// PAGE 2: Genre Breakdown (pie chart)
function drawGenres() {
  fill(255);
  textSize(20);
  text("Gaming by Genre", width/2, 30);
  drawSubtitle("Which genres take most of my time?");

  let genreCount = {};
  for (let d of gamingData) {
    if (!genreCount[d.genre]) genreCount[d.genre] = 0;
    genreCount[d.genre] += d.hours;
  }

  let genres = Object.keys(genreCount);
  let total = Object.values(genreCount).reduce((a,b)=>a+b,0);

  let angleStart = 0;
  for (let g of genres) {
    let fraction = genreCount[g] / total;
    let angleEnd = angleStart + fraction * TWO_PI;

    fill(genreColors[g]);
    arc(width/2, height/2, 300, 300, angleStart, angleEnd, PIE);

    // label percentage
    let mid = (angleStart + angleEnd) / 2;
    let rx = width/2 + cos(mid) * 180;
    let ry = height/2 + sin(mid) * 180;
    fill(240);
    textSize(12);
    text(`${Math.round(fraction*100)}%`, rx, ry);

    angleStart = angleEnd;
  }

  // legend
  const legendX = width - 260;
  let yOffset = 100;
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(14);
  text("Legend", legendX, yOffset - 10);
  for (let g of genres) {
    fill(genreColors[g]);
    rect(legendX, yOffset, 18, 18);
    fill(255);
    text(`${g}: ${genreCount[g]} hrs`, legendX + 26, yOffset + 9);
    yOffset += 26;
  }
  textAlign(CENTER, CENTER);
}

// PAGE 3: Mood vs Hours Scatterplot
function drawMoodScatter() {
  fill(255);
  textSize(20);
  text("Mood Change vs Hours", width/2, 30);
  drawSubtitle("Does longer play time change my mood?");

  // axis
  stroke(150);
  line(100, height-100, width-100, height-100); // x-axis
  line(100, height-100, 100, 100); // y-axis
  noStroke();

  // axis labels
  fill(180);
  textSize(12);
  textAlign(CENTER, CENTER);
  text("Hours Played", (width/2), height - 75);
  push();
  translate(55, height/2);
  rotate(-HALF_PI);
  text("Mood Δ (after − before)", 0, 0);
  pop();

  for (let d of gamingData) {
    let x = map(d.hours, 0, 6, 120, width-120);
    let y = map(d.moodAfter - d.moodBefore, -2, 3, height-120, 120);

    if (d.moodAfter > d.moodBefore) {
      fill(100, 255, 100); // positive mood
    } else {
      fill(255, 100, 100); // negative mood
    }

    ellipse(x, y, 20, 20);

    // hover interaction
    if (dist(mouseX, mouseY, x, y) < 10) {
      drawTooltip(`${d.game}: ${d.hours} hrs, Mood ${d.moodBefore}→${d.moodAfter}`);
      drawGameBadge(width/2, 120, d.game);
    }
  }
}

// Heads-up display: page indicator + instructions
function drawHud() {
  // instructions
  fill(200);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("← → to switch pages", width/2, height - 20);

  // page indicator
  const totalPages = 3;
  const indicator = `${page + 1}/${totalPages}`;
  fill(160);
  textSize(12);
  textAlign(RIGHT, BOTTOM);
  text(indicator, width - 16, height - 16);
  textAlign(CENTER, CENTER);
}

// Subtitle helper
function drawSubtitle(str) {
  fill(180);
  textSize(14);
  text(str, width/2, 52);
}

// Simple tooltip centered near top
function drawTooltip(str) {
  const paddingX = 10;
  const paddingY = 6;
  textSize(14);
  const tw = textWidth(str);
  const boxW = tw + paddingX * 2;
  const boxH = 24 + paddingY * 2;
  const bx = width/2 - boxW/2;
  const by = 70;
  noStroke();
  fill(0, 180);
  rect(bx, by, boxW, boxH, 6);
  fill(255);
  textAlign(CENTER, CENTER);
  text(str, width/2, by + boxH/2);
}

// Draws a small badge with the game's initials as a lightweight "image"
function drawGameBadge(cx, cy, gameName) {
  const initials = gameName
    .split(/\s+/)
    .map(s => s[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
  const w = 120;
  const h = 40;
  noStroke();
  fill(20, 20, 20, 220);
  rect(cx - w/2, cy - h/2, w, h, 8);
  // draw image if available
  fill(255);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(initials + " — " + gameName, cx, cy);
}
