/* =========================================================
   ORBITAL SENTINEL
   SPACECRAFT TELEMETRY MONITOR
   Demo Flow:

   NORMAL
      ↓
   WARNING
      ↓
   ANOMALY
      ↓
   RECOVERY
      ↓
   NORMAL
========================================================= */


/* =========================================================
   SETTINGS
========================================================= */

const MAX_POINTS = 60;

// Demo timing
const NORMAL_TIME = 15000;
const WARNING_TIME = 8000;
const ANOMALY_TIME = 10000;
const RECOVERY_TIME = 10000;


/* =========================================================
   SYSTEM STATE
========================================================= */

let systemPhase = "normal";

let anomalyDetected = false;

let anomalyRecorded = false;

let phaseTimer = null;


/* =========================================================
   TELEMETRY
========================================================= */

let telemetry = {

    temperature: 32.4,
    voltage: 3.72,
    current: 1.21,
    solar: 4.52,
    anomalyScore: 0.10

};


/* =========================================================
   NORMAL VALUES
========================================================= */

const NORMAL = {

    temperature: 32.4,
    voltage: 3.72,
    current: 1.21,
    solar: 4.52,
    anomalyScore: 0.10

};


/* =========================================================
   HISTORY
========================================================= */

const history = {

    temperature: [],
    voltage: [],
    current: [],
    solar: [],
    anomalyScore: []

};


/* =========================================================
   ANOMALY HISTORY
========================================================= */

let anomalyHistory = [];


/* =========================================================
   DYNAMIC THRESHOLD
========================================================= */

let dynamicThreshold = 0.43;


/* =========================================================
   INITIAL DATA
========================================================= */

for (let i = 0; i < MAX_POINTS; i++) {

    history.temperature.push(
        31.8 + Math.random() * 1.2
    );

    history.voltage.push(
        3.68 + Math.random() * 0.06
    );

    history.current.push(
        1.10 + Math.random() * 0.15
    );

    history.solar.push(
        4.25 + Math.random() * 0.45
    );

    history.anomalyScore.push(
        0.08 + Math.random() * 0.05
    );

}


/* =========================================================
   CHART SETTINGS
========================================================= */

const chartSettings = {

    temperature: {
        min: 25,
        max: 45,
        threshold: 40,
        unit: "°C",
        color: "#38bdf8"
    },

    voltage: {
        min: 3.2,
        max: 4,
        threshold: 3.4,
        unit: "V",
        color: "#a78bfa"
    },

    current: {
        min: 0.7,
        max: 2,
        threshold: 1.7,
        unit: "A",
        color: "#fb923c"
    },

    solar: {
        min: 1.5,
        max: 5.5,
        threshold: 2.5,
        unit: "W",
        color: "#facc15"
    },

    anomalyScore: {
        min: 0,
        max: 1,
        threshold: dynamicThreshold,
        unit: "",
        color: "#f87171"
    }

};


/* =========================================================
   CANVAS
========================================================= */

const canvases = {

    temperature:
        document.getElementById("temperatureChart"),

    voltage:
        document.getElementById("voltageChart"),

    current:
        document.getElementById("currentChart"),

    solar:
        document.getElementById("solarChart"),

    anomalyScore:
        document.getElementById("anomalyChart")

};


/* =========================================================
   DRAW CHART
========================================================= */

function drawChart(canvas, values, config) {

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const width = Math.max(rect.width, 250);

    const height = 170;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /* Background */

    ctx.fillStyle = "#010611";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    const left = 45;
    const right = 12;
    const top = 10;
    const bottom = 20;

    const graphWidth =
        width - left - right;

    const graphHeight =
        height - top - bottom;


    /* Grid */

    ctx.strokeStyle =
        "rgba(148,163,184,.10)";

    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {

        const y =
            top +
            graphHeight * i / 4;

        ctx.beginPath();

        ctx.moveTo(left, y);

        ctx.lineTo(
            width - right,
            y
        );

        ctx.stroke();

    }


    /* Y axis labels */

    ctx.fillStyle = "#64748b";

    ctx.font = "9px Segoe UI";

    for (let i = 0; i <= 4; i++) {

        const value =
            config.max -
            (
                config.max -
                config.min
            ) * i / 4;

        const y =
            top +
            graphHeight * i / 4;

        ctx.fillText(
            value.toFixed(2) + config.unit,
            4,
            y + 3
        );

    }


    /* Threshold */

    let thresholdPosition =
        (
            config.threshold -
            config.min
        ) /
        (
            config.max -
            config.min
        );

    thresholdPosition =
        Math.max(
            0,
            Math.min(
                1,
                thresholdPosition
            )
        );

    const thresholdY =
        top +
        graphHeight *
        (
            1 -
            thresholdPosition
        );

    ctx.save();

    ctx.setLineDash([5, 5]);

    ctx.strokeStyle =
        "rgba(248,113,113,.45)";

    ctx.beginPath();

    ctx.moveTo(
        left,
        thresholdY
    );

    ctx.lineTo(
        width - right,
        thresholdY
    );

    ctx.stroke();

    ctx.restore();


    /* Need at least two points */

    if (values.length < 2) return;


    /* Data line */

    ctx.beginPath();

    values.forEach(
        (value, index) => {

            const x =
                left +
                (
                    index /
                    (values.length - 1)
                ) *
                graphWidth;

            let normalized =
                (
                    value -
                    config.min
                ) /
                (
                    config.max -
                    config.min
                );

            normalized =
                Math.max(
                    0,
                    Math.min(
                        1,
                        normalized
                    )
                );

            const y =
                top +
                graphHeight *
                (
                    1 -
                    normalized
                );

            if (index === 0) {

                ctx.moveTo(x, y);

            } else {

                ctx.lineTo(x, y);

            }

        }
    );


    ctx.strokeStyle =
        config.color;

    ctx.lineWidth = 2.5;

    ctx.lineJoin = "round";

    ctx.lineCap = "round";

    ctx.shadowBlur = 7;

    ctx.shadowColor =
        config.color;

    ctx.stroke();

    ctx.shadowBlur = 0;


    /* Current point */

    const last =
        values[values.length - 1];

    let normalized =
        (
            last -
            config.min
        ) /
        (
            config.max -
            config.min
        );

    normalized =
        Math.max(
            0,
            Math.min(
                1,
                normalized
            )
        );

    const lastX =
        left + graphWidth;

    const lastY =
        top +
        graphHeight *
        (
            1 -
            normalized
        );

    ctx.beginPath();

    ctx.arc(
        lastX,
        lastY,
        4,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        config.color;

    ctx.fill();


    /* Alert ring */

    if (
        config === chartSettings.anomalyScore &&
        last >= dynamicThreshold
    ) {

        ctx.beginPath();

        ctx.arc(
            lastX,
            lastY,
            9,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "#f87171";

        ctx.lineWidth = 2;

        ctx.stroke();

    }

}


/* =========================================================
   DRAW ALL
========================================================= */

function drawAllCharts() {

    drawChart(
        canvases.temperature,
        history.temperature,
        chartSettings.temperature
    );

    drawChart(
        canvases.voltage,
        history.voltage,
        chartSettings.voltage
    );

    drawChart(
        canvases.current,
        history.current,
        chartSettings.current
    );

    drawChart(
        canvases.solar,
        history.solar,
        chartSettings.solar
    );

    drawChart(
        canvases.anomalyScore,
        history.anomalyScore,
        chartSettings.anomalyScore
    );

}


/* =========================================================
   UPDATE TELEMETRY
========================================================= */

function updateTelemetry() {


    /* =====================================================
       PHASE 1 — NORMAL
    ===================================================== */

    if (systemPhase === "normal") {

        telemetry.temperature +=
            (Math.random() - 0.5) * 0.20;

        telemetry.voltage +=
            (Math.random() - 0.5) * 0.006;

        telemetry.current +=
            (Math.random() - 0.5) * 0.018;

        telemetry.solar +=
            (Math.random() - 0.5) * 0.06;

        telemetry.anomalyScore +=
            (Math.random() - 0.5) * 0.015;


        telemetry.anomalyScore =
            Math.max(
                0.05,
                Math.min(
                    0.20,
                    telemetry.anomalyScore
                )
            );

    }


    /* =====================================================
       PHASE 2 — WARNING
    ===================================================== */

    else if (systemPhase === "warning") {

        /*
           Something is beginning to change.

           TEMP      ↑
           VOLTAGE   ↓
           CURRENT   ↑
           SOLAR     ↓
           SCORE     ↑
        */

        telemetry.temperature +=
            0.10;

        telemetry.voltage -=
            0.008;

        telemetry.current +=
            0.018;

        telemetry.solar -=
            0.06;

        telemetry.anomalyScore +=
            0.035;


        telemetry.anomalyScore =
            Math.min(
                0.55,
                telemetry.anomalyScore
            );

    }


    /* =====================================================
       PHASE 3 — ANOMALY
    ===================================================== */

    else if (systemPhase === "anomaly") {

        /*
           Strong abnormal pattern.
        */

        telemetry.temperature +=
            0.06;

        telemetry.voltage -=
            0.007;

        telemetry.current +=
            0.015;

        telemetry.solar -=
            0.04;

        telemetry.anomalyScore +=
            0.025;


        telemetry.anomalyScore =
            Math.min(
                0.90,
                telemetry.anomalyScore
            );

    }


    /* =====================================================
       PHASE 4 — RECOVERY
    ===================================================== */

    else if (systemPhase === "recovery") {

        /*
           Slowly move back toward
           normal spacecraft behavior.
        */

        telemetry.temperature +=
            (
                NORMAL.temperature -
                telemetry.temperature
            ) * 0.15;

        telemetry.voltage +=
            (
                NORMAL.voltage -
                telemetry.voltage
            ) * 0.15;

        telemetry.current +=
            (
                NORMAL.current -
                telemetry.current
            ) * 0.15;

        telemetry.solar +=
            (
                NORMAL.solar -
                telemetry.solar
            ) * 0.15;

        telemetry.anomalyScore +=
            (
                NORMAL.anomalyScore -
                telemetry.anomalyScore
            ) * 0.20;

    }


    /* =====================================================
       SAFETY LIMITS
    ===================================================== */

    telemetry.temperature =
        Math.max(
            25,
            Math.min(
                45,
                telemetry.temperature
            )
        );

    telemetry.voltage =
        Math.max(
            3.2,
            Math.min(
                4,
                telemetry.voltage
            )
        );

    telemetry.current =
        Math.max(
            0.7,
            Math.min(
                2,
                telemetry.current
            )
        );

    telemetry.solar =
        Math.max(
            1.5,
            Math.min(
                5.5,
                telemetry.solar
            )
        );

    telemetry.anomalyScore =
        Math.max(
            0,
            Math.min(
                1,
                telemetry.anomalyScore
            )
        );


    /* =====================================================
       STORE DATA
    ===================================================== */

    history.temperature.push(
        telemetry.temperature
    );

    history.voltage.push(
        telemetry.voltage
    );

    history.current.push(
        telemetry.current
    );

    history.solar.push(
        telemetry.solar
    );

    history.anomalyScore.push(
        telemetry.anomalyScore
    );


    /* Keep last 60 */

    Object.keys(history).forEach(
        key => {

            if (
                history[key].length >
                MAX_POINTS
            ) {

                history[key].shift();

            }

        }
    );


    updateUI();

    drawAllCharts();

    addTerminalLine();

}


/* =========================================================
   UPDATE UI
========================================================= */

function updateUI() {

    setText(
        "temperatureValue",
        telemetry.temperature.toFixed(1) + " °C"
    );

    setText(
        "voltageValue",
        telemetry.voltage.toFixed(2) + " V"
    );

    setText(
        "currentValue",
        telemetry.current.toFixed(2) + " A"
    );

    setText(
        "solarValue",
        telemetry.solar.toFixed(2) + " W"
    );

    setText(
        "tempCard",
        telemetry.temperature.toFixed(1) + " °C"
    );

    setText(
        "voltCard",
        telemetry.voltage.toFixed(2) + " V"
    );

    setText(
        "currentCard",
        telemetry.current.toFixed(2) + " A"
    );

    setText(
        "solarCard",
        telemetry.solar.toFixed(2) + " W"
    );

    setText(
        "anomalyValue",
        telemetry.anomalyScore.toFixed(2)
    );

    setText(
        "aiScore",
        telemetry.anomalyScore.toFixed(2)
    );

    setText(
        "ndtThreshold",
        dynamicThreshold.toFixed(2)
    );

}


/* =========================================================
   SAFE TEXT UPDATE
========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   NORMAL STATUS
========================================================= */

function showNormalStatus() {

    setText(
        "heroStatus",
        "SYSTEM NOMINAL"
    );

    setText(
        "heroMessage",
        "All spacecraft subsystems operating normally."
    );

    setText(
        "systemStatus",
        "● ONLINE"
    );

    setText(
        "statusCircle",
        "✓"
    );

    setText(
        "twinHealth",
        "NOMINAL"
    );

    setText(
        "riskLevel",
        "LOW"
    );

    setText(
        "riskDescription",
        "Stable operation"
    );

    setText(
        "healthValue",
        "94"
    );


    const progress =
        document.getElementById(
            "healthProgress"
        );

    if (progress) {

        progress.style.width =
            "94%";

        progress.style.background =
            "linear-gradient(90deg,#22c55e,#4ade80,#22d3ee)";

    }


    setText(
        "powerStatus",
        "● NOMINAL"
    );

    setText(
        "batteryStatus",
        "● NOMINAL"
    );

    setText(
        "thermalStatus",
        "● NOMINAL"
    );

    setText(
        "communicationStatus",
        "● NOMINAL"
    );


    document.body.classList.remove(
        "anomaly-mode"
    );

    document.body.classList.remove(
        "warning-mode"
    );

}


/* =========================================================
   WARNING STATUS
========================================================= */

function showWarningStatus() {

    setText(
        "heroStatus",
        "EARLY WARNING"
    );

    setText(
        "heroMessage",
        "AI detected an unusual multivariate pattern."
    );

    setText(
        "systemStatus",
        "● WARNING"
    );

    setText(
        "statusCircle",
        "!"
    );

    setText(
        "twinHealth",
        "WARNING"
    );

    setText(
        "riskLevel",
        "MEDIUM"
    );

    setText(
        "riskDescription",
        "Pattern deviation detected"
    );

    setText(
        "healthValue",
        "81"
    );


    const progress =
        document.getElementById(
            "healthProgress"
        );

    if (progress) {

        progress.style.width =
            "81%";

        progress.style.background =
            "linear-gradient(90deg,#facc15,#fb923c)";

    }


    document.body.classList.add(
        "warning-mode"
    );

    document.body.classList.remove(
        "anomaly-mode"
    );

}


/* =========================================================
   ANOMALY STATUS
========================================================= */

function showAnomalyStatus() {

    setText(
        "heroStatus",
        "ANOMALY DETECTED"
    );

    setText(
        "heroMessage",
        "High-risk multivariate telemetry anomaly detected."
    );

    setText(
        "systemStatus",
        "● ALERT"
    );

    setText(
        "statusCircle",
        "!"
    );

    setText(
        "twinHealth",
        "ANOMALY"
    );

    setText(
        "riskLevel",
        "HIGH"
    );

    setText(
        "riskDescription",
        "Power subsystem"
    );

    setText(
        "healthValue",
        "64"
    );


    const progress =
        document.getElementById(
            "healthProgress"
        );

    if (progress) {

        progress.style.width =
            "64%";

        progress.style.background =
            "linear-gradient(90deg,#f87171,#fb923c)";

    }


    setText(
        "powerStatus",
        "● HIGH RISK"
    );

    setText(
        "batteryStatus",
        "● WARNING"
    );


    document.body.classList.add(
        "anomaly-mode"
    );

    document.body.classList.remove(
        "warning-mode"
    );

}


/* =========================================================
   RECOVERY STATUS
========================================================= */

function showRecoveryStatus() {

    setText(
        "heroStatus",
        "SYSTEM RECOVERY"
    );

    setText(
        "heroMessage",
        "Spacecraft telemetry is returning to nominal conditions."
    );

    setText(
        "systemStatus",
        "● RECOVERING"
    );

    setText(
        "statusCircle",
        "↻"
    );

    setText(
        "twinHealth",
        "RECOVERING"
    );

    setText(
        "riskLevel",
        "MEDIUM"
    );

    setText(
        "riskDescription",
        "Stabilizing"
    );


    document.body.classList.remove(
        "anomaly-mode"
    );

    document.body.classList.add(
        "warning-mode"
    );

}


/* =========================================================
   RECORD ONE ANOMALY
========================================================= */

function recordAnomaly() {

    /*
       CRITICAL:

       If this anomaly has already been
       recorded, DO NOT create another one.
    */

    if (anomalyRecorded) {

        return;

    }


    anomalyRecorded = true;

    anomalyDetected = true;


    const now =
        new Date();


    const event = {

        time:
            now.toLocaleTimeString(),

        timestamp:
            now.toLocaleString(),

        subsystem:
            "Power Subsystem",

        severity:
            "HIGH",

        score:
            telemetry.anomalyScore.toFixed(2),

        contributors: [

            "Battery Voltage ↓",

            "Solar Power ↓",

            "Current ↑",

            "Temperature ↑"

        ]

    };


    anomalyHistory.push(
        event
    );


    console.log(
        "🚨 NEW ANOMALY EVENT",
        event
    );


    addAnomalyRow(
        event
    );


    showLatestAnomaly(
        event
    );

}


/* =========================================================
   ANOMALY TABLE
========================================================= */

function addAnomalyRow(event) {

    const tbody =
        document.getElementById(
            "anomalyTableBody"
        );


    if (!tbody) return;


    const row =
        document.createElement(
            "tr"
        );


    row.innerHTML = `

        <td>
            ${event.time}
        </td>

        <td>
            <span class="location-badge">
                📍 ${event.subsystem}
            </span>
        </td>

        <td>
            <span class="severity-high">
                🔴 ${event.severity}
            </span>
        </td>

        <td>
            ${event.score}
        </td>

        <td>

            ${event.contributors
                .map(
                    item =>
                    `<span class="parameter">
                        ${item}
                    </span>`
                )
                .join(" ")
            }

        </td>

    `;


    tbody.prepend(
        row
    );


    const empty =
        document.getElementById(
            "noAnomaly"
        );

    if (empty) {

        empty.classList.add(
            "hidden"
        );

    }


    const table =
        document.getElementById(
            "anomalyTableContainer"
        );

    if (table) {

        table.classList.remove(
            "hidden"
        );

    }


    setText(
        "anomalyCounter",
        anomalyHistory.length +
        (
            anomalyHistory.length === 1
                ? " DETECTION"
                : " DETECTIONS"
        )
    );

}


/* =========================================================
   LATEST ANOMALY
========================================================= */

function showLatestAnomaly(event) {

    const panel =
        document.getElementById(
            "latestAnomaly"
        );


    if (panel) {

        panel.classList.remove(
            "hidden"
        );

    }


    setText(
        "latestLocation",
        event.subsystem
    );

    setText(
        "latestTime",
        event.timestamp
    );

    setText(
        "latestSeverity",
        event.severity
    );

    setText(
        "latestScore",
        event.score
    );

    setText(
        "latestExplanation",
        "AI identified a correlated power-system pattern: " +
        "battery voltage decreased while solar power and " +
        "current changed simultaneously."
    );

}


/* =========================================================
   PHASE MANAGEMENT
========================================================= */

function startNormalPhase() {

    systemPhase =
        "normal";

    anomalyDetected =
        false;

    anomalyRecorded =
        false;

    showNormalStatus();


    console.log(
        "🟢 NORMAL PHASE"
    );


    clearTimeout(
        phaseTimer
    );


    phaseTimer =
        setTimeout(
            startWarningPhase,
            NORMAL_TIME
        );

}


function startWarningPhase() {

    systemPhase =
        "warning";


    showWarningStatus();


    console.log(
        "🟡 WARNING PHASE"
    );


    clearTimeout(
        phaseTimer
    );


    phaseTimer =
        setTimeout(
            startAnomalyPhase,
            WARNING_TIME
        );

}


function startAnomalyPhase() {

    systemPhase =
        "anomaly";


    showAnomalyStatus();


    /*
       Record exactly ONE anomaly.
    */

    recordAnomaly();


    console.log(
        "🔴 ANOMALY PHASE"
    );


    clearTimeout(
        phaseTimer
    );


    phaseTimer =
        setTimeout(
            startRecoveryPhase,
            ANOMALY_TIME
        );

}


function startRecoveryPhase() {

    systemPhase =
        "recovery";


    showRecoveryStatus();


    console.log(
        "🟡 RECOVERY PHASE"
    );


    clearTimeout(
        phaseTimer
    );


    phaseTimer =
        setTimeout(
            startNormalPhase,
            RECOVERY_TIME
        );

}


/* =========================================================
   TERMINAL
========================================================= */

function addTerminalLine() {

    const terminal =
        document.getElementById(
            "terminalLog"
        );


    if (!terminal) return;


    const time =
        new Date()
            .toLocaleTimeString();


    const icon =

        systemPhase === "normal"
            ? "🟢"

        : systemPhase === "warning"
            ? "🟡"

        : systemPhase === "anomaly"
            ? "🔴"

        : "🔵";


    const line =
        document.createElement(
            "div"
        );


    line.textContent =

        `[${time}] ${icon} ` +

        `TEMP=${telemetry.temperature.toFixed(1)}°C ` +

        `V=${telemetry.voltage.toFixed(2)}V ` +

        `I=${telemetry.current.toFixed(2)}A ` +

        `SOLAR=${telemetry.solar.toFixed(2)}W ` +

        `AI_SCORE=${telemetry.anomalyScore.toFixed(2)}`;


    if (
        systemPhase === "anomaly"
    ) {

        line.style.color =
            "#f87171";

    }

    else if (
        systemPhase === "warning"
    ) {

        line.style.color =
            "#facc15";

    }

    else {

        line.style.color =
            "#4ade80";

    }


    terminal.appendChild(
        line
    );


    while (
        terminal.children.length > 25
    ) {

        terminal.removeChild(
            terminal.firstChild
        );

    }


    terminal.scrollTop =
        terminal.scrollHeight;

}


/* =========================================================
   SUBSYSTEM DETAILS
========================================================= */

const subsystemInfo = {

    thermal: {

        icon: "🌡️",

        title: "Thermal",

        health: "97%"

    },

    power: {

        icon: "⚡",

        title: "Power",

        health: "96%"

    },

    battery: {

        icon: "🔋",

        title: "Battery",

        health: "94%"

    },

    communication: {

        icon: "📡",

        title: "Communication",

        health: "99%"

    }

};


function showSubsystem(name) {

    const data =
        subsystemInfo[name];


    if (!data) return;


    const panel =
        document.getElementById(
            "subsystemDetails"
        );


    if (panel) {

        panel.classList.remove(
            "hidden"
        );

    }


    setText(
        "detailsIcon",
        data.icon
    );

    setText(
        "detailsTitle",
        data.title
    );

    setText(
        "detailsHealth",
        data.health
    );


    const affected =

        systemPhase === "anomaly" &&

        (
            name === "power" ||
            name === "battery"
        );


    setText(
        "detailsStatus",

        affected
            ? "ATTENTION REQUIRED"
            : "NOMINAL"
    );


    setText(
        "detailsRisk",

        affected
            ? "HIGH"
            : "LOW"
    );

}


function closeSubsystem() {

    const panel =
        document.getElementById(
            "subsystemDetails"
        );


    if (panel) {

        panel.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   MISSION MODE
========================================================= */

function changeMode() {

    const selector =
        document.getElementById(
            "modeSelector"
        );


    if (!selector) return;


    const mode =
        selector.value;


    const modes = {

        sunlight:
            "☀️ SUNLIGHT",

        eclipse:
            "🌑 ECLIPSE",

        communication:
            "📡 COMMUNICATION",

        safe:
            "🛡️ SAFE MODE"

    };


    const descriptions = {

        sunlight:
            "Normal sunlight operation",

        eclipse:
            "Reduced solar generation expected",

        communication:
            "Communication subsystem priority",

        safe:
            "Conservative spacecraft operation"

    };


    setText(
        "missionMode",
        modes[mode]
    );


    setText(
        "contextText",
        descriptions[mode]
    );


    setText(
        "contextRisk",

        systemPhase === "anomaly"
            ? "ELEVATED"
            : "LOW"
    );

}


/* =========================================================
   MAIN LOOP
========================================================= */

setInterval(
    updateTelemetry,
    1000
);


/* =========================================================
   TERMINAL LOOP
========================================================= */

setInterval(
    addTerminalLine,
    1000
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    drawAllCharts
);


/* =========================================================
   START DASHBOARD
========================================================= */

function initializeDashboard() {

    drawAllCharts();

    updateUI();

    showNormalStatus();

    changeMode();

    console.log(
        "🛰️ ORBITAL SENTINEL INITIALIZED"
    );

    console.log(
        "🟢 NORMAL → 🟡 WARNING → 🔴 ANOMALY → 🟡 RECOVERY → 🟢 NORMAL"
    );


    /*
       Start the repeating demonstration.
    */

    startNormalPhase();

}


initializeDashboard();