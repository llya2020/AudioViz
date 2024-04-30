var song
var img // background image
var fft
var particles = []
let idata;
let isPlaying = false;
let sload = false;
let slider; // Slider to scrub through the song
let recorder; //from recorder.js, mediaARecorder wrapper
let isRecording = false;

function preload() {
  //song = loadSound('everglow.mp3')
  img = loadImage('bg.jpg');
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
  idata = img.canvas.toDataURL();
  fileInput = createFileInput(handleAudioFile);
  backgroundFileInput = createFileInput(handleImgFile);
  backgroundFileInput.attribute('disabled', '');
  createCanvas(windowWidth, windowHeight);

  angleMode(DEGREES);
  imageMode(CENTER);
  rectMode(CENTER);
  fft = new p5.FFT(0.3);

  recorder = new Recorder(this);
  btn = createButton('start recording');
  btn.mousePressed(record);
  btn.attribute('disabled', ''); 

  //implements video scrubbing slider
  slider = createSlider(0, 1, 0, 0.001);
  slider.position(10, 10);
  slider.style('width', '80%');
  //function to allow the video to jump to the point in time of the slider
  slider.input(() => {
    let songCurrentTime = map(slider.value(), 0, 1, 0, song.duration());
    song.jump(songCurrentTime);
  });
  slider.attribute('disabled', '');
  //slider.changed(play);
  let sliderLabel = createP('Playback Control');
  sliderLabel.position(10, 10);
  sliderLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  sliderLabel.style('padding', '5px');

  strokeSlider = createSlider(1,25,1);;
  strokeSlider.position(10, slider.y+slider.height+40);
  strokeSlider.style('width', '20%');
  strokeSlider.attribute('disabled', '');  
  strokeSlider.changed(play);
  let strokeLabel = createP('Stroke Weight:');
  strokeLabel.position(10, slider.y + slider.height + 50);
  strokeLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  strokeLabel.style('padding', '5px');

  particleColor = createColorPicker('lightgreen');
  particleColor.position(10, strokeSlider.y+strokeSlider.height+40);
  particleColor.attribute('disabled', '');  
  particleColor.changed(play)
  let particleColorLabel = createP('Particle Color:');
  particleColorLabel.position(10, strokeSlider.y + strokeSlider.height + 50);
  particleColorLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  particleColorLabel.style('padding', '5px');
  
  strokeColor = createColorPicker('deeppink');
  strokeColor.position(10, particleColor.y+particleColor.height+40);
  strokeColor.attribute('disabled', '');  
  strokeColor.changed(play);
  let strokeColorLabel = createP('Stroke Color');
  strokeColorLabel.position(10, particleColor.y + particleColor.height + 50);
  strokeColorLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  strokeColorLabel.style('padding', '5px');

  shapeSelect = createSelect();
  shapeSelect.position(10, strokeColor.y+strokeColor.height+40);
  shapeSelect.attribute('disabled', '');  
  shapeSelect.changed(play);
  let shapeSelectLabel = createP('Shape Select');
  shapeSelectLabel.position(10, strokeColor.y + strokeColor.height + 50);
  shapeSelectLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  shapeSelectLabel.style('padding', '5px');

  checkbox = createCheckbox('Enable Blur', false); 
  checkbox.position(10, shapeSelect.y+shapeSelect.height+40);
  checkbox.changed(checked);
  checkbox.attribute('disabled', '');  
  let checkboxLabel = createP('Enable Blur');
  checkboxLabel.position(10, shapeSelect.y + shapeSelect.height + 50);
  checkboxLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  checkboxLabel.style('padding', '5px');

  pcheckbox = createCheckbox('Enable Particles', false); 
  pcheckbox.position(10, checkbox.y+checkbox.height+40);
  pcheckbox.changed(play);
  pcheckbox.attribute('disabled', '');  
  let pcheckboxLabel = createP('Enable Particles');
  pcheckboxLabel.position(10, checkbox.y + checkbox.height + 50);
  pcheckboxLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  pcheckboxLabel.style('padding', '5px');

  // Add color options.
  shapeSelect.option('Circle');
  shapeSelect.option('Line');
  shapeSelect.option('Diamond');
  shapeSelect.selected('Circle');

  noLoop();

}

function handleAudioFile(file) {
  if (file.type === 'audio') {
    song = loadSound(file.data, () => {
      sload = true;
      backgroundFileInput.removeAttribute('disabled');
      slider.removeAttribute('disabled');
      particleColor.removeAttribute('disabled');
      strokeColor.removeAttribute('disabled');
      strokeSlider.removeAttribute('disabled');
      shapeSelect.removeAttribute('disabled');
      checkbox.removeAttribute('disabled');
      btn.removeAttribute('disabled');
      pcheckbox.removeAttribute('disabled');
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
        console.log("Image loaded and blur applied:", checkbox.checked());
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
    if(pcheckbox.checked()) {
      manageParticles('Circle');
    }
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
      if(pcheckbox.checked()) {
        manageParticles('Diamond');
      }
      
  } else { // this is line
    beginShape()
    for (var i = 0; i < width*1; i++) {
      var index = floor(map(i, 0, width*1, 0, wave.length))
      
      var x = i - width/2
      var y = wave[index] * 100 
      vertex(x, y)
    }
    endShape()

    if(pcheckbox.checked()) {
      manageParticles('Line');
    }
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
  
}

function play() {
  if(!isPlaying) {
    isPlaying = true;
    song.play();
    loop();
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

function mouseClicked() {
  // Check if the mouse is not over the slider
  if (!slider.elt.matches(':hover')&&!pcheckbox.elt.matches(':hover')&&!checkbox.elt.matches(':hover')&&!strokeColor.elt.matches(':hover')&&!strokeSlider.elt.matches(':hover')&&!particleColor.elt.matches(':hover')&&!shapeSelect.elt.matches(':hover')&&(mouseY<=windowHeight)) {
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
    this.w = random(3, 5);
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