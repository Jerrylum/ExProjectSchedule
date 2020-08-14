let all_activity = {};
let all_critical_path = [];
let ctx;

function forceInputUppercase(e) {
    var start = e.target.selectionStart;
    var end = e.target.selectionEnd;
    e.target.value = e.target.value.toUpperCase();
    e.target.setSelectionRange(start, end);
}

document.querySelectorAll("#InputArea table input").forEach((x) => { x.addEventListener("keyup", forceInputUppercase, false); })

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawOutputTable(t) {
    var table = document.createElement("table");

    table.innerHTML =
        `<tr><td>${t.num1}</td><td>${t.num2}</td><td>${t.num3}</td><tr>` +
        `<tr><td colspan="3">${t.name}</td><tr>` +
        `<tr><td>${t.num4}</td><td>${t.num5}</td><td>${t.num6}</td><tr>`;

    document.querySelector("#OutputTables").appendChild(table);
}

function display() {
    document.querySelector("#OutputTables").innerHTML = "";

    for (let key in all_activity) drawOutputTable(all_activity[key]);

    displayConnectionInfo();

    findCriticalPath([], all_activity["start"]);

    displayCriticalPathInfo();

    displayGanttChart();
}

function displayConnectionInfo() {
    let msg = "";

    for (let key in all_activity) {
        let a = all_activity[key];
        msg += `${a.name} > ${a.connectTo}\n`;
    }

    document.querySelector("#Connect").innerText = msg;
}

function displayCriticalPathInfo() {
    let msg = "";
    all_critical_path.forEach((x) => { msg += x.join(" > ") + "\n"; })

    document.querySelector("#CriticalPath").innerText = msg;
}

function displayGanttChart() {
    let keys = Object.keys(all_activity);
    let max_time = all_activity["end"].num3;

    let canvas_width = 70 + (max_time + 1) * 30;
    let canvas_height = 30 + (Object.keys(all_activity).length - 2) * 40; // ignore start and end

    let canvas = document.querySelector("#OutputGanttChart");
    canvas.width = canvas_width;
    canvas.height = canvas_height;
    ctx = canvas.getContext("2d");

    ctx.font = "12px Arial";


    ctx.strokeStyle = '#EEE';
    for (let i = 0; i <= max_time; i++) {
        ctx.lineWidth = 1;
        drawLine(50 + (i * 30), 0, 50 + (i * 30), canvas_height);

        const value_str = i + 1 + "";
        const value_x = 50 + (i * 30) + (30 - ctx.measureText(value_str).width) / 2;
        ctx.fillText(value_str, value_x, 20);
    }

    drawLine(0, 30, canvas_width, 30);

    let i = 0;
    for (let key in all_activity) {
        let a = all_activity[key];

        if (a.name == "start" || a.name == "end") continue;

        const h = 50 + (i * 40);

        ctx.strokeStyle = '#00F';
        ctx.lineWidth = 10;
        ctx.fillText(a.name, 30, h);
        drawLine(50 + (a.num1 * 30), h - 5, 50 + (a.num3 * 30), h - 5);

        ctx.strokeStyle = '#777';
        ctx.lineWidth = 1;

        a.connectTo.forEach((to_name) => {
            if (to_name == "end") return;

            let to_a = all_activity[to_name];

            let m = 50 + (to_a.num1 * 30) + 3;
            let n = h - 5;
            let o = 50 + (keys.indexOf(to_name) - 1) * 40 - 5; // -1 because we ignored "start"
            drawLine(50 + (a.num3 * 30), n, m, n);
            drawLine(m, n, m, o);
        });

        i++;
    }
}

function findCriticalPath(paths, now) {
    if (now.num5 != 0) return;

    if (now.name == "end")
        all_critical_path.push(paths);
    else { //start ignored
        if (now.name != "start")
            paths.push(now.name);
        now.connectTo.forEach((x) => {
            findCriticalPath(paths.slice(), all_activity[x]);
        });
    }
}


function eventConfirmChange() {
    all_activity = {
        start: new Activity("start", [], 0)
    };
    all_critical_path = [];

    let tr_list = document.querySelectorAll("#InputArea table .content");

    for (let i = 0; i < tr_list.length; i++) {
        let tr = tr_list[i];
        let td_list = tr.querySelectorAll("td");
        let [c0, c1, c2] = td_list;
        let name = c0.innerText;
        let d = c1.querySelector("input").value.replace(/\s/g, "").toUpperCase().split(",")
        if (d.length == 1 && d[0] == "")
            d = ["start"];
        let dd = parseFloat(c2.querySelector("input").value);

        if (!isNaN(dd)) // without empty activity
            all_activity[c0.innerText] = new Activity(name, d, dd);
    }

    all_activity["end"] = new Activity("end", [], 0);

    for (let key in all_activity) all_activity[key].familiarize();

    all_activity["start"].calculateTop(0);
    all_activity["start"].calculateTop(0);

    console.log(all_activity);

    display();
}