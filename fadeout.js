function setup() {
    createCanvas(windowWidth, windowHeight);
}

function draw() {
    background(255);

    noStroke();
    for (let i = 100; i >= 0; i--) {
        let c = lerpColor(color('#FF4081'), color(255), i / 100);
        fill(c);

        ellipse(width / 2, height / 2, 2 * i, i);
    }
}