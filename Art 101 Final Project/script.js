// Lantern Journey – 3 Scene Adventure Game (p5.js) - Fullscreen with Animated Start Screen
let player;
let scene = "forest";
let gameStarted = false;
let showReturnButton = false;

// Fireflies for start screen
let fireflies = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  resetPlayer();
  
  // Create 30 fireflies
  for (let i = 0; i < 30; i++) {
    fireflies.push({
      x: random(width),
      y: random(height),
      size: random(3, 7),
      speedX: random(-1, 1),
      speedY: random(-0.5, 0.5)
    });
  }
}

function draw() {
  background(0);

  if (!gameStarted) {
    drawStartScreen();
    return;
  }

  if (scene === "forest") drawForest();
  if (scene === "ocean") drawOcean();
  if (scene === "mountain") drawMountain();

  drawPlayer();
  movePlayer();
  handleSceneSwitching();

  if (showReturnButton) drawReturnButton();
}

// ------------------------
// START SCREEN
// ------------------------
function drawStartScreen() {
  background(20, 50, 80);

  // Animate fireflies
  for (let f of fireflies) {
    fill(255, 220, 100, 200);
    noStroke();
    ellipse(f.x, f.y, f.size);
    f.x += f.speedX;
    f.y += f.speedY;

    // Bounce off edges
    if (f.x < 0 || f.x > width) f.speedX *= -1;
    if (f.y < 0 || f.y > height) f.speedY *= -1;
  }

  // Flickering lantern glow behind title
  let glowSize = 100 + random(-10, 10);
  fill(255, 200, 120, 80);
  ellipse(width / 2, height / 2 - 80, glowSize * 2, glowSize);

  // Title
  fill(255, 220, 120);
  textAlign(CENTER);
  textSize(60);
  text("Lantern Journey", width / 2, height / 2 - 80);

  // Start Button
  fill(255);
  rect(width / 2 - 100, height / 2, 200, 60, 10);
  fill(0);
  textSize(24);
  text("Start Adventure", width / 2, height / 2 + 40);
}

function mousePressed() {
  if (!gameStarted) {
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
        mouseY > height / 2 && mouseY < height / 2 + 60) {
      gameStarted = true;
      showReturnButton = false;
    }
  }

  if (showReturnButton) {
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
        mouseY > height - 100 && mouseY < height - 40) {
      // Return to home
      gameStarted = false;
      scene = "forest";
      resetPlayer();
      showReturnButton = false;
    }
  }
}

// ------------------------
// PLAYER
// ------------------------
function resetPlayer() {
  player = {
    x: width / 2,
    y: height - 60,
    size: 28,
    speed: 2.2
  };
}

function drawPlayer() {
  if (!gameStarted) return;
  noStroke();
  fill(255, 230, 150, 120);
  ellipse(player.x, player.y, 60, 60);
  fill(240);
  ellipse(player.x, player.y, player.size);
  fill(255, 220, 120);
  rect(player.x + 12, player.y, 10, 15, 3);
}

function movePlayer() {
  if (!gameStarted) return;
  if (keyIsDown(LEFT_ARROW)) player.x -= player.speed;
  if (keyIsDown(RIGHT_ARROW)) player.x += player.speed;
  if (keyIsDown(UP_ARROW)) player.y -= player.speed;
  if (keyIsDown(DOWN_ARROW)) player.y += player.speed;

  player.x = constrain(player.x, 10, width - 10);
  player.y = constrain(player.y, 10, height - 10);
}

// ------------------------
// SCENE SWITCHING
// ------------------------
function handleSceneSwitching() {
  if (!gameStarted) return;

  if (scene === "forest" && player.y < 20) {
    scene = "ocean";
    player.y = height - 30;
  }
  if (scene === "ocean" && player.x > width - 20) {
    scene = "mountain";
    player.x = 40;
  }
  if (scene === "mountain" && player.y < 20) {
    endingScene();
    showReturnButton = true; // show return button after reaching summit
  }
}

// ------------------------
// SCENES
// ------------------------
function drawForest() {
  background(20, 60, 30);
  for (let i = 0; i < width; i += 80) {
    fill(30, 100, 40);
    triangle(i, height, i + 40, height / 2, i + 80, height);
  }
  fill(200);
  textAlign(CENTER);
  textSize(24);
  text("Scene 1: Forest – Move UP to escape.", width / 2, 40);
}

function drawOcean() {
  background(30, 80, 140);
  for (let y = height - 150; y < height; y += 20) {
    fill(50, 120, 200);
    ellipse(frameCount % width, y, 200, 20);
    ellipse((frameCount * 1.5) % width, y + 10, 250, 25);
  }
  fill(240);
  textAlign(CENTER);
  textSize(24);
  text("Scene 2: Ocean – Move RIGHT to reach the mountains.", width / 2, 40);
}

function drawMountain() {
  background(80, 60, 40);
  fill(120, 80, 50);
  triangle(width / 4, height, width / 2, height / 3, 3 * width / 4, height);
  triangle(0, height, width / 4, height / 2.2, width / 2, height);
  triangle(width / 2, height, 3 * width / 4, height / 3.5, width, height);
  fill(255);
  textAlign(CENTER);
  textSize(24);
  text("Scene 3: Mountain – Move UP to reach the summit.", width / 2, 40);
}

// ------------------------
// ENDING
// ------------------------
function endingScene() {
  background(255, 230, 160);
  fill(50);
  textAlign(CENTER);
  textSize(28);
  text(
    "He reached the summit.\nHis lantern glows with courage.\nThe journey has changed him forever.",
    width / 2,
    height / 2
  );
}

// ------------------------
// RETURN BUTTON
// ------------------------
function drawReturnButton() {
  fill(255);
  rect(width / 2 - 100, height - 100, 200, 60, 10);
  fill(0);
  textAlign(CENTER);
  textSize(24);
  text("Return Home", width / 2, height - 60);
}

// ------------------------
// Resize canvas
// ------------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}