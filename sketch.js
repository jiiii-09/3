let video;
let prevFrame;
let threshold = 30;
let circles = [];

let camShader;
let shaderBuffer; // shader용 p5.Graphics

function preload() {
  camShader = loadShader("shaders/cam.vert", "shaders/cam.frag");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
   // 🔥 최적화된 캔버스 사이즈

  // 비디오도 동일하게 더 저해상도로
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();

  // shaderBuffer 역시 video 해상도 맞추기
  shaderBuffer = createGraphics(320, 240, WEBGL);
}

function draw() {
  background(0);

  // ------------------------------------------
  // ⭐ 1) COVER 방식으로 카메라 확대하기
  // ------------------------------------------
  let scaleFactor = max(width / video.width, height / video.height);
  let drawW = video.width * scaleFactor;
  let drawH = video.height * scaleFactor;
  let offsetX = (width - drawW) / 2;
  let offsetY = (height - drawH) / 2;

  // ------------------------------------------
  // ⭐ 2) 흑백 비디오 레이어 (좌우반전 + cover)
  // ------------------------------------------
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, offsetX, offsetY, drawW, drawH);  // cover 적용된 비디오
  filter(GRAY);
  pop();

  // ------------------------------------------
  // ⭐ 3) 움직임 감지 (원래 로직 그대로)
  // ------------------------------------------
  video.loadPixels();
  if (prevFrame) {
    prevFrame.loadPixels();
    detectMovement();
  }
  prevFrame = video.get();

  // ------------------------------------------
  // ⭐ 4) erase() 구멍 효과
  // ------------------------------------------
  push();
  erase();
  for (let c of circles) {
    circle(c.x, c.y, c.size);
    c.life -= 10;
  }
  noErase();
  pop();

  circles = circles.filter(c => c.life > 0);

  // ------------------------------------------
  // ⭐ 5) 열화상 레이어 GPU 렌더링
  // ------------------------------------------
  shaderBuffer.shader(camShader);
  camShader.setUniform("u_tex0", video);

  shaderBuffer.push();
  shaderBuffer.clear();

  // WEBGL: -1 ~ 1 전체 화면
  shaderBuffer.beginShape();
  shaderBuffer.vertex(-1, -1, 0, 0);
  shaderBuffer.vertex( 1, -1, 1, 0);
  shaderBuffer.vertex( 1,  1, 1, 1);
  shaderBuffer.vertex(-1,  1, 0, 1);
  shaderBuffer.endShape();
  shaderBuffer.pop();

  // ------------------------------------------
  // ⭐ 6) 열화상을 cover 영상 뒤에 깔기
  //     (destination-over → 배경 레이어)
  //     + 좌우반전 + 상하반전 그대로 유지
  // ------------------------------------------
  push();
  drawingContext.save();
  drawingContext.globalCompositeOperation = "destination-over";

  translate(width, 0);
  scale(-1, 1);

  scale(1, -1);
  translate(0, -height);

  image(shaderBuffer, offsetX, offsetY, drawW, drawH);  // cover 적용 ★

  drawingContext.restore();
  pop();
}


function detectMovement() {
  for (let y = 0; y < video.height; y += 10) {
    for (let x = 0; x < video.width; x += 10) {

      let i = (y * video.width + x) * 4;

      let diff =
        (abs(video.pixels[i] - prevFrame.pixels[i]) +
         abs(video.pixels[i+1] - prevFrame.pixels[i+1]) +
         abs(video.pixels[i+2] - prevFrame.pixels[i+2])) / 3;

      if (diff > threshold) {

        let realX = map(x, 0, video.width, 0, width);
        let realY = map(y, 0, video.height, 0, height);

        // ⭐ 원 크기 완전 고정
        let size = 180;

        // ⭐ 원 간격 완전 고정
        let minDist = 1000;

        if (isFarEnough(realX, realY, 100)) {
          circles.push({ x: realX, y: realY, life: 255, size: size });
        }
      }
    }
  }
}

function isFarEnough(x, y, minDist) {
  for (let c of circles) {
    if (dist(x, y, c.x, c.y) < minDist) return false;
  }
  return true;
}
