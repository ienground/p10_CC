/**
 * Developed by
 * @ienground_
 * @szsgn
 * @ziii_xpalette
 *
 * Ericano Rhee on github.com/ienground
 */

class Station {
    constructor(id, stationName, lat, lng, totalCount, parkingCount) {
        this.id = id;
        this.stationName = stationName;
        this.lat = lat;
        this.lng = lng;
        this.totalCount = totalCount;
        this.parkingCount = parkingCount;
    }
}

let stations;
let checked_id = [181, 182, 185, 207, 215, 221, 227, 248, 249, 260, 299, 439, 440, 502, 515, 542, 543, 544, 548, 556, 593, 825, 836, 837, 839, 844, 852, 869, 870, 1122, 1289, 2076, 2078, 2217, 2262, 2314, 2547, 2604, 2613, 2645, 3528, 3539, 3550, 3627, 3677, 3787, 3788, 3789, 3794, 3868, 4153, 4483, 4500, 4585, 4605, 4617, 4859, 4863];

let gmSansBold, gmSansLight, gmSansMedium;
let temperature = 0;
let weather = "";
let weatherIcon;

let minLat = 9999.0;
let maxLat = -9999.0;
let minLng = 9999.0;
let maxLng = -9999.0;

let minLatItem, maxLatItem, minLngItem, maxLngItem;
let imgStartX, imgEndX, imgStartY, imgEndY, imgWidth, imgHeight;
let date;

// 초반 서울자전거 로고
let theta = 0; // 시작값, 의미없는 숫자
let vel = 0.03; // 속도, 올릴수록 빨라짐
let center1, center2; // 원의 중심
let size = 280, size2 = 40, weight = 80; //원의 크기
let push_frame; // 누른 시점의 프레임카운트 계산용
let fdg = 0.5; // 원 움직이는 속도, 작을수록 빠름
let clicked = false; // 트랜지션 넘어가는 시점
let introFinished = false;
//구름
let c1x = 184; let c1y = -50; // 구름의 좌표
let c2x = -44; let c2y = 130;

// 자전거 타는 사람
let bodyx = -14, bodyy = -53; // 몸통 중심 좌표
let bikex = 4, bikey = 23; // 자전거 중심 좌표
let hipx = -27, hipy = -5; // 엉덩이(자전거 안장) 좌표
let kneex = 14, kneey = 4; // 무릎의 y좌표는 움직이는 중심
let pedalx = -6, pedaly = 47, pedalr = 11; // 페달이 그리는 원의 중심과 발 돌아가는 반지름
let feet = 15; let feetrange = 10 // 다리 두께와 무릎 가동범위

// 이미지 리소스
let img_hangang, img_bike, img_wheel, img_cloud1, img_cloud2, img_body;

function preload() {
    gmSansBold = loadFont("assets/GmarketSansBold.otf");
    gmSansLight = loadFont("assets/GmarketSansLight.otf");
    gmSansMedium = loadFont("assets/GmarketSansMedium.otf");
    stations = new Map();

    for (let i = 0; i < 3; i++) {
        let requestURL = "http://openapi.seoul.go.kr:8088/4f5a634b50657269373353434c6745/json/bikeList/" + (i * 1000 + 1) + "/" + ((i + 1) * 1000);
        let request = new XMLHttpRequest();
        request.open("GET", requestURL);
        request.responseType = "json";
        request.send();

        request.onload = function() {
            let response = request.response;
            for (let j = 0; j < response["rentBikeStatus"]["row"].length; j++) {
                let item = response["rentBikeStatus"]["row"][j];
                let id = item["stationName"].split(".")[0].trim();
                let stationName = item["stationName"].split(".")[1].trim();
                if (!checked_id.includes(parseInt(id))) continue;

                let parkingCount = parseInt(item["parkingBikeTotCnt"]);
                let totalCount = parseInt(item["rackTotCnt"]);
                let lat = parseFloat(item["stationLatitude"]);
                let lng = parseFloat(item["stationLongitude"]);

                if (lat > maxLat) {
                    maxLat = lat;
                    maxLatItem = stationName;
                }

                if (lat < minLat) {
                    minLat = lat;
                    minLatItem = stationName;
                }

                if (lng > maxLng) {
                    maxLng = lng;
                    maxLngItem = stationName;
                }

                if (lng < minLng) {
                    minLng = lng;
                    minLngItem = stationName;
                }

                stations.set(id, new Station(id, stationName, lat, lng, totalCount, parkingCount));
            }
        }
    }

    // weather
    let weatherRequestURL = "http://api.openweathermap.org/data/2.5/weather?q=Seoul&lang=kr&appid=34d93a158ff1c52969247f83ff82a857"
    let weatherRequest = new XMLHttpRequest();
    weatherRequest.open("GET", weatherRequestURL);
    weatherRequest.responseType = "json";
    weatherRequest.send();

    weatherRequest.onload = function() {
        let response = weatherRequest.response;
        print(response);
        temperature = parseFloat(response["main"]["temp"]) - 273.15;
        weather = response["weather"][0]["description"];
        weatherIcon = createImg("http://openweathermap.org/img/wn/" + response["weather"][0]["icon"] + "@2x.png", weather);
        weatherIcon.hide();
    }

    img_hangang = loadImage("assets/hangang.png");
    bike = loadImage("assets/bike.png");
    wheel = loadImage("assets/wheel.png");
    cloud1 = loadImage("assets/cloud1.png");
    cloud2 = loadImage("assets/cloud2.png");
    body = loadImage("assets/body.png");
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    colorMode(RGB);

    background(255);

    // imgWidth == width일 때의 height
    let heightOfFullWidth = img_hangang.height * width / img_hangang.width;
    let widthOfFullHeight = img_hangang.width * (height - 100) / img_hangang.height;

    if (heightOfFullWidth <= height - 100) { //
        imgStartX = 0;
        imgEndX = width;
        imgStartY = height - heightOfFullWidth + 100;
        imgEndY = height;
        imgWidth = width;
        imgHeight = heightOfFullWidth;
    } else {
        imgStartX = (width - widthOfFullHeight) / 2;
        imgEndX = (width + widthOfFullHeight) / 2;
        imgStartY = 100;
        imgEndY = height;
        imgWidth = widthOfFullHeight;
        imgHeight = height - 100;
    }
}

function draw() {
    if (clicked) {
        if (!introFinished) {
            noStroke();
            fill(5, 29, 57, 210);
            circle(center2, height / 2, size);

            noFill();
            stroke(48, 226, 145, 210);
            strokeWeight(weight);
            circle(center1, height / 2, 200);
        }

        if (frameCount < push_frame + 18) {
            size += 80;
            weight += 80;
        } else if (frameCount < push_frame + 55) {
            noStroke();
            fill(245);
            circle(width / 2, height / 2, size2);
            size2 += 60;

        } else {
            introFinished = true;
            date = new Date();

            colorMode(RGB);
            background(20);
            // drawSkyBackground(date.getHours(), date.getMinutes());
            //
            //
            // // 1분에 한 번씩 update.
            //
            if (frameCount % (60 * 60) === 0) {
                for (let i = 0; i < 3; i++) {
                    let requestURL = "http://openapi.seoul.go.kr:8088/4f5a634b50657269373353434c6745/json/bikeList/" + (i * 1000 + 1) + "/" + ((i + 1) * 1000);
                    let request = new XMLHttpRequest();
                    request.open("GET", requestURL);
                    request.responseType = "json";
                    request.send();

                    request.onload = function () {
                        let response = request.response;
                        for (let j = 0; j < response["rentBikeStatus"]["row"].length; j++) {
                            let item = response["rentBikeStatus"]["row"][j];
                            let id = item["stationName"].split(".")[0].trim();
                            let stationName = item["stationName"].split(".")[1].trim();
                            if (!checked_id.includes(parseInt(id))) continue;

                            let parkingCount = item["parkingBikeTotCnt"];
                            let totalCount = item["rackTotCnt"];
                            let lat = item["stationLatitude"];
                            let lng = item["stationLongitude"];

                            if (lat > maxLat) {
                                maxLat = lat;
                                maxLatItem = stationName;
                            }

                            if (lat < minLat) {
                                minLat = lat;
                                minLatItem = stationName;
                            }

                            if (lng > maxLng) {
                                maxLng = lng;
                                maxLngItem = stationName;
                            }

                            if (lng < minLng) {
                                minLng = lng;
                                minLngItem = stationName;
                            }

                            stations.set(id, new Station(id, stationName, lat, lng, totalCount, parkingCount));
                        }
                    }
                }
            }


            createUI();

            let opx = map(stations.get("3788").lng, 127.15859985, 126.81932831, imgEndX, imgStartX);
            let opy = map(stations.get("3788").lat, 37.51083755, 37.5841713, imgEndY - 128 * imgHeight / 837, imgStartY + 354 * imgHeight / 837);

            push();
            translate(opx, opy);
            rotate(-1);
            for (let data of stations.values()) {
                let px = map(data.lng, 127.15859985, 126.81932831, imgEndX, imgStartX);
                let py = map(data.lat, 37.51083755, 37.5841713, imgEndY - 128 * imgHeight / 837, imgStartY + 354 * imgHeight / 837);

                fill(255, 0, 0);
                circle(px - opx, py - opy, 10);
                fill(0);
                textAlign(CENTER);
                // text(data.stationName, px - opx, py - opy - 10);
            }
            pop();

            // 자전거 타는 사람
            drawBicycle(width - 150, 200, 0.8);


        }
    } else {
        background(255);
        center1 = width / 2 + map(sin(frameCount / fdg), -1, 1, -120, 120);
        center2 = width / 2 - map(sin(frameCount / fdg), -1, 1, -120, 120);

        noStroke();
        fill(5, 39, 57, 210);
        circle(center2, height / 2, size);

        noFill();
        stroke(48, 226, 125, 210);
        strokeWeight(weight);
        circle(center1, height / 2, 200);
    }

}

function drawBicycle(x, y, size) {
    noStroke();
    push();
    angleMode(DEGREES);
    translate(x, y);
    scale(size);
    for (let i = 100; i >= 0; i--) {
        let c = lerpColor(color('#aedcf0'), color(255), i / 100);
        fill(c);
        ellipse(0, 0, 5 * i, 3 * i);
    }

    // 자전거 타는 사람
    stroke(20,31,103);
    strokeWeight(feet);
    imageMode(CENTER);

    c1y += map(sin(frameCount / 25),-1,1,-0.5,0.5);
    c2y += map(cos(frameCount / 25),-1,1,-0.5,0.5);
    if (c1x === -269) {
        c1x = 184;
    } else {
        c1x -= 1;
    }
    if (c2x === -269) {
        c2x = 184;
    } else {
        c2x -= 1;
    }

    image(cloud1, c1x, c1y,135,90); // 구름
    image(cloud2, c2x, c2y,135,90);

    let knee1 = kneey + map(sin(theta),-1,1, -feetrange, feetrange); // 다리 가동 범위
    let knee2 = kneey + map(cos(theta),-1,1, -feetrange, feetrange);

    let x1 = pedalr * cos(theta) + pedalx;
    let x2 = pedalr * -cos(theta) + pedalx;
    let y1 = pedalr * sin(theta) + pedaly;
    let y2 = pedalr * -sin(theta) + pedaly;

    push();
    translate(-44,46);
    rotate(theta);
    image(wheel, 0, 0, 53,53); // 돌아가는 바퀴
    pop();

    push();
    translate(52,46);
    rotate(theta);
    image(wheel, 0, 0, 53,53);
    pop();


    line(hipx, hipy, kneex, knee1); // 엉덩이부터 무릎
    line(kneex, knee1, x1, y1); // 무릎부터 발
    stroke(120,31,43);
    strokeWeight(feet - 6);
    line(x1 - 3, y1 + 3, x1 + 15, y1 + 3); //발

    image(bike, bikex, bikey,150, 98); // 자전거

    stroke(30,41,138);
    strokeWeight(feet);
    line(hipx, hipy, kneex, knee2);
    line(kneex, knee2, x2, y2);
    stroke(120,31,43);
    strokeWeight(feet - 6);
    line(x2 - 3, y2 + 3, x2 + 15, y2 + 3);

    image(body, bodyx, bodyy,86,104); // 몸통

    theta += 2

    pop();
}

function drawSkyBackground(h, m) {
    colorMode(HSB);

    let color1, color2, timeMap;
    let time = h * 60 + m;

    if (h >= 6 && h <= 17) { // 6 ~ 17
        timeMap = map(time, 360, 1079, 10, 70);
        color1 = color(197, timeMap, 100);
        color2 = color(197, timeMap + 20, 100);
    } else if (h === 18 && m <= 30) { // ~ 18:30
        timeMap = map(time, 1080, 1139, 100, 70);
        color1 = color(197, timeMap, 90);
        color2 = color(197, timeMap + 30, 90 - timeMap / 70);
    } else if (h === 18) { // 18:30 ~ 19
        timeMap = map(time, 1111, 1259, 197, 329);
        color1 = color(timeMap, 50, 100);
        color2 = color(timeMap + 30, 30, 100 - timeMap / 50);
    } else if (h >= 19 && h <= 20) { // Sunset. 19 ~ 20
        timeMap = map(time, 1111, 1259, 197, 329);
        color1 = color(timeMap, 50, 100);
        color2 = color(timeMap + 30, 30, 100 - timeMap / 50);
    } else if (h >= 21 && h <= 23) { // 21 ~ 23
        timeMap = map(time, 1200, 1439, 100, 10);
        color1 = color(226, 80, timeMap);
        color2 = color(235, 80, timeMap);
    } else if (h >= 0 && h <= 4) { // 새벽, 0 ~ 5
        color1 = color(226, 80, 100);
        color2 = color(235, 80, 10);
    } else if (h === 5) {
        timeMap = map(time, 300, 359, 1, 29);
        let timeMap2 = map(time, 300, 359, 10, 100);
        let timeMap3 = map(time, 300, 359, 1, 70);

        color1 = color(226 - timeMap, 80 - timeMap3, timeMap2);
        color2 = color(226 - timeMap, 100 - timeMap3, timeMap2);
    }

    for (let dy = 0; dy < height; dy += 15) {
        let point = map(dy, 0, height, 0, 1);
        let c = lerpColor(color1, color2, point);
        stroke(c);
        line(0, dy, width, dy);
    }
}

function createUI() {
    // time
    let timeStr = date.toLocaleTimeString();

    noStroke();
    fill(255);
    rect(0, 100, imgStartX + 1, height - 100);
    rect(imgEndX - 1, 100, imgStartX + 1, height - 100);
    image(img_hangang, imgStartX, imgStartY, imgWidth, imgHeight);

    noStroke();
    fill(235);
    // rect(0, 0, width, 100);
    fill(255);
    rect(0, 50, width, 50, 50, 50, 0, 0);

    if (date.getHours() >= 8 && date.getHours() <= 17) {
        fill(0);
    } else {
        fill(255);
    }
    textSize(14);
    textAlign(LEFT, CENTER);
    textFont(gmSansBold);
    text(timeStr, 20, 25);

    // weather
    textAlign(RIGHT, CENTER);
    text(round(temperature) + "°C, " + weather, width - 20, 25);
    image(weatherIcon, width - textWidth(round(temperature) + "°C, " + weather) - 60, 10, 30, 30);

}

function mouseClicked() {
    // print(mouseX, mouseY);
    // print(imgHeight);
    // print(imgEndY);
    //
    // for (let data of stations.values()) {
    //     let px = map(data.lng, 127.15859985, 126.81932831, imgEndX, imgStartX);
    //     let py = map(data.lat, 37.51083755, 37.5841713, imgEndY - 128 * imgHeight / 837, imgStartY + 354 * imgHeight / 837);
    //     print(px + "/" + data.lat +","+py+"/"+data.lng);
    // }

    // print("minLat:" + minLat + "/" + minLatItem);
    // print("maxLat:" + maxLat + "/" + maxLatItem);
    // print("minLng:" + minLng + "/" + minLngItem);
    // print("maxLng:" + maxLng + "/" + maxLngItem);
    // print(imgHeight)

    if (!clicked) {
        clicked = true;
        push_frame = frameCount;
    }

}

function getInverseColor(colorString) {
    let c = color(colorString);
    let r = 255 - red(c);
    let g = 255 - green(c);
    let b = 255 - blue(c);

    return color(r, g, b);
}

function mouseWheel(event) {
    // if (event.delta < 0  && barrierRadius < 400) {
    //     barrierRadius += 2;
    // } else if (event.delta > 0 && barrierRadius > 100) { // minimum barrier radius 70
    //     barrierRadius -= 2;
    // }
}

function getData() {

}

function keyPressed(key) {
    switch (key.key) {

    }
}

function getRandomInt(min, max) {
    return Math.floor(random(min, max + 1));
}