function initVars() {

  pi = Math.PI;
  canvas = document.querySelector("canvas");
  ctx = canvas.getContext("2d");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  cx = canvas.width / 2;
  cy = canvas.height / 2;
  frames = seed = 0;
  res = 10;
  points = 10;
  cols = parseInt(canvas.clientWidth / res);
  rows = parseInt(canvas.clientHeight / res);
}

function rand() {
  seed += .1234;
  return parseFloat('0.' + Math.sin(seed).toString().substr(6));
}

function loadControlPoints() {

  controls = new Array(points);
  for (i = 0; i < points; ++i) {
    controls[i] = new Object();
    controls[i].x = cols / 2;
    controls[i].y = rows / 2;
    controls[i].vx = 3 - rand() * 6;
    controls[i].vy = 3 - rand() * 6;
  }
}

function loadTerrain() {

  terrain = new Array(cols);
  max = 0;
  for (i = 0; i < cols; ++i) {
    terrain[i] = new Array(rows);
    for (j = 0; j < rows; ++j) {
      terrain[i][j] = new Object();
      d1 = d2 = 0;
      for (k = 0; k < points; ++k) {
        d1 += Math.sqrt((i - controls[k].x) * (i - controls[k].x) + 
        								(j - controls[k].y) * (j - controls[k].y));
      }
      c = 1;
      for (k = 0; k < points; ++k) {
        d2 = Math.sqrt((i - controls[k].x) * (i - controls[k].x) + 
        							 (j - controls[k].y) * (j - controls[k].y));
        c *= 1 - (1 - (d2 / d1));
      }
      if (c > max) max = c;
      terrain[i][j].color = c;
    }
  }
  for (i = 0; i < cols; ++i) {
    for (j = 0; j < rows; ++j) {
      terrain[i][j].color /= max;
    }
  }
}

function interpolate(x, y, degree) {

  return degree * x + (1 - degree) * y;
}

function doLogic() {

  frames++;
  t = .5 - Math.cos(frames / 100) / 2;
  for (i = 0; i < controls.length; ++i) {
    if (controls[i].x + controls[i].vx >= cols || 
    		controls[i].x + controls[i].vx < 0) controls[i].vx *= -1;
    if (controls[i].y + controls[i].vy >= rows ||
    		controls[i].y + controls[i].vy < 0) controls[i].vy *= -1;
    p = pi * 2 / controls.length * i + frames / 10 + 
    		(i % 2 ? 1 : -1) * Math.sin(frames / 16) * 2;
    ls = rows / 2 * (1 + (i % 2));
    x = cols / 2 + Math.sin(p) * ls;
    y = rows / 2 + Math.cos(p) * ls;
    vx = (x - controls[i].x) / 25;
    vy = (y - controls[i].y) / 25;
    controls[i].x += interpolate(controls[i].vx, vx, t);
    controls[i].y += interpolate(controls[i].vy, vy, t);
  }
  loadTerrain();
}

function colorString(col){
  var r = Math.round(col[0]*255);
  var g = Math.round(col[1]*255);
  var b = Math.round(col[2]*255);
  return "#"+("0" + r.toString(16) ).slice (-2)+("0" + g.toString(16) ).slice (-2)+("0" + b.toString(16) ).slice (-2);
}

function interpolateColors(RGB1, RGB2, degree) {

  w1 = degree;
  w2 = 1 - w1;
  return colorString([w1 * RGB1[0] + w2 * RGB2[0], 
  										w1 * RGB1[1] + w2 * RGB2[1], 
                      w1 * RGB1[2] + w2 * RGB2[2]]);
}

function draw() {

  ctx.clearRect(0, 0, cx * 2, cy * 2);

  width = cx * 2 / cols;
  height = cy * 2 / rows;
  ctx.strokeStyle = "#fff";
  ctx.font = "16px Square721";
  for (i = 0; i < cols; ++i) {
    for (j = 0; j < rows; ++j) {
      x = i * width;
      y = j * height;
      ctx.globalAlpha = 1;
      col1 = [terrain[i][j].color,
      				terrain[i][j].color,
              terrain[i][j].color];
      p = terrain[i][j].color * pi * 
      		(5.65 - Math.cos(frames / 22) * 5) + frames / 14;
      col2 = [.5 + Math.sin(p) / 2,
      				.5 + Math.cos(p) / 2,
              .5 - Math.sin(p) / 2];
      ctx.fillStyle = interpolateColors(col2, col1, 
      								.5 - Math.cos(frames / 42) / 2);
      ctx.fillRect(x, y, width + 1, height + 1);
    }
  }
}

function frame() {
  requestAnimationFrame(frame);
  doLogic();
  draw();
}

initVars();
loadControlPoints();
loadTerrain();
frame();