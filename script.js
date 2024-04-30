var song
var img // background image
var imgLoaded
var fft
var particles = []

let isPlaying = false;
let slider; // Slider to scrub through the song
let recorder; //from recorder.js, mediaARecorder wrapper
let isRecording = false;

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

function showModal() {
  // Create modal popup
  let modalDiv = createDiv('');
  modalDiv.id('modal');
  modalDiv.style('position', 'absolute');
  modalDiv.style('top', '50%');
  modalDiv.style('left', '50%');
  modalDiv.style('transform', 'translate(-50%, -50%)');
  modalDiv.style('background-color', '#F6A7C1');
  modalDiv.style('text-align', 'center');
  modalDiv.style('width', '100vw'); // Set width to 100% of viewport width
  modalDiv.style('height', '100vh');
  
  // Add elements to modal
  let title = createElement('h1', 'Welcome to AudioViz');
  title.parent(modalDiv);
  
  let instructions = createElement('p', 'Please upload an audio file below to continue!');
  instructions.parent(modalDiv);
  
  let fileInput = createFileInput(handleAudioFile);
  fileInput.parent(modalDiv);
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  if (song == null) {
    showModal();
  } else {
    startVisualizer();
  }
}

function startVisualizer() {
  // alert("Please upload an audio file using the Choose File button in the top left corner")
  idata = img.canvas.toDataURL();
  fileInput = createFileInput(handleAudioFile);
  fileInput.position(5, 5);
  backgroundFileInput = createFileInput(handleImgFile);

  angleMode(DEGREES);
  imageMode(CENTER);
  rectMode(CENTER);
  fft = new p5.FFT(0.3);

  recorder = new Recorder(this);
  btn = createButton('Start Recording');
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

  strokeSlider = createSlider(1,25,1);
  strokeSlider.position(10, slider.y+slider.height+55);
  strokeSlider.style('width', '20%');
  strokeSlider.attribute('disabled', '');  
  strokeSlider.changed(play);
  let strokeLabel = createP('Stroke Weight:');
  strokeLabel.position(15, strokeSlider.y + strokeSlider.height - 10);
  strokeLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  strokeLabel.style('padding', '5px');
  
  let strokeColorLabel = createP('Stroke Color');
  strokeColorLabel.position(15, strokeSlider.y + strokeSlider.height + 30);
  strokeColorLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  strokeColorLabel.style('padding', '5px');
  strokeColor = createColorPicker('deeppink');
  strokeColor.position(strokeColorLabel.x + 100, strokeColorLabel.y + 16);
  strokeColor.attribute('disabled', '');  
  strokeColor.changed(play);

  minPartSlider = createSlider(0,40,6);
  minPartSlider.position(10, strokeColorLabel.y + 55);
  minPartSlider.style('width', '20%');
  minPartSlider.attribute('disabled', '');  
  minPartSlider.changed(play);
  let minPartSliderLab = createP('Min Particle Size:');
  minPartSliderLab.position(15, minPartSlider.y + 5);
  minPartSliderLab.style('background-color', 'rgba(255, 255, 255, 0.7)');
  minPartSliderLab.style('padding', '5px');

  maxPartSlider = createSlider(0,40,3);
  maxPartSlider.position(10, minPartSliderLab.y+50);
  maxPartSlider.style('width', '20%');
  maxPartSlider.attribute('disabled', '');  
  maxPartSlider.changed(play);
  let maxPartSliderLab = createP('Max Particle Size:');
  maxPartSliderLab.position(15, maxPartSlider.y + 5);
  maxPartSliderLab.style('background-color', 'rgba(255, 255, 255, 0.7)');
  maxPartSliderLab.style('padding', '5px');

  let particleColorLabel = createP('Particle Color:');
  particleColorLabel.position(15, maxPartSliderLab.y + maxPartSliderLab.height + 25);
  particleColorLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  particleColorLabel.style('padding', '5px');
  particleColor = createColorPicker('lightgreen');
  particleColor.position(particleColorLabel.x + 110, particleColorLabel.y + 16);
  particleColor.attribute('disabled', '');  
  particleColor.changed(play)

  let shapeSelectLabel = createP('Shape Select');
  shapeSelectLabel.position(15, particleColor.y + 20);
  shapeSelectLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  shapeSelectLabel.style('padding', '5px');
  shapeSelect = createSelect();
  shapeSelect.position(100 + shapeSelectLabel.x,shapeSelectLabel.y+20);
  shapeSelect.attribute('disabled', '');  
  shapeSelect.changed(play);
  // Add color options.
  shapeSelect.option('Circle');
  shapeSelect.option('Line');
  shapeSelect.option('Diamond');
  shapeSelect.selected('Circle');

  let backgroundLabel = createP('Background Image');
  backgroundLabel.position(15, shapeSelectLabel.y + 40);
  backgroundLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  backgroundLabel.style('padding', '5px');
  backgroundFileInput.position(backgroundLabel.x + 140, backgroundLabel.y+20)
  backgroundFileInput.attribute('disabled', '');

  let checkboxLabel = createP('Enable Blur');
  checkboxLabel.position(15, backgroundLabel.y + 40);
  checkboxLabel.style('background-color', 'rgba(255, 255, 255, 0.7)');
  checkboxLabel.style('padding', '5px');
  checkbox = createCheckbox('', false); 
  checkbox.position(checkboxLabel.x + 90, checkboxLabel.y+20);
  checkbox.changed(checked);
  checkbox.attribute('disabled', ''); 

  noLoop(); 
}

function handleAudioFile(file) {
  if (file.type === 'audio') {
    song = loadSound(file.data, () => {
      // setup();
      sload = true;
      backgroundFileInput.removeAttribute('disabled');
      slider.removeAttribute('disabled');
      particleColor.removeAttribute('disabled');
      strokeColor.removeAttribute('disabled');
      strokeSlider.removeAttribute('disabled');
      shapeSelect.removeAttribute('disabled');
      minPartSlider.removeAttribute('disabled');
      maxPartSlider.removeAttribute('disabled');
      checkbox.removeAttribute('disabled');
      btn.removeAttribute('disabled');
      slider.value(0);
      isPlaying = true;
      song.play();
      loop();
    });
    select('#modal').remove();
    startVisualizer();
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

  if (!slider.elt.matches(':hover')&&!checkbox.elt.matches(':hover')&&!strokeColor.elt.matches(':hover')&&!strokeSlider.elt.matches(':hover')&&!particleColor.elt.matches(':hover')&&!minPartSlider.elt.matches(':hover')&&!maxPartSlider.elt.matches(':hover')&&!shapeSelect.elt.matches(':hover')&&(mouseY<=windowHeight)) {
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
