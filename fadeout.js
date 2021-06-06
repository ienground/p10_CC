// 초반 서울자전거 로고
let theta = 0; // 시작값, 의미없는 숫자
let vel = 0.03; // 속도, 올릴수록 빨라짐
let a1, a2; // 원의 중심
let size = 280; let size2 = 40; let weight = 80; //원의 크기
let fc; // 누른 시점의 프레임카운트 계산용
let fdg = 20 // 원 움직이는 속도, 작을수록 빠름
let clicked = false; // 트랜지션 넘어가는 시점

//구름
let c1x = 1062; let c1y = 130; // 구름의 좌표
let c2x = 834; let c2y = 130;

// 자전거 타는 사람
let bodyx = 864; let bodyy = 127; // 몸통 중심 좌표
let bikex = 882; let bikey = 203; // 자전거 중심 좌표
let hipx = 851; let hipy = 175; // 엉덩이(자전거 안장) 좌표
let kneex = 892; let kneey = 184; // 무릎의 y좌표는 움직이는 중심
let pedalx = 872; let pedaly = 227; let r = 11; // 페달이 그리는 원의 중심과 발 돌아가는 반지름
let feet = 15; let feetrange = 10 // 다리 두께와 무릎 가동범위

function setup() {
    createCanvas(windowWidth, windowHeight);

    bike = loadImage("bike.png");
    wheel = loadImage("wheel.png");
    cloud1 = loadImage("cloud1.png");
    cloud2 = loadImage("cloud2.png");
    body = loadImage("body.png");
}

function draw() {

    if (clicked) {
        fill(5,39,57, 210); noStroke();
        ellipse(a2, height/2, size);
        stroke(48,226,145, 210); noFill(); strokeWeight(weight);
        ellipse(a1, height/2, 200);

        if (frameCount < fc + 18) {
            size += 80; weight += 80;

        } else if (frameCount < fc + 55) {
            fill(245); noStroke();
            ellipse(width/2, height/2, size2);
            size2 += 60;

        } else {

            //
            // 모든 draw()는 여기에 적어주세요
            //

            background(245);

            noStroke(); // 하늘입니다
            for (let i = 100; i >= 0; i--) {
                let c = lerpColor(color('#aedcf0'), color(245), i / 100);
                fill(c);
                ellipse(878, 180, 5*i, 3*i);
            }



            // 자전거 타는 사람
            stroke(20,31,103); strokeWeight(feet); imageMode(CENTER);

            c1y += map(sin(frameCount/25),-1,1,-0.5,0.5);
            c2y += map(cos(frameCount/25),-1,1,-0.5,0.5);
            if (c1x == 609) {
                c1x = 1062
            } else {
                c1x -= 1
            }
            if (c2x == 609) {
                c2x = 1062
            } else {
                c2x -= 1
            }
            image(cloud1,c1x,c1y,135,90); // 구름
            image(cloud2,c2x,c2y,135,90);

            let knee1 = kneey + map(sin(theta),-1,1,-feetrange,feetrange); // 다리 가동 범위
            let knee2 = kneey + map(cos(theta),-1,1,-feetrange,feetrange);

            let x1 = r * cos(theta) + pedalx
            let x2 = r * -cos(theta) + pedalx
            let y1 = r * sin(theta) + pedaly
            let y2 = r * -sin(theta) + pedaly

            push();
            translate(834,226);
            rotate(theta*1.5);
            image(wheel, 0, 0, 53,53); // 돌아가는 바퀴
            pop();

            push();
            translate(930,226);
            rotate(theta*1.5);
            image(wheel, 0, 0, 53,53);
            pop();


            line(hipx, hipy, kneex, knee1); // 엉덩이부터 무릎
            line(kneex, knee1, x1, y1); // 무릎부터 발
            stroke(120,31,43); strokeWeight(feet-6);
            line(x1-3, y1+3, x1+15, y1+3); //발

            image(bike,bikex,bikey,150, 98); // 자전거

            stroke(30,41,138); strokeWeight(feet);
            line(hipx, hipy, kneex, knee2);
            line(kneex, knee2, x2, y2);
            stroke(120,31,43); strokeWeight(feet-6);
            line(x2-3, y2+3, x2+15, y2+3);

            image(body,bodyx,bodyy,86,104); // 몸통

            theta += vel;
        }


    } else {
        background(255);
        a1 = width/2 + map(sin(frameCount/fdg),-1,1,-120,120);
        a2 = width/2 - map(sin(frameCount/fdg),-1,1,-120,120);
        fill(5,39,57, 210); noStroke();
        ellipse(a2, height/2, size);

        stroke(48,226,145, 210); noFill(); strokeWeight(weight);
        ellipse(a1, height/2, 200);
    }
}


function mousePressed() {
    console.log(mouseX, mouseY)
    if (!clicked) {
        clicked = true;
        fc = frameCount;
    } else {
        // 만약 이 코드를 오프닝으로 쓸거면 모든 mousePressed() 코드를 여기다가 작성해야 함
    }
}