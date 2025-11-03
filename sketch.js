let questions;
let currentQuestions = [];
let currentQuestion = 0;
let score = 0;
let gameState = 'start';
let buttons = [];
let feedback = '';

// 在全域變數區域添加新的變數
let particles = [];
let gradientColors;

function preload() {
  questions = loadTable('questions.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  
  // 初始化漸層顏色
  gradientColors = [
    color(200, 230, 255),
    color(230, 200, 255)
  ];
  
  // 初始化背景粒子
  for(let i = 0; i < 50; i++) {
    particles.push(new Particle());
  }
  
  // 重新配置按鈕位置和大小
  layoutButtons();
}

// 當視窗大小改變時調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // 重新初始化粒子
  particles = [];
  for(let i = 0; i < 50; i++) {
    particles.push(new Particle());
  }
  
  // 重新計算按鈕位置和大小
  layoutButtons();
}

function layoutButtons() {
  let buttonWidth = windowWidth * 0.4;
  let buttonHeight = windowHeight * 0.08;
  let startY = windowHeight * 0.4;
  let spacing = buttonHeight * 1.5;
  
  for(let i = 0; i < 4; i++) {
    buttons[i] = {
      x: windowWidth/2 - buttonWidth/2,
      y: startY + i * spacing,
      w: buttonWidth,
      h: buttonHeight
    };
  }
}

function draw() {
  // 繪製漸層背景
  drawGradientBackground();
  
  // 更新和顯示所有粒子（在背景之上，但在 UI 之下）
  for(let particle of particles) {
    particle.update();
    particle.display();
  }
  
  // (不要呼叫 background(...)，否則會蓋掉漸層與粒子)
  
  switch(gameState) {
    case 'start':
      drawStartScreen();
      break;
    case 'quiz':
      drawQuizScreen();
      break;
    case 'result':
      drawResultScreen();
      break;
  }
}

function drawStartScreen() {
  textSize(windowWidth * 0.05);
  fill(60, 100, 200);
  text('知識測驗', windowWidth/2, windowHeight * 0.3);
  
  // 開始按鈕（動態位置）
  let btnW = windowWidth * 0.2;
  let btnH = windowHeight * 0.1;
  let btnX = windowWidth/2 - btnW/2;
  let btnY = windowHeight * 0.45;
  
  let isHover = mouseX > btnX && mouseX < btnX + btnW && 
                mouseY > btnY && mouseY < btnY + btnH;
  
  fill(isHover ? color(80, 180, 80, 220) : color(100, 200, 100, 200));
  rect(btnX, btnY, btnW, btnH, 15);
  
  fill(255);
  textSize(windowWidth * 0.025);
  text('開始測驗', windowWidth/2, windowHeight * 0.5);
}

function drawQuizScreen() {
  let q = currentQuestions[currentQuestion];
  if(!q) return;
  
  // 顯示題目進度
  textSize(windowWidth * 0.03);
  fill(60, 100, 200);
  text(`問題 ${currentQuestion + 1}/5`, windowWidth/2, windowHeight * 0.15);
  
  // 顯示題目
  textSize(windowWidth * 0.025);
  fill(40);
  text(q.question, windowWidth/2, windowHeight * 0.25);
  
  // 顯示選項按鈕
  for(let i = 0; i < 4; i++) {
    let btn = buttons[i];
    
    let isHover = mouseX > btn.x && mouseX < btn.x + btn.w && 
                  mouseY > btn.y && mouseY < btn.y + btn.h;
    
    fill(isHover ? color(80, 180, 80, 220) : color(100, 200, 100, 200));
    rect(btn.x, btn.y, btn.w, btn.h, 15);
    
    fill(255);
    textSize(windowWidth * 0.02);
    text(q.options[i], btn.x + btn.w/2, btn.y + btn.h/2);
  }
  
  // 修改回饋顯示位置到選項上方
  if(feedback) {
    textSize(windowWidth * 0.03);
    if(feedback.includes('對')) {
      fill(0, 180, 0);
    } else {
      fill(180, 0, 0);
    }
    text(feedback, windowWidth/2, windowHeight * 0.35);
  }
}

function drawResultScreen() {
  textSize(windowWidth * 0.04);
  fill(60, 100, 200);
  text('測驗完成！', windowWidth/2, windowHeight * 0.3);
  
  textSize(windowWidth * 0.03);
  text(`得分：${score}/5`, windowWidth/2, windowHeight * 0.4);
  
  let feedbackText = '';
  if(score === 5) {
    feedbackText = '太棒了！完美表現！✨';
  } else if(score >= 3) {
    feedbackText = '表現不錯，繼續加油！📚';
  } else {
    feedbackText = '需要更多練習，別氣餒！💪';
  }
  text(feedbackText, windowWidth/2, windowHeight * 0.5);
  
  // 重新開始按鈕（使用與畫面一致的位置）
  let btnW = windowWidth * 0.2;
  let btnH = windowHeight * 0.1;
  let btnX = windowWidth/2 - btnW/2;
  let btnY = windowHeight * 0.6;
  
  let isHover = mouseX > btnX && mouseX < btnX + btnW && 
                mouseY > btnY && mouseY < btnY + btnH;
  
  fill(isHover ? color(80, 180, 80, 220) : color(100, 200, 100, 200));
  rect(btnX, btnY, btnW, btnH, 15);
  
  fill(255);
  textSize(windowWidth * 0.025);
  text('再試一次', windowWidth/2, windowHeight * 0.65);
}

function mousePressed() {
  // 使用與畫面繪製一致的按鈕座標檢查點擊
  if(gameState === 'start') {
    let btnW = windowWidth * 0.2;
    let btnH = windowHeight * 0.1;
    let btnX = windowWidth/2 - btnW/2;
    let btnY = windowHeight * 0.45;
    if(mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
      startQuiz();
    }
    return;
  }
  
  if(gameState === 'quiz') {
    // 檢查是否點擊任何選項按鈕
    for(let i = 0; i < 4; i++) {
      let btn = buttons[i];
      if(mouseX > btn.x && mouseX < btn.x + btn.w && 
         mouseY > btn.y && mouseY < btn.y + btn.h) {
        checkAnswer(i);
      }
    }
    return;
  }
  
  if(gameState === 'result') {
    let btnW = windowWidth * 0.2;
    let btnH = windowHeight * 0.1;
    let btnX = windowWidth/2 - btnW/2;
    let btnY = windowHeight * 0.6;
    if(mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
      resetQuiz();
    }
    return;
  }
}

function startQuiz() {
  gameState = 'quiz';
  score = 0;
  currentQuestion = 0;
  feedback = '';
  
  // 隨機選取5題
  let allQuestions = questions.getRows();
  currentQuestions = [];
  
  for(let i = 0; i < 5; i++) {
    let randomIndex = floor(random(allQuestions.length));
    let q = allQuestions[randomIndex];
    currentQuestions.push({
      question: q.getString('question'),
      options: [
        q.getString('option1'),
        q.getString('option2'),
        q.getString('option3'),
        q.getString('option4')
      ],
      answer: parseInt(q.getString('answer'))
    });
    allQuestions.splice(randomIndex, 1);
  }
}

function checkAnswer(choice) {
  let correct = currentQuestions[currentQuestion].answer === choice;
  
  if(correct) {
    score++;
    feedback = '答對了！';
  } else {
    feedback = '答錯了...';
  }
  
  setTimeout(() => {
    feedback = '';
    currentQuestion++;
    if(currentQuestion >= 5) {
      gameState = 'result';
    }
  }, 1000);
}

function resetQuiz() {
  gameState = 'start';
}

// 添加新的粒子類別
class Particle {
  constructor() {
    this.reset();
    this.y = random(height);
  }
  
  reset() {
    this.x = random(width);
    this.y = -20;
    this.speed = random(1, 3);
    this.size = random(10, 30);
    this.opacity = random(100, 200);
  }
  
  update() {
    this.y += this.speed;
    if(this.y > height + 20) {
      this.reset();
    }
  }
  
  display() {
    noStroke();
    fill(255, 255, 255, this.opacity);
    circle(this.x, this.y, this.size);
  }
}

// 添加漸層背景函數
function drawGradientBackground() {
  for(let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(gradientColors[0], gradientColors[1], inter);
    stroke(c);
    line(0, y, width, y);
  }
}
