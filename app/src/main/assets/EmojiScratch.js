// 2020/12/22 Waync Cheng.
var viewTitle = document.getElementById("title");
var viewGame = document.getElementById("game");
var viewGameover = document.getElementById("gameover");

var btn = viewGame.getElementsByTagName("button");
var answer_index = -1;
var curr_cat = -1;

var width = 300, height = 300;
var c0 = document.getElementById("c0");
c0.width = width;
c0.height = height;
var ctx = c0.getContext("2d");

var c1 = document.createElement("canvas");
c1.width = width;
c1.height = height;
var ctx1 = c1.getContext("2d");

var elScore = document.getElementById("score");
var score = 0;
var quiz_prob_index, cur_cat_index, cur_quiz_index;

var elLife = document.getElementById("life");
var life = 3;
updateLife();

var new_game = false;
var mouse_down = false;
var last_x, last_y;

function getEventOffset(e) {
  if (e.offsetX) {
    return {x:e.offsetX, y:e.offsetY};
  }
  var el = e.target;
  var offset = {x:0, y:0};
  while (el.offsetParent) {
    offset.x += el.offsetLeft;
    offset.y += el.offsetTop;
    el = el.offsetParent;
  }
  offset.x = e.pageX - offset.x;
  offset.y = e.pageY - offset.y;
  return offset;
}

c0.onmousedown = function(e) {
  if (0 >= life) {
    return;
  }
  var off = getEventOffset(e);
  last_x = off.x;
  last_y = off.y;
  mouse_down = true;
}

c0.onmouseup = function(e) {
  mouse_down = false;
}

c0.onmousemove = function(e) {
  if (0 >= life) {
    return;
  }
  var off = getEventOffset(e);
  var x = off.x, y = off.y;
  if (mouse_down) {
    ctx1.strokeStyle = 'rgba(0,0,0,1)';
    ctx1.globalCompositeOperation = 'destination-out';
    ctx1.lineWidth = 18;
    ctx1.lineCap = 'round';
    ctx1.beginPath();
    ctx1.moveTo(last_x, last_y);
    ctx1.lineTo(x, y);
    ctx1.stroke();
    last_x = x;
    last_y = y;
    updateCanvas();
    new_game = false;
  }
}

function touchHandler(event) {
  // https://stackoverflow.com/questions/1517924/javascript-mapping-touch-events-to-mouse-events
  var touches = event.changedTouches,
      first = touches[0],
      type = "";
  switch(event.type)
  {
    case "touchstart": type = "mousedown"; break;
    case "touchmove":  type = "mousemove"; break;
    case "touchend":   type = "mouseup"; break;
    default: return;
  }
  var simulatedEvent = document.createEvent("MouseEvent");
  simulatedEvent.initMouseEvent(type, true, true, window, 1,
                                first.screenX, first.screenY,
                                first.clientX, first.clientY, false,
                                false, false, false, 0, null);
  first.target.dispatchEvent(simulatedEvent);
  event.preventDefault();
}

c0.addEventListener("touchstart", touchHandler, true);
c0.addEventListener("touchmove", touchHandler, true);
c0.addEventListener("touchend", touchHandler, true);
c0.addEventListener("touchcancel", touchHandler, true);

var imgDataSrc;

function calcScore() {
  var s = 0;
  var imgData = ctx1.getImageData(0, 0, width, height);
  for (var i = 0; i < width * height * 4; i += 4) {
    var a = imgData.data[i + 3];
    if (255 == a) {
      s += 1;
    }
  }
  return Math.floor(10 * s / (width * height));
}

function clearButtonsHandler() {
  for (var i = 0; i < btn.length; i++) {
    btn[i].setAttribute("onclick", "");
  }
}

function createQuizImage(cat_quiz_data, index) {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);
  var q = cat_quiz_data[index];
  drawCharCenter(ctx, Math.floor(0.6 * width), q[0]);
  imgDataSrc = ctx.getImageData(0, 0, width, height);
  fillForeground();
  updateCanvas();
}

function drawAnswer(ch) {
  drawCharCenter(ctx, Math.floor(0.8 * width), ch);
  setTimeout(newQuiz, 1000);
}

function drawCharCenter(ctx2d, size, s) {
  ctx2d.font = size + "px Arial";
  ctx2d.fillStyle = "black";
  ctx2d.textBaseline = "middle";
  ctx2d.textAlign = "center";
  ctx2d.fillText(s, width / 2, height / 2);
}

function genTitle() {
  var btns = viewTitle.getElementsByTagName("button");
  for (var i = 0; i < btns.length; i++) {
    var b = btns[i];
    if (btns.length - 1 != i) {
      b.innerHTML = quiz_data[i][0][0] + " " + b.innerHTML;
    }
    b.setAttribute("onclick", "startGame(" + i + ")");
  }
}

function fillForeground() {
  ctx1.globalCompositeOperation = 'source-over'; // default.
  ctx1.fillStyle = "#4caf50";
  ctx1.fillRect(0, 0, width, height);
}

function gameOver() {
  hide(viewGame);
  show(viewGameover);
  document.getElementById("endscore").innerHTML = score;
}

function getCatQuizProb(cat_quiz_data) {
  var n = 0;
  for (var i = 0; i < cat_quiz_data.length; i++) {
    n += cat_quiz_data[i][quiz_prob_index];
  }
  return n;
}

function hide(el) {
  el.style.display = "none";
}

function hidePrompt() {
  fillForeground();
  updateCanvas();
}

function initProb() {
  quiz_prob_index = quiz_data[0][0].length;
  for (var i = 0; i < quiz_data.length; i++) {
    var q = quiz_data[i];
    for (var j = 0; j < q.length; j++) {
      q[j][quiz_prob_index] = 1;
    }
  }
}

function isTitle() {
  var s = viewTitle.style.display;
  return "block" === s || "" === s;
}

function newQuiz() {
  if (0 >= life) {
    gameOver();
    return;
  }
  cur_cat_index = curr_cat;
  if (quiz_data.length == cur_cat_index) {
    cur_cat_index = randQuizCat();
  }
  var cat_quiz_data = quiz_data[cur_cat_index];
  cur_quiz_index = randQuizIndex(cat_quiz_data);
  setButtonsName(cat_quiz_data, cur_quiz_index);
  setButtonsHandler();
  createQuizImage(cat_quiz_data, cur_quiz_index);
  answer_index = Math.floor(Math.random() * 4);
  var q = cat_quiz_data[cur_quiz_index];
  btn[answer_index].innerHTML = q[1];
  new_game = true;
}

function onClickButton(i) {
  if (new_game) {
    showPrompt();
    return;
  }
  clearButtonsHandler();
  trySpeak(btn[answer_index].innerHTML);
  if (answer_index == i) {
    rightAnswer();
  } else {
    wrongAnswer();
  }
}

function randQuizCat() {
  var n = 0;
  for (var i = 0; i < quiz_data.length; i++) {
    n += getCatQuizProb(quiz_data[i]);
  }
  var r = Math.floor(Math.random() * n);
  n = 0;
  for (var i = 0; i < quiz_data.length; i++) {
    n += getCatQuizProb(quiz_data[i]);
    if (n >= r) {
      return i;
    }
  }
  return 0;
}

function randQuizIndex(cat_quiz_data) {
  var n = getCatQuizProb(cat_quiz_data);
  var r = Math.floor(Math.random() * n);
  n = 0;
  for (var i = 0; i < cat_quiz_data.length; i++) {
    n += cat_quiz_data[i][quiz_prob_index];
    if (n >= r) {
      return i;
    }
  }
  return 0;
}

function returnTitle() {
  hide(viewGame);
  hide(viewGameover);
  show(viewTitle);
}

function rightAnswer() {
  drawAnswer("✔️");
  score += calcScore();
  updateScore();
  var p = quiz_data[cur_cat_index][cur_quiz_index][quiz_prob_index] / 2;
  quiz_data[cur_cat_index][cur_quiz_index][quiz_prob_index] = Math.max(1, Math.floor(p));
}

function setButtonsHandler() {
  for (var i = 0; i < btn.length; i++) {
    btn[i].setAttribute("onclick", "onClickButton(" + i + ")");
  }
}

function setButtonsName(cat_quiz_data, index) {
  for (var i = (index + 1) % cat_quiz_data.length, n = 0; n < 4; i = (i + 1) % cat_quiz_data.length) {
    var q = cat_quiz_data[i];
    btn[n].innerHTML = q[1];
    n += 1;
  }
}

function show(el) {
  el.style.display = "block";
}

function showPrompt() {
  drawCharCenter(ctx1, Math.floor(0.4 * width), "👆");
  updateCanvas();
  setTimeout(hidePrompt, 1000);
}

function startGame(i) {
  curr_cat = i;
  life = 3;
  updateLife();
  score = 0;
  updateScore();
  newQuiz();
  hide(viewTitle);
  show(viewGame);
}

function trySpeak(s) {
  if ("undefined" !== typeof Android && null !== Android) {
    Android.trySpeak(s);
  } else if (window.speechSynthesis) {
    var msg = new SpeechSynthesisUtterance(s);
    if (msg) {
      msg.lang = "en-US";
      window.speechSynthesis.speak(msg);
    }
  }
}

function updateCanvas() {
  var imgData = ctx1.getImageData(0, 0, width, height);
  var imgDataNew = ctx1.getImageData(0, 0, width, height);
  for (var i = 0; i < width*height*4; i+=4) {
    var a = imgData.data[i+3];
    if (0 == a) {
      imgDataNew.data[i] = imgDataSrc.data[i];
      imgDataNew.data[i+1] = imgDataSrc.data[i+1];
      imgDataNew.data[i+2] = imgDataSrc.data[i+2];
      imgDataNew.data[i+3] = imgDataSrc.data[i+3];
    }
  }
  ctx.putImageData(imgDataNew, 0, 0);
}

function updateLife() {
  var s = "";
  var i = 0;
  for (; i < 3 - life; i++) {
    s += "❌";
  }
  for (; i < 3; i++) {
    s += "❤️";
  }
  elLife.innerHTML = s;
}

function updateScore() {
  elScore.innerHTML = score;
}

function wrongAnswer() {
  btn[answer_index].innerHTML += "⭕";
  drawAnswer("❌");
  life -= 1;
  updateLife();
  var p = quiz_data[cur_cat_index][cur_quiz_index][quiz_prob_index] * 2;
  quiz_data[cur_cat_index][cur_quiz_index][quiz_prob_index] = Math.min(64, p);
}

initProb();
genTitle();
