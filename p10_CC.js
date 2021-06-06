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

class J {
    x = 0;

    constructor(i) {
        this.i = i;
    }

    move() {
        this.x = 4;
    }
}

let stations;
let checked_id = [181, 182, 185, 207, 215, 221, 227, 248, 249, 260, 299, 439, 440, 502, 515, 542, 543, 544, 548, 556, 593, 825, 836, 837, 839, 844, 852, 869, 870, 1122, 1289, 2076, 2078, 2217, 2262, 2314, 2547, 2604, 2613, 2645, 3528, 3539, 3550, 3627, 3677, 3787, 3788, 3789, 3794, 3868, 4153, 4483, 4500, 4585, 4605, 4617, 4859, 4863];
let img_hangang;

let gmSansBold, gmSansLight, gmSansMedium;
let temperature = 0;
let weather = "";
let weatherIcon;

let minLat = 9999.0;
let maxLat = -9999.0;
let minLng = 9999.0;
let maxLng = -9999.0;


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
                }

                if (lat < minLat) {
                    minLat = lat;
                }

                if (lng > maxLng) {
                    maxLng = lng;
                }

                if (lng < minLng) {
                    minLng = lng;
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
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    colorMode(RGB);

    background(255);

    print(stations);
    print("minLat:" + minLat);
    print("maxLat:" + maxLat);
    print("minLng:" + minLng);
    print("maxLng:" + maxLng);

    for (let data of stations.values()) {
        let px = map(data.lat, 37.557682, 37.570453, 0, width);
        let py = map(data.lng, 127.001721, 126.996150, 0, height);
        print(px + "/" + data.lat +","+py+"/"+data.lng);
    }

}

function draw() {
    background(235);

    // 1분에 한 번씩 update.

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

                    stations.set(id, new Station(id, stationName, lat, lng, totalCount, parkingCount));
                }
            }
        }
    }


    createUI();

    for (let data of stations.values()) {
        let px = map(data.lat, 37.51083755, 37.5841713, 0, width);
        let py = map(data.lng, 127.15859985, 126.81932831, 200, height);
        // let px = map(data.lat, 37.557682, 37.570453, 0, width);
        // let py = map(data.lng, 127.001721, 126.996150, 0, height);

        fill(255, 0, 0);
        circle(px, py, 10);
        fill(0);
        textAlign(CENTER);
        // text(data.stationName, px, py - 10);
    }




}

function createUI() {
    // image(img_hangang, 0, 0, width, height);
    noStroke();
    fill(235);
    rect(0, 0, width, 100);
    fill(255);
    rect(0, 50, width, 50, 50, 50, 0, 0);

    // time
    let date = new Date();
    let timeStr = date.toLocaleTimeString();

    fill(0);
    textSize(14);
    textAlign(LEFT, CENTER);
    textFont(gmSansBold);
    text(timeStr, 20, 25);

    // weather
    textAlign(RIGHT, CENTER);
    text(round(temperature) + "°C, " + weather, width - 20, 25);
    image(weatherIcon, width - textWidth(round(temperature) + "°C, " + weather) - 60, 10, 30, 30);

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