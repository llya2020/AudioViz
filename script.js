var song
var img // background image
var imgLoaded
var fft
var particles = []

let isPlaying = false;
let slider; // Slider to scrub through the song
let minPartSlider;
let maxPartSlider;
let recorder; //from recorder.js, mediaARecorder wrapper
let tool;
let isRecording = false;
let topen = false;
let strokeLabel;
let strokeColorLabel;
let minPartSliderLab;
let maxPartSliderLab;
let particleColorLabel;
let shapeSelectLabel;
let backgroundLabel;
let checkboxLabel;

function preload() {
  img = loadImage('gradient.jpg');
  imgLoaded = true;
}

function record(){
  play();
  if (!isRecording){
    recorder.start();
    btn.html('stop recording');
    isRecording = true;
  }
  else if (isRecording){
    recorder.stop();
    btn.html('start recording');
    isRecording = false;
  }
}

function setup() {
  if (song != null) {
    createCanvas(400,400)
    background(100)
  } else {
    // alert("Please upload an audio file using the Choose File button in the top left corner")
  idata = img.canvas.toDataURL();
  fileInput = createFileInput(handleAudioFile);
  fileInput.position(20,30)
  backgroundFileInput = createFileInput(handleImgFile);
  createCanvas(windowWidth, windowHeight);

  angleMode(DEGREES);
  imageMode(CENTER);
  rectMode(CENTER);
  fft = new p5.FFT(0.3);

  recorder = new Recorder(this);
  btn = createButton('Start Recording');
  btn.position(200,30)
  btn.mousePressed(record);
  btn.attribute('disabled', ''); 

  //implements video scrubbing slider
  slider = createSlider(0, 1, 0, 0.001);
  slider.position(10, fileInput.y + 40);
  slider.style('width', '80%');
  //function to allow the video to jump to the point in time of the slider
  slider.input(() => {
    let songCurrentTime = map(slider.value(), 0, 1, 0, song.duration());
    song.jump(songCurrentTime);
  });
  slider.attribute('disabled', '');
  //slider.changed(play);
  let sliderLabel = createP('Playback Control');
  sliderLabel.position(15, slider.y + 5);
  sliderLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  sliderLabel.style('padding', '5px');

  tool = createButton('ToolBar');  
  tool.position(0, 0);
  tool.style('width', '20%'); 
  tool.attribute('disabled', ''); 
  tool.mousePressed(tbar);

  strokeSlider = createSlider(1,25,1);
  strokeSlider.position(10, slider.y+slider.height+55);
  strokeSlider.style('width', '20%');
  disableAndHide(strokeSlider); 
  strokeSlider.changed(play);
  strokeLabel = createP('Stroke Weight:');
  strokeLabel.position(15, strokeSlider.y + strokeSlider.height - 10);
  strokeLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  strokeLabel.style('padding', '5px');
  strokeLabel.style('display', 'none');
  
  strokeColorLabel = createP('Stroke Color');
  strokeColorLabel.position(15, strokeSlider.y + strokeSlider.height + 30);
  strokeColorLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  strokeColorLabel.style('padding', '5px');
  strokeColorLabel.style('display', 'none');
  strokeColor = createColorPicker('deeppink');
  strokeColor.position(strokeColorLabel.x + 100, strokeColorLabel.y + 16);
  disableAndHide(strokeColor);   
  strokeColor.changed(play);

  minPartSlider = createSlider(0,40,10);
  minPartSlider.position(10, strokeColorLabel.y + 55);
  minPartSlider.style('width', '20%');
  disableAndHide(minPartSlider); 
  minPartSlider.changed(play);
  minPartSliderLab = createP('Min Particle Size:');
  minPartSliderLab.position(15, minPartSlider.y + 5);
  minPartSliderLab.style('background-color', 'rgba(255, 255, 255, 0.7)');
  minPartSliderLab.style('padding', '5px');
  minPartSliderLab.style('display', 'none');
  minPartSlider.input(cmin);

  maxPartSlider = createSlider(0,40,30);
  maxPartSlider.position(10, minPartSliderLab.y+50);
  maxPartSlider.style('width', '20%');
  disableAndHide(maxPartSlider);  
  maxPartSlider.changed(play);
  maxPartSliderLab = createP('Max Particle Size:');
  maxPartSliderLab.position(15, maxPartSlider.y + 5);
  maxPartSliderLab.style('background-color', 'rgba(255, 255, 255, 0.7)');
  maxPartSliderLab.style('padding', '5px');
  maxPartSliderLab.style('display', 'none');
  maxPartSlider.input(cmax);

  particleColorLabel = createP('Particle Color:');
  particleColorLabel.position(15, maxPartSliderLab.y + maxPartSliderLab.height + 25);
  particleColorLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  particleColorLabel.style('padding', '5px');
  particleColorLabel.style('display', 'none');
  particleColor = createColorPicker('lightgreen');
  particleColor.position(particleColorLabel.x + 110, particleColorLabel.y + 16);
  disableAndHide(particleColor);   
  particleColor.changed(play)

  shapeSelectLabel = createP('Shape Select');
  shapeSelectLabel.position(15, particleColor.y + 20);
  shapeSelectLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  shapeSelectLabel.style('padding', '5px');
  shapeSelectLabel.style('display', 'none');
  shapeSelect = createSelect();
  shapeSelect.position(100 + shapeSelectLabel.x,shapeSelectLabel.y+20);
  disableAndHide(shapeSelect);  
  shapeSelect.changed(play);
  // Add color options.
  shapeSelect.option('Circle');
  shapeSelect.option('Line');
  shapeSelect.option('Diamond');
  shapeSelect.selected('Circle');

  backgroundLabel = createP('Background Image');
  backgroundLabel.position(15, shapeSelectLabel.y + 40);
  backgroundLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  backgroundLabel.style('padding', '5px');
  backgroundLabel.style('display', 'none');
  backgroundFileInput.position(backgroundLabel.x + 140, backgroundLabel.y+20)
  disableAndHide(backgroundFileInput); 

  checkboxLabel = createP('Enable Blur');
  checkboxLabel.position(15, backgroundLabel.y + 40);
  checkboxLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  checkboxLabel.style('padding', '5px');
  checkboxLabel.style('display', 'none');
  checkbox = createCheckbox('', false); 
  checkbox.position(checkboxLabel.x + 90, checkboxLabel.y+20);
  checkbox.changed(checked);
  disableAndHide(checkbox);  
  }

  noLoop();

}

function cmin() {
  if (minPartSlider.value() >= maxPartSlider.value()) {
    minPartSlider.value(maxPartSlider.value());
  }
}

function cmax() {
  if (maxPartSlider.value() <= minPartSlider.value()) {
    maxPartSlider.value(minPartSlider.value());
  }
}

function tbar() {
  if (topen) {
    disableAndHide(backgroundFileInput);
    disableAndHide(particleColor);
    disableAndHide(strokeColor);
    disableAndHide(strokeSlider);
    disableAndHide(shapeSelect);
    disableAndHide(minPartSlider);
    disableAndHide(maxPartSlider);
    disableAndHide(checkbox);
    strokeLabel.style('display', 'none');
    strokeColorLabel.style('display', 'none');
    minPartSliderLab.style('display', 'none');
    maxPartSliderLab.style('display', 'none');
    particleColorLabel.style('display', 'none');
    shapeSelectLabel.style('display', 'none');
    backgroundLabel.style('display', 'none');
    checkboxLabel.style('display', 'none');
    topen = false;
  } else {
    enableAndShow(backgroundFileInput, 'block');
    enableAndShow(particleColor, 'block');
    enableAndShow(strokeColor, 'block');
    enableAndShow(strokeSlider, 'block');
    enableAndShow(shapeSelect, 'block');
    enableAndShow(minPartSlider, 'block');
    enableAndShow(maxPartSlider, 'block');
    enableAndShow(checkbox, 'inline-block');
    strokeLabel.style('display', 'block');
    strokeColorLabel.style('display', 'block');
    minPartSliderLab.style('display', 'block');
    maxPartSliderLab.style('display', 'block');
    particleColorLabel.style('display', 'block');
    shapeSelectLabel.style('display', 'block');
    backgroundLabel.style('display', 'block');
    checkboxLabel.style('display', 'block');
    topen = true;
  }
}

function disableAndHide(element) {
  element.attribute('disabled', '');
  element.style('display', 'none');
}

function enableAndShow(element, displayStyle) {
  element.removeAttribute('disabled');
  element.style('display', displayStyle);
}

function handleAudioFile(file) {
  if (file.type === 'audio') {
    song = loadSound(file.data, () => {
      sload = true;
      slider.removeAttribute('disabled');
      tool.removeAttribute('disabled');
      btn.removeAttribute('disabled');
      slider.value(0);
      isPlaying = true;
      song.play();
      loop();
    });
  } else {
    print('Invalid audio file!');
  }
} 

function handleImgFile(file) {
  if (file.type === 'image') {
    play();
    idata = file.data; // Assuming this is the source URL or path.
    loadImage(idata, function(loadedImage) {
      img = loadedImage;
      if (checkbox.checked()) {
        img.filter(BLUR, 12); // Apply blur if checkbox is checked
      }
    });
  } else {
    print('Invalid image file!');
  }
}

function checked() {
  play();
  if (checkbox.checked()) {
    img.filter(BLUR, 12); // Apply blur if checkbox is checked
  } else {
    // Reload the image from the original data to remove blur
    loadImage(idata, function(loadedImage) {
      img = loadedImage; // Update the global image object
    });
  }
}

function draw() {
  background(255)

  translate(width / 2, height / 2)

  fft.analyze()
  amp = fft.getEnergy(20, 200)

  push()
  if (amp > 230) {
    rotate(random(-0.5, 0.5))
  }

  image(img, 0, 0, width + 100, height + 100);
  pop();
  

  var alpha = map(amp, 0, 255, 180, 150);
  fill(0, alpha);
  noStroke();
  rect(0, 0, width, height);

  stroke(strokeColor.color());
  strokeWeight(strokeSlider.value());
  noFill();

  var wave = fft.waveform()
  if (shapeSelect.selected() == 'Circle') {
    for (var t = -1; t <= 1; t += 2) {
      beginShape()
        for (var i = 0; i <= 180; i += 0.5) {
          var index = floor(map(i, 0, 180, 0, wave.length - 1))
      
          var r = map(wave[index], -1, 1, 150, 350)
          
          var x = r * sin(i) * t 
          var y = r * cos(i) 
          vertex(x, y)
        }
      endShape()
    }
    manageParticles('Circle');
  } else if (shapeSelect.selected() == 'Diamond') {
      for (var t = -4; t <= 4; t += 1) {
        beginShape()
          for (var i = 0; i <= 180; i += 90) {
            var index = floor(map(i, 0, 180, 0, wave.length - 1))
        
            var r = map(wave[index], -1, 1, 150, 350)
            
            var x = r * sin(i) * t / 5
            var y = r * cos(i) 
            vertex(x, y)
          }
        endShape()
        }
      if(minPartSlider.value() != 0 || maxPartSlider.value() != 0) {
          manageParticles('Diamond')
        }
      
  } else { 
    beginShape()
    for (var i = 0; i < width*1; i++) {
      var index = floor(map(i, 0, width*1, 0, wave.length))
      
      var x = i - width/2
      var y = wave[index] * 100 
      vertex(x, y)
    }
    endShape()

    manageParticles('Line');
  }

  if (!isPlaying && sload) {
    // Draw button
    fill(150);
    noStroke();
    triangle(-50, -75, -50, 75, 75, 0);
    } else {
      let val = map(song.currentTime(), 0, song.duration(), 0, 1);
      slider.value(val);
    }
  
  // let val = map(song.currentTime(), 0, song.duration(), 0, 1);
  // if (song.isPlaying()) {
  //   slider.value(val);
  // }
  
}

function play() {
  if(!isPlaying) {
    isPlaying = true;
    song.play();
    loop();
  }
}

function mouseClicked() {
  // Check if the mouse is not over the slider

  if (!slider.elt.matches(':hover')&&!tool.elt.matches(':hover')&&!checkbox.elt.matches(':hover')&&!strokeColor.elt.matches(':hover')&&!strokeSlider.elt.matches(':hover')&&!particleColor.elt.matches(':hover')&&!minPartSlider.elt.matches(':hover')&&!maxPartSlider.elt.matches(':hover')&&!shapeSelect.elt.matches(':hover')&&(mouseY<=windowHeight)) {
    if (isPlaying) {
      isPlaying = false;
      song.pause();
      noLoop(); // Remove this to keep the draw loop running
    } else {
      isPlaying = true;
      song.play();
      //if we moved the slider from when it was paused, jump there
      if (abs(slider.value() - map(song.currentTime(), 0, song.duration(), 0, 1)) > 0.01) {
        song.jump(map(slider.value(), 0, 1, 0, song.duration()));
      }
      loop();
    }
  }
}
class Particle {
  constructor(shape) {
    if (shape === 'Circle') {
      this.pos = p5.Vector.random2D().mult(250);
    } else if (shape === 'Diamond' || shape === 'Line') {
      // For non-circular shapes, start particles from a specific point or distribute differently
      this.pos = createVector(random(-width / 2, width / 2), random(-height / 2, height / 2));
    }
    this.vel = createVector(0, 0);
    this.acc = this.pos.copy().mult(random(0.0001, 0.00001));
    this.w = random(minPartSlider.value(), maxPartSlider.value())
    // this.w = random(3, 5);
    this.color = particleColor.color(); // Ensure you have a default if particleColor is undefined
  }
  update(cond) {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    if (cond) {
      this.pos.add(this.vel).add(this.vel).add(this.vel);
    }
  }
  edges() {
    return (this.pos.x < -width / 2 || this.pos.x > width / 2 || this.pos.y < -height / 2 || this.pos.y > height / 2);
  }
  show() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.w);
  }
}


function manageParticles(shape) {

  var p = new Particle(shape); // Pass the current shape to the constructor

  particles.push(p);

  for (var i = particles.length - 1; i >= 0; i--) {

    if (!particles[i].edges()) {

      particles[i].update(amp > 230); // Consider updating this condition or making it shape-dependent

      particles[i].show();

    } else {

      particles.splice(i, 1);

    }

  }

}
