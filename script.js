var song
var img // background image
var imgLoaded
var fft
var particles = []
let isPlaying = false;
let slider; // Slider to scrub through the song

function preload() {
  //song = loadSound('everglow.mp3')
  img = loadImage('bg.jpg');
  imgLoaded = true;
}

function setup() {
  fileInput = createFileInput(handleAudioFile);
  backgroundFileInput = createFileInput(handleImgFile);

  createCanvas(windowWidth, windowHeight);

  angleMode(DEGREES);
  imageMode(CENTER);
  rectMode(CENTER);
  fft = new p5.FFT(0.3);
  img.filter(BLUR, 12);

  //implements video scrubbing slider
  slider = createSlider(0, 1, 0, 0.001);
  slider.position(10, 10);
  slider.style('width', '80%');
  //function to allow the video to jump to the point in time of the slider
  slider.input(() => {
    let songCurrentTime = map(slider.value(), 0, 1, 0, song.duration());
    song.jump(songCurrentTime);
  });

  particleColor = createColorPicker('deeppink');
  particleColor.position(10, 80);  
  
  strokeColor = createColorPicker('deeppink');
  strokeColor.position(10, 115);

  strokeSlider = createSlider(0,20,3);
  strokeSlider.position(10, 40);
  strokeSlider.style('width', '20%');

  shapeSelect = createSelect();
  shapeSelect.position(10, 140);

  // Add color options.
  shapeSelect.option('circle');
  shapeSelect.option('line');
  shapeSelect.selected('line');

  noLoop();

}

function handleAudioFile(file) {
  if (file.type === 'audio') {
    song = loadSound(file.data, () => {
      slider.max(song.duration()); // Set the slider's maximum value to the song's duration
      mouseClicked(); // Start playing the song
    });
  } else {
    print('Invalid audio file!');
  }
} 

function handleImgFile(file) {
  imgLoaded = false;
  if (file.type === 'image') {
    img = loadImage(file.data);
    imgCreated();
    img.hide();
    draw();
  } else {
    print('Invalid audio file!');
  }
}

function imgCreated(){
  img.hide();
  // Create a temporary p5.Graphics object to draw the image.
  let g = createGraphics(img.elt.width, img.elt.height);
  g.image(img, 0, 0);
  // Remove the original element from the DOM.
  img.remove();
  // g.get will return image data as a p5.Image object
  img = g.get(0, 0, g.width, g.height)
  
  // Because we've converted it into a p5.Image object, we can
  // use functions such as 'resize', and 'filter',
  // which aren't available on the HTML img element.
  // Uncomment the following lines for an example...
  
  /*
  // Resize it to fill the canvas
  if (img.width < img.height){
    img.resize(width, 0);
  } else {
    img.resize(0, height);
  }
  
  // Posterize and invert the colours
  img.filter(POSTERIZE, 2);
  img.filter(INVERT);
  */

  // Record that we have finished creating the image object.
  imgLoaded = true;
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

  if (imgLoaded) {
    image(img, 0, 0, width + 100, height + 100);
    pop();
  }
  

  var alpha = map(amp, 0, 255, 180, 150);
  fill(0, alpha);
  noStroke();
  rect(0, 0, width, height);

  stroke(strokeColor.color());
  strokeWeight(strokeSlider.value());
  noFill();

  var wave = fft.waveform()
  if (shapeSelect.selected() == 'circle') {
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
    var p = new Particle()
    particles.push(p)
    for (var i = particles.length - 1; i >= 0; i--) {
      if (!particles[i].edges()) {
        particles[i].update(amp > 230)
        particles[i].show()
      } else {
        particles.splice(i, 1)
      }
      
    }
  } else {
    beginShape()
    for (var i = 0; i < width*2; i++) {
      var index = floor(map(i, 0, width*2, 0, wave.length))
      
      var x = i - width
      var y = wave[index] * 100 
      vertex(x, y)
    }
    endShape()
  }
  
  let val = map(song.currentTime(), 0, song.duration(), 0, 1);
  if (song.isPlaying()) {
    slider.value(val);
  }
  
}

function mouseClicked() {
  // Check if the mouse is not over the slider
  if (!slider.elt.matches(':hover')) {
    if (song.isPlaying()) {
      song.pause();
      // noLoop(); // Remove this to keep the draw loop running
    } else {
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
  constructor() {
    this.pos = p5.Vector.random2D().mult(250)
    this.vel = createVector(0, 0)
    this.acc = this.pos.copy().mult(random(0.0001, 0.00001))

    this.w = random(3, 5)

    // this.color = [random(20, 255), random(200, 255), random(200, 255),]
    this.color = particleColor.color();
  }
  update(cond) {
    this.vel.add(this.acc)
    this.pos.add(this.vel)
    if (cond) {
      this.pos.add(this.vel)
      this.pos.add(this.vel)
      this.pos.add(this.vel)
    }
  }
  edges() {
    if (this.pos.x < -width / 2 || this.pos.x > width / 2 || this.pos.y < -height / 2 || this.pos.y > height / 2) {
      return true
    } else {
      return false
    }
  }
  show() {
    noStroke()
    fill(this.color)
    ellipse(this.pos.x, this.pos.y, this.w)
  }
}
