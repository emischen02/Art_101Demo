// Lantern Journey – Expanded (p5.js)
// Fullscreen with Start Screen, Fireflies, 3 Scenes, Gems, Enemies, Health, Game Over

let player;
let scene = "forest";
let gameStarted = false;
let showReturnButton = false;
let gameOver = false;

// Fireflies for start screen
let fireflies = [];

// Game systems
const GEMS_PER_SCENE = 5; // you chose option A
let gems = [];            // current scene gems
let collectedGems = 0;

// Health
let maxHealth = 3;
let health = maxHealth;
let invulnerable = false;
let invulnTimer = 0;
const INVULN_TIME = 1000; // ms

// Enemies
let enemies = []; // per-scene active enemies

// Timing
let lastTime = 0;

// Setup canvas + initial objects
function setup() {
  createCanvas(windowWidth, windowHeight);
  resetPlayer();
  spawnFireflies();

  lastTime = millis();
}

// ---------- START / FIREFLIES ----------
function spawnFireflies() {
  fireflies = [];
  for (let i = 0; i < 30; i++) {
    fireflies.push({
      x: random(width),
      y: random(height),
      size: random(3, 7),
      speedX: random(-0.6, 0.6),
      speedY: random(-0.25, 0.25)
    });
  }
}

// ---------- MAIN LOOP ----------
function draw() {
  // compute delta for movement-based time if needed
  const now = millis();
  const dt = now - lastTime;
  lastTime = now;

  // handle invulnerability timer
  if (invulnerable) {
    invulnTimer -= dt;
    if (invulnTimer <= 0) {
      invulnerable = false;
    }
  }

  // start screen
  if (!gameStarted) {
    drawStartScreen();
    return;
  }

  // if game over, show game over screen
  if (gameOver) {
    drawGameOverScreen();
    return;
  }

  // scenes
  if (scene === "forest") drawForest();
  else if (scene === "ocean") drawOcean();
  else if (scene === "mountain") drawMountain();

  // HUD: health and gem count
  drawHUD();

  // player, movement, switching
  drawPlayer();
  movePlayer();
  updateEnemies(dt);
  checkCollisions();
  handleSceneSwitching();

  // return button (appears after reaching mountain summit)
  if (showReturnButton) drawReturnButton();
}

// ---------- START SCREEN DRAW ----------
function drawStartScreen() {
  background(20, 50, 80);

  // animate fireflies
  for (let f of fireflies) {
    fill(255, 220, 100, 200);
    noStroke();
    ellipse(f.x, f.y, f.size);
    f.x += f.speedX;
    f.y += f.speedY;

    // wrap or bounce
    if (f.x < -20) f.x = width + 20;
    if (f.x > width + 20) f.x = -20;
    if (f.y < -20) f.y = height + 20;
    if (f.y > height + 20) f.y = -20;
  }

  // flickering lantern glow behind title
  let glowSize = 120 + random(-12, 12);
  fill(255, 200, 120, 80);
  ellipse(width / 2, height / 2 - 80, glowSize * 2, glowSize);

  // Title
  fill(255, 220, 120);
  textAlign(CENTER);
  textSize(Math.max(28, width / 20));
  text("Lantern Journey", width / 2, height / 2 - 80);

  // Start Button
  const bw = 220, bh = 64;
  const bx = width / 2 - bw / 2, by = height / 2;
  fill(255);
  rect(bx, by, bw, bh, 12);
  fill(0);
  textSize(Math.max(14, width / 50));
  text("Start Adventure", width / 2, by + bh * 0.67);
}

// ---------- MOUSE PRESSED (Start / Return / Restart) ----------
function mousePressed() {
  // Start button
  if (!gameStarted && !gameOver) {
    const bw = 220, bh = 64;
    const bx = width / 2 - bw / 2, by = height / 2;
    if (mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh) {
      gameStarted = true;
      showReturnButton = false;
      collectedGems = 0;
      health = maxHealth;
      invulnerable = false;
      // on first start, spawn gems & enemies for scene
      enterScene(scene);
    }
    return;
  }

  // Return Home button (if shown)
  if (showReturnButton && !gameOver) {
    const rw = 200, rh = 60;
    const rx = width / 2 - rw / 2, ry = height - 100;
    if (mouseX > rx && mouseX < rx + rw && mouseY > ry && mouseY < ry + rh) {
      // Return to home
      gameStarted = false;
      scene = "forest";
      resetPlayer();
      collectedGems = 0;
      health = maxHealth;
      invulnerable = false;
      showReturnButton = false;
      spawnFireflies();
    }
    return;
  }

  // Restart button on Game Over
  if (gameOver) {
    const rw = 200, rh = 60;
    const rx = width / 2 - rw / 2, ry = height / 2 + 60;
    if (mouseX > rx && mouseX < rx + rw && mouseY > ry && mouseY < ry + rh) {
      // restart game
      gameOver = false;
      gameStarted = true;
      scene = "forest";
      resetAll();
      enterScene(scene);
    }
    return;
  }
}

// ---------- PLAYER ----------
function resetPlayer() {
  player = {
    x: width / 2,
    y: height - 120,
    size: 28,
    speed: Math.max(2.2, width / 500) // scale a bit with screen
  };
}

function drawPlayer() {
  if (!gameStarted) return;
  push();
  // slight flicker when invulnerable
  if (invulnerable && floor(millis() / 100) % 2 === 0) tint(255, 120);
  else noTint();

  noStroke();
  fill(255, 230, 150, 120); // lantern glow
  ellipse(player.x, player.y, 60, 60);

  fill(240);
  ellipse(player.x, player.y, player.size);

  fill(255, 220, 120);
  rect(player.x + 12, player.y, 10, 15, 3);
  pop();
}

function movePlayer() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) player.x -= player.speed; // A
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) player.x += player.speed; // D
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) player.y -= player.speed; // W
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) player.y += player.speed; // S

  player.x = constrain(player.x, 10, width - 10);
  player.y = constrain(player.y, 10, height - 10);
}

// ---------- SCENE ENTRY (spawn gems & enemies) ----------
function enterScene(s) {
  gems = [];
  enemies = [];
  // spawn gems: avoid very close to edges and player
  for (let i = 0; i < GEMS_PER_SCENE; i++) {
    let gx, gy, attempts = 0;
    do {
      gx = random(60, width - 60);
      gy = random(120, height - 120);
      attempts++;
    } while ((dist(gx, gy, player.x, player.y) < 80 || overlappingExistingGem(gx, gy)) && attempts < 80);
    gems.push({ x: gx, y: gy, r: 12, collected: false });
  }

  // spawn enemies by scene
  if (s === "forest") {
    // wolves: patrol horizontally in rows
    for (let i = 0; i < 4; i++) {
      let ex = random(80, width - 80);
      let ey = random(height / 2, height - 100);
      enemies.push({ type: "wolf", x: ex, y: ey, w: 36, h: 24, dir: random() > 0.5 ? 1 : -1, speed: random(0.6, 1.6) });
    }
  } else if (s === "ocean") {
    // jellyfish: float vertically
    for (let i = 0; i < 4; i++) {
      let ex = random(80, width - 80);
      let ey = random(height / 2, height - 80);
      enemies.push({ type: "jelly", x: ex, y: ey, w: 28, h: 28, offset: random(0, 1000), speed: random(0.4, 1.0) });
    }
  } else if (s === "mountain") {
    // rolling rocks: start near the top and roll down
    for (let i = 0; i < 4; i++) {
      let ex = random(60, width - 60);
      let ey = random(40, height / 3);
      enemies.push({ type: "rock", x: ex, y: ey, w: 28, h: 28, speedY: random(1.2, 2.2) });
    }
  }
}

function overlappingExistingGem(x, y) {
  for (let g of gems) {
    if (dist(g.x, g.y, x, y) < (g.r + 24)) return true;
  }
  return false;
}

// ---------- DRAW SCENES ----------
function drawForest() {
  background(20, 60, 30);
  // trees
  for (let i = 0; i < width; i += 80) {
    fill(30, 100, 40);
    triangle(i, height, i + 40, height / 2, i + 80, height);
  }
  fill(200);
  textAlign(CENTER);
  textSize(Math.max(18, width / 40));
  text("Scene 1: Forest – Move UP to escape.", width / 2, 40);

  // draw gems
  drawGems();

  // draw enemies
  drawEnemies();
}

function drawOcean() {
  background(30, 80, 140);
  for (let y = height - 150; y < height; y += 20) {
    fill(50, 120, 200);
    ellipse((frameCount * 0.8) % width, y, 200, 20);
    ellipse((frameCount * 1.1) % width, y + 10, 250, 25);
  }
  fill(240);
  textAlign(CENTER);
  textSize(Math.max(18, width / 40));
  text("Scene 2: Ocean – Move RIGHT to reach the mountains.", width / 2, 40);

  drawGems();
  drawEnemies();
}

function drawMountain() {
  background(80, 60, 40);
  fill(120, 80, 50);
  triangle(width / 4, height, width / 2, height / 3, 3 * width / 4, height);
  triangle(0, height, width / 4, height / 2.2, width / 2, height);
  triangle(width / 2, height, 3 * width / 4, height / 3.5, width, height);
  fill(255);
  textAlign(CENTER);
  textSize(Math.max(18, width / 40));
  text("Scene 3: Mountain – Move UP to reach the summit.", width / 2, 40);

  drawGems();
  drawEnemies();
}

// ---------- GEMS ----------
function drawGems() {
  for (let g of gems) {
    if (g.collected) continue;
    push();
    // glow
    noStroke();
    fill(255, 200, 120, 80);
    ellipse(g.x, g.y, g.r * 2.2);
    // gem
    stroke(255);
    strokeWeight(2);
    fill(180, 240, 255);
    ellipse(g.x, g.y, g.r, g.r * 0.8);
    pop();
  }
}

// ---------- ENEMIES ----------
function drawEnemies() {
  for (let e of enemies) {
    if (e.type === "wolf") drawWolf(e);
    else if (e.type === "jelly") drawJelly(e);
    else if (e.type === "rock") drawRock(e);
  }
}

function drawWolf(e) {
  push();
  translate(e.x, e.y);
  // body
  fill(120, 80, 40);
  noStroke();
  ellipse(0, 0, e.w, e.h);
  // head
  fill(100, 60, 30);
  ellipse(e.w * 0.24 * (e.dir), -4, e.w * 0.5, e.h * 0.6);
  pop();
}

function drawJelly(e) {
  push();
  translate(e.x, e.y + sin((frameCount * 0.02) + e.offset) * 12);
  noStroke();
  fill(180, 120, 220, 200);
  ellipse(0, 0, e.w, e.h * 0.9);
  // tentacles
  stroke(180, 120, 220, 160);
  for (let i = -2; i <= 2; i++) {
    line(i * 6, e.h * 0.4, i * 6 + sin(frameCount * 0.05 + i) * 6, e.h * 0.9);
  }
  pop();
}

function drawRock(e) {
  push();
  translate(e.x, e.y);
  noStroke();
  fill(160);
  ellipse(0, 0, e.w, e.h);
  pop();
}

// ---------- ENEMY UPDATE (movement) ----------
function updateEnemies(dt) {
  for (let e of enemies) {
    if (e.type === "wolf") {
      e.x += e.dir * e.speed;
      // bounce at edges
      if (e.x < 40) e.dir = 1;
      if (e.x > width - 40) e.dir = -1;
    } else if (e.type === "jelly") {
      // vertical bobbing handled in draw via sine; optionally drift horizontally
      e.x += sin(frameCount * 0.01 + e.offset) * 0.15;
      if (e.x < 40) e.x = 40;
      if (e.x > width - 40) e.x = width - 40;
    } else if (e.type === "rock") {
      e.y += e.speedY;
      if (e.y > height + 40) {
        // reset rock to top with new x
        e.y = random(-80, -20);
        e.x = random(60, width - 60);
        e.speedY = random(1.2, 2.2);
      }
    }
  }
}

// ---------- COLLISIONS: gems & enemies ----------
function checkCollisions() {
  // gem collection
  for (let g of gems) {
    if (g.collected) continue;
    if (dist(player.x, player.y, g.x, g.y) < (g.r + player.size / 2)) {
      g.collected = true;
      collectedGems++;
      // small visual feedback: briefly enlarge player lantern
      // (we won't implement animation here to keep code concise)
    }
  }

  // enemy collisions
  if (!invulnerable) {
    for (let e of enemies) {
      let ex = e.x;
      let ey = e.y;
      if (e.type === "jelly") ey += sin((frameCount * 0.02) + e.offset) * 12;
      if (dist(player.x, player.y, ex, ey) < max(e.w, e.h, player.size) * 0.6) {
        takeDamage();
        break;
      }
    }
  }
}

function takeDamage() {
  health = max(0, health - 1);
  invulnerable = true;
  invulnTimer = INVULN_TIME;
  // push player back slightly for feedback
  player.y += 40;
  if (health <= 0) {
    triggerGameOver();
  }
}

// ---------- SCENE SWITCHING ----------
function handleSceneSwitching() {
  // Forest → Ocean
  if (scene === "forest" && player.y < 40) {
    scene = "ocean";
    player.y = height - 80;
    enterScene(scene);
  }

  // Ocean → Mountain
  if (scene === "ocean" && player.x > width - 40) {
    scene = "mountain";
    player.x = 60;
    enterScene(scene);
  }

  // Mountain → Ending (reach top)
  if (scene === "mountain" && player.y < 40) {
    endingScene(); // draw ending right away
    showReturnButton = true;
    // ensure enemies/gems stop affecting player (optional)
    enemies = [];
    gems = [];
  }
}

// ---------- HUD ----------
function drawHUD() {
  // health hearts top-left
  for (let i = 0; i < maxHealth; i++) {
    let hx = 20 + i * 28;
    let hy = 30;
    if (i < health) fill(220, 40, 40);
    else fill(120, 120, 120);
    noStroke();
    ellipse(hx, hy, 18);
  }

  // gem count top-right
  textAlign(RIGHT);
  textSize(18);
  fill(240);
  text("Gems: " + collectedGems, width - 20, 34);
}

// ---------- ENDING ----------
function endingScene() {
  background(255, 230, 160);
  fill(50);
  textAlign(CENTER);
  textSize(Math.max(18, width / 40));
  text("He reached the summit.\nHis lantern glows with courage.", width / 2, height / 2 - 20);

  textSize(Math.max(16, width / 60));
  text("Gems collected: " + collectedGems, width / 2, height / 2 + 40);
}

// ---------- RETURN BUTTON ----------
function drawReturnButton() {
  const rw = 200, rh = 60;
  const rx = width / 2 - rw / 2, ry = height - 100;
  fill(255);
  rect(rx, ry, rw, rh, 10);
  fill(0);
  textAlign(CENTER);
  textSize(Math.max(14, width / 50));
  text("Return Home", width / 2, ry + rh * 0.6);
}

// ---------- GAME OVER ----------
function triggerGameOver() {
  gameOver = true;
  gameStarted = false;
}

function drawGameOverScreen() {
  background(10, 10, 10);
  fill(230);
  textAlign(CENTER);
  textSize(Math.max(22, width / 30));
  text("Game Over", width / 2, height / 2 - 20);
  textSize(Math.max(14, width / 60));
  text("You lost all your hearts.", width / 2, height / 2 + 10);

  // Restart button
  const rw = 200, rh = 60;
  const rx = width / 2 - rw / 2, ry = height / 2 + 60;
  fill(255);
  rect(rx, ry, rw, rh, 10);
  fill(0);
  textSize(Math.max(14, width / 50));
  text("Restart", width / 2, ry + rh * 0.6);
}

// ---------- RESET ALL (for restart) ----------
function resetAll() {
  resetPlayer();
  scene = "forest";
  collectedGems = 0;
  health = maxHealth;
  invulnerable = false;
  showReturnButton = false;
  spawnFireflies();
  enterScene(scene);
}

// ---------- WINDOW RESIZE ----------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // reposition player reasonably on resize
  player.x = constrain(player.x, 10, width - 10);
  player.y = constrain(player.y, 10, height - 10);
  // re-spawn fireflies if on start screen
  if (!gameStarted && !gameOver) {
    spawnFireflies();
  }
}