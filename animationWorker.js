function SeededRandom(e) {
    this.seed = e,
    this.counter = 0,
    this.random = function() {
        var e = 1e4 * Math.sin(this.seed + this.counter++);
        return e - Math.floor(e)
    }
}

function getSeedFromURL(e=3405691582) {
    let t = window.location.search
      , n = new URLSearchParams(t)
      , F = n.get("seed")
      , o = parseInt(F, 16);
    return Number.isInteger(o) && o >= 0 && o <= 9007199254740991 ? o : e
}

let allWords = ["Awe", "Reverence", "Glory", "Exaltation", "Magnificence", "Splendor", "Resonance", "Harmony", "Radiance", "Majesty", "Adoration", "Wonder", "Praise", "Worship", "Glorification", "Exultation", "Devotion", "Sanctity", "Blessing", "Hallelujah", "Divinity", "Holiness", "Sanctification", "Transcendence", "Gratitude", "Elevation", "Elation", "Jubilation", "Ecstasy", "Celebration", "Illumination", "Enlightenment", "Rapture", "Fulfillment", "Consecration", "Glorify", "Adulation", "Veneration", "Homage", "Acclamation", "Triumph", "Rejoicing", "Devotion", "Elated", "Exulted", "Sanctified", "Exuberance", "Resplendence", "Benediction", "Reverence", "Splendid", "Transcendent", "Anointed", "Majestic", "Celestial", "Heavenly", "Blessed", "Exalted", "Holy", "Radiant", "Sublime", "Illuminated", "Euphoric", "Blessing", "Divine", "Hallowed", "Adored", "Praised", "Rejoiced", "Sanctify", "Wondrous", "Glorified", "Revelation", "Prophetic", "Reverent", "Worshipful", "Uplifted", "Consecrated", "Illustrious", "Magnificent", "Glorious", "Jubilant", "Elevated", "Exultant", "Ecstatic", "Raptured", "Transfigured", "Gloried", "Worshipped", "Triumphant", "Revered", "Eulogized", "Enraptured", "Resplendent", "Harmonised", "Synchronized", "Adorned", "Ornamented", "Resonated", "Proclaimed"], ctx = null, artCtx = null, textCtx = null, spiralIndices, characters = [], lastUpdateTime = 0, frameCounter = 0, letterIndex = 0, currentWordIndex = 0, cellWidth = 0, cellHeight = 0, lastEvenBeatTime = 0, currentNoteIndex = 0, lastStartTime = 0, currentTime = 0, snakePosition = -1, snakeLength = 0, fps = 60, snakeIndices = [], frameSeed, arts, charType, glitchFrames, colors, layoutType, seededRandom, portraitSeed, landscapeSeed, squareSeed, frameInterval, delayBetweenBlocks, processing, millisecondsPerBeat, framesPerBeat, framesPerHalfBeat, framesPerQuarterBeat, framesPerEighthBeat, framesPerSixteenthBeat, dropAnimationDuration, processingAnimationDuration, lastOddBeatTime, flashStartTime, transactionBlocks, transactionId, flashDurationgridHeight, gridWidth, snakeTraversalCompleted, hideBlocks, initBlocksStarted, textDrawn = !1, blocksAnimated = new Set, lastTransactionId = null;
const transactionColors = {};
let currentHoveredChar = null;
let startTimestamp = null; // To track the start time
let lastInterval = null; // Tracks the last two-hour interval
let lastCycleDay = null; // Tracks the last cycle day
let currentDay = new Date().getDate(); // Initial day
const lastDayOfMonth = getLastDayOfMonth(); // Determine last day of the month dynamically

const decayDuration = 60
  , layoutConfig = {
    "12x12": {
        columns: 12,
        rows: 12
    },
    "9x16": {
        columns: 9,
        rows: 16
    },
    "16x9": {
        columns: 16,
        rows: 9
    }
}
  , colorPalettes = {
    sunrise: ["#ffd100", "#ff7244", "#e03e52", "#8246af", "#991e66"],
    sunset: ["#7d55c7", "#ff7244", "#ff3eb5", "#330072", "#f57eb6"],
    noon: ["#009cde", "#fbfb76", "#71dbd4", "#f5e1cc", "#205c40"],
    midnight: ["#ffff2e", "#ff5c39", "#ff5256", "#ff3eb5", "#00bf6f", "#330072", "#002b49"],
    txs: ["#2d2926", "#545859", "#5b6770", "#545859", "#97999b", "#b9bbbb", "#ffffff", "#f2eeca"],
    other: ["#2d2926", "#545859", "#5b6770", "#545859", "#97999b", "#b9bbbb", "#ffffff", "#f2eeca", "#f7d674", "#fbd872", "#ffd100", "#fbfb76", "#bfb000", "#ba9b37", "#c69214", "#f5e1cc", "#ff8f1c", "#c27237", "#ff7244", "#ffff2e", "#ff5c39", "#ff8da1", "#ff5256", "#e03e52", "#bd6074", "#be6e58", "#9d2235", "#b7312c", "#991e66", "#893b67", "#f57eb6", "#a56d95", "#eab8e4", "#ffbe9f", "#b97e90", "#d8a5f3", "#ff3eb5", "#8246af", "#725899", "#856ca2", "#7d55c7", "#b46b7a", "#c07d59", "#bb8459", "#572d2d", "#7c3a2d", "#3e4827", "#205c40", "#009a44", "#169387", "#57a499", "#659959", "#00bf6f", "#78be21", "#80e0a7", "#71dbd4", "#009cde", "#69caf8", "#5bc2e7", "#4694af", "#5d99ae", "#006caa", "#0072ce", "#002b49", "#330072"],
    exyozy: ["#f622b3", "#ffd100", "#fe5e0a", "#0d0c5a", "#bcf901", "#5d99ae", "#0071f1", "#f57eb6", "#7d55c7", "#d8a5f3", "#0221a0", "#f7142f", "#e7a6d0", "#4d0d00", "#5abfa1", "#e6c289", "#d8d8d4", "#1c1e1d", "#ff5256", "#5d99ae", "#1cd673", "#5bc2e7"]
};
let canvasState = {
    canvas: null,
    artCanvas: null,
    textCanvas: null
}
  , extras = {
    bpm: 0,
    seededRandomSeed: 0,
    width: 0,
    height: 0,
    fonts: null,
    spiral: 0
};
const visitedIndices = new Set;

function initializeSeeds(e, t) {
    try {
        charType = Math.floor(10 * (seededRandom = new SeededRandom(e)).random());
        for (let a = 0; a < Math.floor(5 + 15 * seededRandom.random()); a++) {
            arts += getRandomCharacter(charType);
        }
        portraitSeed = 16 * seededRandom.random() / 9,
        landscapeSeed = 9 * seededRandom.random() / 16,
        currentWordIndex = Math.floor(seededRandom.random() * allWords.length),
        squareSeed = seededRandom.random(),
        frameInterval = 1e3 / 30,
        delayBetweenBlocks = parseInt(t),
        processing = parseInt(4 * t),
        millisecondsPerBeat = 6e4 / t,
        framesPerBeat = parseInt(fps * (60 / t)),
        framesPerHalfBeat = parseInt(framesPerBeat / 2),
        framesPerQuarterBeat = parseInt(framesPerBeat / 4),
        framesPerEighthBeat = parseInt(framesPerBeat / 8),
        framesPerSixteenthBeat = parseInt(framesPerBeat / 16),
        dropAnimationDuration = millisecondsPerBeat / 4,
        processingAnimationDuration = millisecondsPerBeat / 2,
        lastOddBeatTime = millisecondsPerBeat / 2,
        flashDuration = 2 * dropAnimationDuration
    } catch (error) {
        console.error('Error initializing seeds:', error);
    }
}


function animateProgressionWithGlitch(timestamp, glitchIntensity) {
    // Increment frame counter
    frameCounter++;
	const { twoHourInterval, cycleDay } = getThreeDayCycle();
    // Refresh every 6 frames
    if (frameCounter % (23-twoHourInterval) === 0) {
        runGlitchAnimation(timestamp, glitchIntensity);
    }

    // Continue the animation loop
    requestAnimationFrame((newTimestamp) =>
        animateProgressionWithGlitch(newTimestamp, glitchIntensity)
    );
}

// Example `runGlitchAnimation` implementation
function runGlitchAnimation(timestamp, intensity) {
    const canvas = canvasState.artCanvas;
    const tempCanvas = new OffscreenCanvas(canvas.width, canvas.height);
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    const numLayers = intensity + 2; // Add layers based on intensity, minimum of 2

    // Generate layered glitches
    for (let i = 0; i < numLayers; i++) {
        const charCanvas = new OffscreenCanvas(canvas.width, canvas.height);
        charCanvas.width = canvas.width;
        charCanvas.height = canvas.height;
        charCanvas.font = 'bolder 20px "xoblk"';

        const charType = Math.floor(seededRandom.random() * characters.length);
        const character = getRandomCharacter(charType);
        
        const textColor = colors[Math.floor(seededRandom.random() * colors.length)];

        drawSeedGlitchArt(charCanvas, character, canvas.width * 1.5, textColor);
        applyStrongGlitchEffect(charCanvas);
        compositeImages(tempCanvas, charCanvas);
    }

    // Apply a final glitch effect
    applyStrongGlitchEffect(tempCanvas);

    // Composite the result onto the main canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
}


function drawSeedGlitchArt(canvas, character, fontSize, color) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = `${fontSize}px "xoxb"`; // Replace with loaded font if needed
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const x = canvas.width / 2;
            const y = canvas.height / 2;

            const angle = seededRandom.random() * 360;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((angle * Math.PI) / 180);
            ctx.fillText(character, 0, 0);
            ctx.restore();
        }

        function applyStrongGlitchEffect(canvas) {
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            const tempPixels = new Uint8ClampedArray(pixels);

            const width = canvas.width;
            const height = canvas.height;

            // Chromatic Aberration
            const shiftAmount = seededRandom.random() < 0.5 ? -20 : 20;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 4;

                    const rShift = (x + shiftAmount) % width;
                    const gShift = (x - shiftAmount) % width;
                    const bShift = (x + Math.floor(shiftAmount / 2)) % width;

                    const rIndex = (y * width + ((rShift + width) % width)) * 4;
                    const gIndex = (y * width + ((gShift + width) % width)) * 4;
                    const bIndex = (y * width + ((bShift + width) % width)) * 4;

                    pixels[index] = tempPixels[rIndex];
                    pixels[index + 1] = tempPixels[gIndex + 1];
                    pixels[index + 2] = tempPixels[bIndex + 2];
                }
            }

            // Block Glitch
            const blockSize = Math.floor(seededRandom.random() * 51) + 10; // Random size between 10 and 60
            for (let y = 0; y < height; y += blockSize) {
                for (let x = 0; x < width; x += blockSize) {
                    if (seededRandom.random() < 0.4) {
                        const srcX = Math.floor(seededRandom.random() * (width - blockSize));
                        const srcY = Math.floor(seededRandom.random() * (height - blockSize));

                        for (let yy = 0; yy < blockSize; yy++) {
                            for (let xx = 0; xx < blockSize; xx++) {
                                const srcIndex = ((srcY + yy) * width + (srcX + xx)) * 4;
                                const destIndex = ((y + yy) * width + (x + xx)) * 4;

                                if (srcIndex < tempPixels.length && destIndex < pixels.length) {
                                    pixels[destIndex] = tempPixels[srcIndex];
                                    pixels[destIndex + 1] = tempPixels[srcIndex + 1];
                                    pixels[destIndex + 2] = tempPixels[srcIndex + 2];
                                    pixels[destIndex + 3] = tempPixels[srcIndex + 3];
                                }
                            }
                        }
                    }
                }
            }

            ctx.putImageData(imageData, 0, 0);
        }

        function compositeImages(baseCanvas, overlayCanvas) {
            const baseCtx = baseCanvas.getContext('2d');
            baseCtx.drawImage(overlayCanvas, 0, 0);
        }

        async function generateNFT(layersCount) {
            const canvas = canvasState.artCanvas;
            const tempCanvas = new OffscreenCanvas(canvas.width, canvas.height);

            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;

            for (let i = 0; i < layersCount; i++) {
                const charCanvas = new OffscreenCanvas(canvas.width, canvas.height);
                charCanvas.width = canvas.width;
                charCanvas.height = canvas.height;
        		charCanvas.font = 'bolder 20px "xoblk"';

                const charType = Math.floor(seededRandom.random() * characters.length);
                const character = getRandomCharacter(charType);
                const textColor = colors[Math.floor(seededRandom.random() * colors.length)];

                drawSeedGlitchArt(charCanvas, character, canvas.width * 1.5, textColor);
                applyStrongGlitchEffect(charCanvas);
                compositeImages(tempCanvas, charCanvas);
            }

            applyStrongGlitchEffect(tempCanvas);

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tempCanvas, 0, 0);
        }

function getLastDayOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(); // Last day of the current month
}

function begin() {
    try {
    	requestAnimationFrame(animateProgression);
    } catch (error) {
        console.error('Error starting animation:', error);
    }
}
function getThreeDayCycle(date = new Date()) {
    const startOfYear = new Date(date.getFullYear(), 0, 1); // January 1st of the current year
    const diffInMs = date - startOfYear; // Difference in milliseconds
    const dayOfYear = Math.floor(diffInMs / (24 * 60 * 60 * 1000)) + 1; // Convert to days and add 1

    // Determine the 3-day cycle
    const cycleDay = ((dayOfYear - 1) % 3) + 1; // Cycle through 1, 2, 3

    // Calculate the hours elapsed since midnight
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0); // Midnight today
    const elapsedHoursToday = Math.floor((date - startOfDay) / (60 * 60 * 1000));

    // Determine the 2-hour interval within the current day
    const twoHourInterval = Math.floor(elapsedHoursToday / 2); // 12 intervals (0–11) in a 24-hour day

    return { twoHourInterval, cycleDay };
}

function animateProgression(timestamp) {
    if (!startTimestamp) startTimestamp = timestamp; // Initialize start time
	const { twoHourInterval, cycleDay } = getThreeDayCycle();
    try {
    	// Check for a new two-hour interval or a new cycle day
    if (twoHourInterval !== lastInterval || cycleDay !== lastCycleDay) {
        if (cycleDay === 1 || cycleDay === 2) {
            // Reset track during Days 1 and 2 on interval change
            self.postMessage({
                command: "resetTrack"
            });
        } else if (cycleDay === 1 && lastCycleDay === 3) {
            // Reset track when transitioning from Day 3 to Day 1
            self.postMessage({
                command: "resetTrack"
            });
        }

        lastInterval = twoHourInterval; // Update the tracked interval
        lastCycleDay = cycleDay; // Update the tracked cycle day
    }
        // Day-based logic
        if (1 == cycleDay) {
            const layers = twoHourInterval + 1; // Days 1-12: Increasing glitch layers
            generateNFT(layers);
            return;
        } else if (2==cycleDay) {
            const glitchIntensity = twoHourInterval + 1; // Days 10–18: Increasing glitch animation
            animateProgressionWithGlitch(timestamp, glitchIntensity); // Pass glitchIntensity
            return; // Prevent further calls in the current frame
        } else {
            // From Day 19 to the end of the month: Full character sequence
            initializeCharacters();
            requestAnimationFrame(animate); // Continue the animation
            return; // Prevent further calls in the current frame
        }
    } catch (error) {
        console.error('Error during progression:', error);
    }

    // Call the next frame
    requestAnimationFrame(animateProgression);
}



function getCurrentTimePalette() {
    let e = new Date
      , t = e.getHours()
      , a = e.getMinutes()
      , n = 60 * t + a;
    return n >= 360 && n < 370 ? colorPalettes.sunrise : n >= 1080 && n < 1090 ? colorPalettes.sunset : n >= 720 && n < 750 ? colorPalettes.noon : n >= 0 && n < 30 ? colorPalettes.midnight : colorPalettes.exyozy
}

function updateColors() {
    try {
        colors = getCurrentTimePalette(),
        characters.forEach(e=>{
            e.bgColor = getRandomColor(),
            e.fgColor = getRandomColor(e.bgColor)
        }),
        refreshCanvas()
    } catch (error) {
        console.error('Error updating colors:', error);
    }
}

function resizeCanvas(e, t) {
    try {
        canvasState.canvas.width = e,
        canvasState.canvas.height = t,
        canvasState.artCanvas.width = canvasState.canvas.width,
        canvasState.artCanvas.height = canvasState.canvas.height,
        canvasState.textCanvas.width = canvasState.canvas.width,
        canvasState.textCanvas.height = canvasState.canvas.height,
        configureGrid()
    } catch (error) {
        console.error('Error resizing canvas:', error);
    }
}

function configureGrid() {
    let e = cellWidth
      , t = cellHeight;
    try {
        canvasState.canvas.width / canvasState.canvas.height > 1.3 ? (gridWidth = 16,
        gridHeight = 9,
        frameSeed = landscapeSeed,
        layoutType = "16x9") : canvasState.canvas.width / canvasState.canvas.height < .75 ? (gridWidth = 9,
        gridHeight = 16,
        frameSeed = portraitSeed,
        layoutType = "9x16") : (gridWidth = 12,
        gridHeight = 12,
        frameSeed = squareSeed,
        layoutType = "12x12"),
        columns = layoutConfig[layoutType].columns,
        spiralIndices = getSpiralIndices(rows = layoutConfig[layoutType].rows, columns),
        cellWidth = Math.ceil(canvasState.canvas.width / gridWidth),
        cellHeight = Math.ceil(canvasState.canvas.height / gridHeight);
        let a = getRandomColor();
        glitchFrames = createGlitchedFrames(),
        characters.forEach(a=>{
            a.x = a.x / e * cellWidth,
            a.y = a.y / t * cellHeight,
            a.finalY = a.finalY / t * cellHeight,
            a.fontSize = 4 * Math.min(cellWidth, cellHeight)
        });
    } catch (error) {
        console.error('Error configuring grid:', error);
    }
}

function refreshCanvas() {
    try {
        ctx.clearRect(0, 0, canvasState.canvas.width, canvasState.canvas.height),
        characters.forEach(drawCharacter)
    } catch (error) {
        console.error('Error refreshing canvas:', error);
    }
}

function getRandomCharacter(e) {
    if (9 == e)
        return .5 > seededRandom.random() ? "✗" : "⚬";
    let[t,a] = [[19968, 40869], [12353, 12447], [12449, 12543], [33, 126], [161, 255], [1536, 1791], [1872, 1919], [1024, 1279], [1280, 1327]][e];
    return String.fromCharCode(Math.floor(seededRandom.random() * (a - t + 1)) + t)
}

function initializeCharacters() {
    try {
        let e = getCurrentTimeIndex()
          , t = canvasState.canvas.height+100
          , a = 0;
        for (let n = gridHeight - 1; n >= 0; n--)
            for (let o = 0; o < gridWidth; o++) {
                let r = getRandomColor()
                  , l = getRandomColor(r);
                characters.push({
                    index: a,
                    x: o * cellWidth,
                    y: n * cellHeight - t,
                    finalY: n * cellHeight,
                    bgColor: r,
                    fgColor: l,
                    char: getRandomCharacter(charType),
                    fontSize: 4 * Math.min(cellWidth, cellHeight),
                    startTime: lastStartTime,
                    rotation: 360 * seededRandom.random() * Math.PI / 180,
                    active: !1,
                    spinning: !0,
                    rotationSpeed: .25,
                    rotationDirection: a % 2 == 0 ? 1 : -1,
                    isVisible: !0,
                    inSnake: !1,
                    wasInSnake: !1,
                    cellWidth: cellWidth,
                    cellHeight: cellHeight,
                    isNow: a == e
                }),
                lastStartTime += dropAnimationDuration,
                a++
            }
    } catch (error) {
        console.error('Error initializing characters:', error);
    }
}

function setupAndDraw() {
    let e = extras.width
      , t = extras.height;
    artCtx.fillStyle = colors[Math.floor(seededRandom.random() * colors.length)],
    artCtx.fillRect(0, 0, e, t);
    let a = Math.max(e, t)
      , n = arts.split("").map(n=>{
        let o = Math.floor(a + a / 1.5 * seededRandom.random())
          , r = new OffscreenCanvas(e,t)
          , l = r.getContext("2d")
          , i = seededRandom.random() * (e - o / 8)
          , s = seededRandom.random() * (t - o / 8)
          , d = Math.floor(seededRandom.random() * colors.length);
        return drawArt(l, n, i, s, o, colors[d]),
        {
            canvas: r,
            char: n
        }
    }
    );
    n.forEach(e=>{
        artCtx.drawImage(e.canvas, 0, 0)
    }
    );
    let o = [];
    for (let r = 0; r < n.length; r++)
        for (let l = r + 1; l < n.length; l++) {
            let i = new OffscreenCanvas(e,t)
              , s = i.getContext("2d");
            s.globalCompositeOperation = "source-over",
            s.drawImage(n[r].canvas, 0, 0),
            s.globalCompositeOperation = "source-in",
            s.drawImage(n[l].canvas, 0, 0);
            let d = Math.floor(seededRandom.random() * colors.length);
            s.fillStyle = colors[d],
            s.globalCompositeOperation = "source-atop",
            s.fillRect(0, 0, e, t),
            o.push(i)
        }
    o.forEach(e=>{
        artCtx.drawImage(e, 0, 0)
    }
    ),
    artCtx.globalCompositeOperation = "source-over"
}

function drawArt(e, t, a, n, o, r) {
    try {
        let l = 360 * seededRandom.random() * Math.PI / 180
          , i = o / 4;
        e.save();
        e.translate(a, n);
        e.rotate(l);
        e.font = `bolder ${o}px "xoblk"`;
        e.fillStyle = r;
        e.fillText(t, -i, i);
        e.restore();
    } catch (error) {
        console.error('Error drawing art:', error);
    }
}

function applyAudioGlitchEffects(e) {}

function resetGlitchEffects() {}

function applyGlitchEffect(e, t=1) {
    try {
        let a = e.data
          , n = e.width
          , o = e.height
          , r = 0 === Math.floor(2 * seededRandom.random()) ? -10 : 10
          , l = r * (t + 40)
          , i = new Uint8ClampedArray(a);
        if (.5 > seededRandom.random())
            for (let s = 0; s < o; s++)
                for (let d = 0; d < n; d++) {
                    let c = (s * n + d) * 4
                      , f = (d + l) % n
                      , $ = (d - l) % n
                      , m = (d + Math.floor(l / 2)) % n
                      , h = (s * n + f) * 4
                      , g = (s * n + $) * 4
                      , x = (s * n + m) * 4;
                    a[c] = i[h],
                    a[c + 1] = i[g + 1],
                    a[c + 2] = i[x + 2],
                    a[c + 3] = 255
                }
        if (.2 > seededRandom.random()) {
            if (.5 > seededRandom.random()) {
                for (let u = 0; u < o; u++)
                    if (.3 > seededRandom.random()) {
                        let C = Math.floor(seededRandom.random() * (n / 2) + n / 4)
                          , p = Math.floor(60 * seededRandom.random() + 10)
                          , v = Math.floor(seededRandom.random() * (n - C))
                          , _ = Math.floor(20 * seededRandom.random() - 10);
                        for (let S = 0; S < p && u + S < o; S++)
                            for (let b = v; b < v + C; b++) {
                                let R = ((u + S) * n + b) * 4
                                  , w = ((u + S) * n + (b + _ + n) % n) * 4;
                                a[R] = a[w],
                                a[R + 1] = a[w + 1],
                                a[R + 2] = a[w + 2],
                                a[R + 3] = 255
                            }
                        u += p - 1
                    }
            } else {
                let y = Math.floor(50 * seededRandom.random() + 20);
                for (let P = 0; P < o; P += y)
                    for (let k = 0; k < n; k += y)
                        if (.3 > seededRandom.random()) {
                            let I = Math.floor(seededRandom.random() * (n - y))
                              , T = Math.floor(seededRandom.random() * (o - y))
                              , B = artCtx.getImageData(I, T, y, y)
                              , E = B.data;
                            for (let H = 0; H < y; H++)
                                for (let A = 0; A < y; A++) {
                                    let W = ((P + H) * n + (k + A)) * 4
                                      , D = (H * y + A) * 4;
                                    a[W] = E[D],
                                    a[W + 1] = E[D + 1],
                                    a[W + 2] = E[D + 2],
                                    a[W + 3] = 255
                                }
                        }
            }
        }
        return e;
    } catch (error) {
        console.error('Error applying glitch effect:', error);
        return e;
    }
}

function resortGlitchEffect(e, t, a, n) {
    try {
        let o = [];
        for (let r = 0; r < t.height; r += n)
            for (let l = 0; l < t.width; l += a) {
                let i = e.getImageData(l, r, a, n);
                o.push({
                    x: l,
                    y: r,
                    piece: i
                });
            }
        for (let s = o.length - 1; s > 0; s--) {
            let d = Math.floor(seededRandom.random() * (s + 1));
            [o[s], o[d]] = [o[d], o[s]];
        }
        o.forEach(t => {
            e.putImageData(t.piece, t.x, t.y);
        });
    } catch (error) {
        console.error('Error resorting glitch effect:', error);
    }
}

function createGlitchedFrames() {
    try {
    	const { twoHourInterval, cycleDay } = getThreeDayCycle();
        let e = []
          , t = Math.floor(1 * seededRandom.random()) + 1;
        for (let a = 0; a < t; a++) {
            // Day-based logic
        if (1==cycleDay) {
            const layers = twoHourInterval + 1; // Days 1–9: Increasing glitch layers
            generateNFT(layers);
        } else if (2==cycleDay) {
            const glitchIntensity = twoHourInterval+1; // Days 10–18: Increasing glitch animation
            runGlitchAnimation(0,glitchIntensity);
            //return; // Prevent further calls in the current frame
        } else {
           setupAndDraw();
        }
            let n = artCtx.getImageData(0, 0, extras.width, extras.height);
            let m = applyGlitchEffect(n);
            e.push(m);
        }
        return e;
    } catch (error) {
        console.error('Error creating glitched frames:', error);
        return [];
    }
}

function animateFrames(e, t, a, n) {
    try {
        let o = 1;
        let r = 500 / n;
        let localFrameCounter = 0;

        function frameStep() {
            if (localFrameCounter % (2 * parseInt(r)) == 0) {
                o += 2;
                let n = t.getImageData(0, 0, a.width, a.height);
                n = applyGlitchEffect(n, o);
                t.putImageData(n, 0, 0);
                resortGlitchEffect(t, a, cellWidth, cellHeight);
                if (!textDrawn) {
                    drawText();
                    textDrawn = !0;
                }
            }

            if (o > 60) {
                startAnimation = !0;
                glitchFrames = createGlitchedFrames();
                stopAnimation = !1;
                textDrawn = !1;
                frameCycleCounter = 0;
                decayFrameCounter = 0;
                decayStarted = !1;
                visitedIndices.clear();
                snakeIndices = [];
                resetAndStartOver();
                return;
            }

            localFrameCounter++;
            requestAnimationFrame(frameStep);
        }

        frameStep();
    } catch (error) {
        console.error('Error animating frames:', error);
    }
}

function drawText() {
    try {
        let e = extras.width;
        let t = extras.height;
        textCtx.clearRect(0, 0, e, t);

        let a = allWords[currentWordIndex];
        let n = a[letterIndex];
        ++letterIndex == a.length && (n = a, letterIndex = 0);

        // Set font size in pixels based on height
        let o = t / 20;
        let fontSizePx = o * 16; // Convert rem to px (assuming 1rem = 16px)
        textCtx.font = `${fontSizePx}px "xoend"`;

        let r = textCtx.measureText(n).width;

        // Adjust font size to fit within the width of the canvas
        while (r > e && o > 0) {
            o -= 0.1;
            fontSizePx = o * 16;
            textCtx.font = `${fontSizePx}px "xoend"`;
            r = textCtx.measureText(n).width;
        }

        let l = 16 * o;
        textCtx.font = `${fontSizePx}px "xoend"`;

        let i = 360 * seededRandom.random();
        textCtx.save();
        textCtx.translate(e / 2, t / 2);
        textCtx.rotate(i * Math.PI / 180);

        let s = seededRandom.random() < 0.5;
        let d = s ? n.toUpperCase() : n.toLowerCase();
        let c = (seededRandom.random() - 0.5) * l * 0.1;

        textCtx.fillStyle = "white";
        textCtx.textAlign = "center";
        textCtx.fillText(d, 0, c);
        textCtx.restore();

        let f = textCtx.getImageData(0, 0, e, t);
        let $ = f.data;
        textCtx.clearRect(0, 0, e, t);

        let m = artCtx.getImageData(0, 0, e, t);
        let h = textCtx.createImageData(e, t);
        let g = h.data;

        for (let x = 0; x < $.length; x += 4) {
            if ($[x + 3] > 0) {
                g[x] = m.data[x];
                g[x + 1] = m.data[x + 1];
                g[x + 2] = m.data[x + 2];
                g[x + 3] = m.data[x + 3];
            } else {
                g[x + 3] = 0;
            }
        }

        textCtx.putImageData(h, 0, 0);
    } catch (error) {
        console.error('Error drawing text:', error);
    }
}


function getSpiralIndices(e, t) {
    try {
        let a = [spiralPath, zigzagPath, diagonalPath, snakePath, horizontalWavePath, verticalWavePath, checkerboardPath, randomPath]
          , n = extras.spiral;
        return a[n](e, t);
    } catch (error) {
        console.error('Error getting spiral indices:', error);
        return [];
    }
}

function spiralPath(e, t) {
    let a = []
      , n = 0
      , o = e - 1
      , r = 0
      , l = t - 1;
    try {
        for (; n <= o && r <= l; ) {
            for (let i = r; i <= l; i++)
                a.push(n * t + i);
            n++;
            for (let s = n; s <= o; s++)
                a.push(s * t + l);
            if (l--,
            n <= o)
                for (let d = l; d >= r; d--)
                    a.push(o * t + d);
            if (o--,
            r <= l)
                for (let c = o; c >= n; c--)
                    a.push(c * t + r);
            r++;
        }
        return a;
    } catch (error) {
        console.error('Error in spiralPath:', error);
        return a;
    }
}

function zigzagPath(e, t) {
    let a = [];
    try {
        for (let n = 0; n < e; n++)
            if (n % 2 == 0)
                for (let o = 0; o < t; o++)
                    a.push(n * t + o);
            else
                for (let r = t - 1; r >= 0; r--)
                    a.push(n * t + r);
        return a;
    } catch (error) {
        console.error('Error in zigzagPath:', error);
        return a;
    }
}

function diagonalPath(e, t) {
    let a = [];
    try {
        for (let n = e + t - 2; n >= 0; n--) {
            let o = Math.max(0, n - e + 1)
              , r = Math.min(n + 1, Math.min(t - o, e));
            for (let l = 0; l < r; l++)
                a.push((Math.min(e, n + 1) - l - 1) * t + o + l);
        }
        return a;
    } catch (error) {
        console.error('Error in diagonalPath:', error);
        return a;
    }
}

function snakePath(e, t) {
    let a = [];
    try {
        for (let n = 0; n < t; n++)
            if (n % 2 == 0)
                for (let o = 0; o < e; o++)
                    a.push(o * t + n);
            else
                for (let r = e - 1; r >= 0; r--)
                    a.push(r * t + n);
        return a;
    } catch (error) {
        console.error('Error in snakePath:', error);
        return a;
    }
}

function horizontalWavePath(e, t) {
    let a = [];
    try {
        for (let n = 0; n < t; n++)
            for (let o = 0; o < e; o++)
                a.push(o * t + n);
        return a;
    } catch (error) {
        console.error('Error in horizontalWavePath:', error);
        return a;
    }
}

function verticalWavePath(e, t) {
    let a = [];
    try {
        for (let n = 0; n < e; n++)
            for (let o = 0; o < t; o++)
                a.push(n * t + o);
        return a;
    } catch (error) {
        console.error('Error in verticalWavePath:', error);
        return a;
    }
}

function checkerboardPath(e, t) {
    let a = [];
    try {
        for (let n = 0; n < e; n++)
            for (let o = 0; o < t; o++)
                (n + o) % 2 == 0 && a.push(n * t + o);
        for (let r = 0; r < e; r++)
            for (let l = 0; l < t; l++)
                (r + l) % 2 != 0 && a.push(r * t + l);
        return a;
    } catch (error) {
        console.error('Error in checkerboardPath:', error);
        return a;
    }
}

function randomPath(e, t) {
    let a = [];
    try {
        for (let n = 0; n < e; n++)
            for (let o = 0; o < t; o++)
                a.push(n * t + o);
        return a.sort(()=>seededRandom.random() - .5);
    } catch (error) {
        console.error('Error in randomPath:', error);
        return a;
    }
}

function getSnakeIndices(e, t) {
    try {
        let a = [];
        for (let n = 0; n < t; n++)
            a.push(spiralIndices[(e + n) % spiralIndices.length]);
        return a;
    } catch (error) {
        console.error('Error getting snake indices:', error);
        return [];
    }
}

function drawCharacter(char, timeElapsed) {
    if (!char.isVisible) return;

    const targetLandingTime = char.startTime + framesPerSixteenthBeat * 1000 / 60;

    if (timeElapsed > char.startTime && !char.active) {
        char.active = true;  // Start the block falling
    }

    // Initialize last rotation times and target rotations for each block if not already initialized
    if (char.lastRotationTime === undefined) {
        char.lastRotationTime = 0;
    }
    if (char.targetRotation === undefined) {
        char.targetRotation = char.rotation;
    }

    // Rotate the blocks on each half beat
    if (char.spinning) {
        if (char.index % 3 === 0) {
            if (timeElapsed - char.lastRotationTime >= framesPerHalfBeat * 2 * 1000 / 60) {
                char.targetRotation += Math.PI / 2; // Set target rotation 90 degrees clockwise
                char.lastRotationTime = timeElapsed + framesPerHalfBeat * 2 * 1000 / 60;
            }
        } else {
            if (timeElapsed - char.lastRotationTime >= framesPerHalfBeat * 1000 / 60) {
                char.targetRotation -= Math.PI / 2; // Set target rotation 90 degrees counterclockwise
                char.lastRotationTime = timeElapsed + framesPerHalfBeat * 1000 / 60;
            }
        }

        // Smoothly interpolate the rotation towards the target rotation
        const rotationStep = 0.05; // Adjust this value for smoother or faster interpolation
        char.rotation += (char.targetRotation - char.rotation) * rotationStep;
    }

    if (char.active && char.y < char.finalY) {
        // Calculate the remaining time to land
        const remainingTime = targetLandingTime - timeElapsed;

        // Prevent negative remaining time
        if (remainingTime > 0) {
            // Calculate the speed needed to land exactly on the beat
            const distanceToTravel = char.finalY - char.y;
            const speed = distanceToTravel / remainingTime * (1000 / 60); // Pixels per frame

            char.y += speed / 8;  // Increase speed of falling based on the calculated speed

            // Ensure the block does not overshoot the final position
            if (char.y > char.finalY) {
                char.y = char.finalY;
            }
        } else {
            char.y = char.finalY; // Ensure it stops at the final position if remainingTime is zero or negative
        }

        // Generate random indices for background and foreground colors
        const bgIndex = getRandomColor();
        const fgIndex = getRandomColor(bgIndex);

        // Update the colors using the indices to access the colors array
        char.bgColor = bgIndex;
        char.fgColor = fgIndex;

        ctx.fillStyle = char.bgColor;
        ctx.fillRect(char.x, char.y, cellWidth, cellHeight);
    } else {
        // Use the last updated colors for when the block stops moving
        if (char.inSnake) {
            // Generate random indices for background and foreground colors
            const bgIndex = getRandomColor();
            const fgIndex = getRandomColor(bgIndex);

            // Update the colors using the indices to access the colors array
            char.bgColor = bgIndex;
            char.fgColor = fgIndex;
        } else if (visitedIndices.has(char.index)) {
            const colors = transactionColors[char.transactionId];
            char.bgColor = colors.bgColor;
            char.fgColor = colors.fgColor;
        }
        ctx.fillStyle = char.bgColor;
        ctx.fillRect(char.x, char.y, cellWidth, cellHeight);
    }

    // Check if the block has reached or passed its final position
    if (char.active && char.y >= char.finalY) {
        char.y = char.finalY; // Ensure it stops at the final position
        if (!char.soundPlayed) {
            // playLandingSound();
            char.soundPlayed = true;
        }
    }

    // Draw the character
    ctx.save();
    ctx.beginPath();
    ctx.rect(char.x, char.y, cellWidth, cellHeight);
    ctx.clip();
    ctx.translate(char.x + cellWidth / 2, char.y + cellHeight / 2);
    ctx.rotate(char.rotation);
    ctx.fillStyle = char.fgColor;
    if (initBlocksStarted && char.inSnake) {
        ctx.font = `${(char.fontSize / 3)}px "xoblk"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if(char.isNow){
            ctx.fillText("𓎥", 0, 0);
        }else{
            ctx.fillText("✗⚬", 0, 0);
        }
    } else {
        ctx.font = `${char.fontSize}px "xoxb"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char.char, 0, 0);
    }
    ctx.restore();
}

function animate(e) {
    if (!currentTime) currentTime = e;
    let t = e - currentTime,
        a = getSnakeIndices(snakePosition, snakeLength),
        n = true,
        o = 0;

    if (snakeTraversalCompleted) {
        snakeTraversalCompleted = false;
        hideBlocks = false;
        decayStarted = true;
        return;
    }

    try {
        ctx.clearRect(0, 0, canvasState.canvas.width, canvasState.canvas.height);

        if (frameCounter % framesPerBeat === 0 && !initBlocksStarted) {
            let r = getRandomColor();
            self.postMessage({
                command: "updateBackground",
                data: r
            });
        }

        frameCounter++;

        characters.forEach((e, r) => {
            if (e.y < e.finalY) n = false;
            if (!e.isVisible) o++;

            if (initBlocksStarted) {
                if (a.includes(r)) {
                    e.inSnake = true;
                    visitedIndices.add(r);
                    if (visitedIndices.has(r)) {
                        e.spinning = false;
                        if (hideBlocks) e.spinning = true;
                    }
                    e.bgColor = getRandomColor();
                    e.fgColor = getRandomColor(e.bgColor);
                } else {
                    e.inSnake = false;
                    if (visitedIndices.has(r) && hideBlocks && e.spinning) e.isVisible = false;
                }
            }

            drawCharacter(e, t);
        });

        if (n) {
            if (initBlocksStarted) {
                if (performance.now() - lastUpdateTime > 200 * framesPerBeat / 60) {
                    if (snakeLength < 8 && snakePosition < spiralIndices.length - snakeLength) {
                        snakeLength++;
                    } else if (snakeLength > 0 && snakePosition > spiralIndices.length - (snakeLength + 2)) {
                        snakeLength--;
                    }

                    if (!snakeTraversalCompleted) {
                        snakePosition = (snakePosition + 1) % spiralIndices.length;
                        lastUpdateTime = performance.now();
                    }
                }

                if (snakePosition === spiralIndices.length - 1) {
                    if (!hideBlocks) {
                        textCtx.clearRect(0, 0, canvasState.canvas.width, canvasState.canvas.height);
                        animateFrames(glitchFrames, artCtx, ctx.canvas, 15);
                    }
                    snakeLength = 0;
                    hideBlocks = true;
                    if (o == spiralIndices.length) snakeTraversalCompleted = true;
                }
            } else {
                initBlocksStarted = true;
                let l = 0,
                    i = Math.floor(16 * seededRandom.random()) + 1;

                characters.forEach((e, t) => {
                    if (i <= 0) {
                        l++;
                        i = Math.floor(16 * seededRandom.random()) + 1;
                    }
                    i--;
                    e.transactionId = l;
                    e.animated = false;
                    if (!transactionColors[l]) {
                        transactionColors[l] = {
                            bgColor: "#1c1e1d",
                            fgColor: "#d8d8d4"
                        };
                    }
                });

                activeTransactions = new Set(characters.map(e => e.transactionId));
            }
        }

        requestAnimationFrame(animate);
    } catch (error) {
        console.error('Error during animation:', error);
    }
}

function getRandomColor(e) {
    try {
        let t = colors;
        e && (t = colors.filter(t => t !== e));
        let a = Math.floor(seededRandom.random() * t.length);
        return t[a];
    } catch (error) {
        console.error('Error getting random color:', error);
        return "#000000";
    }
}

function getCharacterAtPosition(e, t) {
    try {
        return characters.find(a => e >= a.x && e <= a.x + cellWidth && t >= a.y && t <= a.y + cellHeight);
    } catch (error) {
        console.error('Error getting character at position:', error);
        return null;
    }
}

function swapColors(e) {
    try {
        if (e.colorsSwapped) {
            let t = e.bgColor;
            e.bgColor = e.fgColor,
            e.fgColor = t,
            e.colorsSwapped = !1;
        } else {
            let a = e.bgColor;
            e.bgColor = e.fgColor,
            e.fgColor = a,
            e.colorsSwapped = !0;
        }
        drawCharacter(e);
    } catch (error) {
        console.error('Error swapping colors:', error);
    }
}

function getCurrentTimeIndex() {
    try {
        let e = new Date
          , t = e.getHours()
          , a = e.getMinutes()
          , n = 12 * t + Math.floor(a / 5);
        return n > 143 ? n - 143 : n;
    } catch (error) {
        console.error('Error getting current time index:', error);
        return 0;
    }
}

function refreshCanvas() {
    try {
        ctx.clearRect(0, 0, canvasState.canvas.width, canvasState.canvas.height),
        characters.forEach(e=>{
            drawCharacter(e);
        });
    } catch (error) {
        console.error('Error refreshing canvas:', error);
    }
}

function resetAndStartOver() {
    try {
        initBlocksStarted = !1,
        updateColors(),
        lastStartTime = 0,
        currentTime = 0,
        characters = [],
        activeTransactions.clear(),
        requestAnimationFrame(animateProgression),
        self.postMessage({
            command: "resetTrack"
        });
    } catch (error) {
        console.error('Error resetting and starting over:', error);
    }
}

async function loadFonts(fonts) {
    const fontPromises = Object.entries(fonts).map(async([name, url]) => {
        try {
            const fontFace = new FontFace(name, `url(${url})`);
            await fontFace.load();
            self.fonts.add(fontFace);
        } catch (error) {
            console.error('Error loading font:', error);
        }
    });
    return Promise.all(fontPromises);
}

self.onmessage = async function(e) {
    let {
        command: t,
        canvas: a,
        artCanvas: n,
        textCanvas: o,
        bpm: r,
        seededRandomSeed: l,
        width: i,
        height: s,
        fonts: z,
        spiral: sp,
    } = e.data;
    if (a) canvasState.canvas = a;
    if (n) canvasState.artCanvas = n;
    if (o) canvasState.textCanvas = o;
    if (r) extras.bpm = r;
    if (l) extras.seededRandomSeed = l;
    if (i) extras.width = i;
    if (s) extras.height = s;
    if (z) extras.fonts = z;
    if (sp) extras.spiral = sp;

    if (canvasState.canvas && !ctx) {
        ctx = canvasState.canvas.getContext("2d", {
            willReadFrequently: true,
            imageSmoothingEnabled: true
        });
    }

    if (canvasState.artCanvas && !artCtx) {
        artCtx = canvasState.artCanvas.getContext("2d", {
            willReadFrequently: true,
            imageSmoothingEnabled: true
        });
    }

    if (canvasState.textCanvas && !textCtx) {
        textCtx = canvasState.textCanvas.getContext("2d", {
            willReadFrequently: true,
            imageSmoothingEnabled: true
        });
    }

    try {
        switch (t) {
            case "glitched":
                initializeSeeds(extras.seededRandomSeed, extras.bpm);
                updateColors();
                let randomColor = getRandomColor();
                self.postMessage({
                    command: "updateBackground",
                    data: randomColor
                });
                await loadFonts(extras.fonts);
                textCtx.font = 'bold 20px "xoxb"';
                artCtx.font = 'bolder 20px "xoblk"';
                resizeCanvas(extras.width, extras.height);
                self.postMessage({
                    command: "workerReady"
                });
                break;

            case "begin":
                begin();
                break;

            case "resetAndStartOver":
                resetAndStartOver();
                break;

            case "resize":
                resizeCanvas(extras.width, extras.height);
                break;

            default:
                console.error("Unknown command:", t);
        }
    } catch (error) {
        console.error('Error in onmessage:', error);
    }
};
