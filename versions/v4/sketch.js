// THIS IS AN EVOLVING ARTWORK v3
// by ktorn
// v3.1 - added collector name swithchover logic, triggered at midnight GMT

// **************************
// *    OBJKT DATA    *
// **************************

// If you want to create OBJKT's with different seeds,
// you can access the creator and viewer wallet ids.
// This values will only be injected once the piece has been minted
// they will not work locally.
const creator = new URLSearchParams(window.location.search).get("creator");
const viewer = new URLSearchParams(window.location.search).get("viewer");
// NOTE: if the user is viewing the page on hicetnunc while unsynced,
// the viewer variable will return a string of value "false" (NOT a boolean)

// The ID of the OBJKT is also passed via the URL parameters
const objkt = new URLSearchParams(window.location.search).get("objkt");
// NOTE: when the object is viewed in the preview page
// the objkt variable will return a string of value "false" (NOT a boolean)

let OBJKTdata;

console.log("NFT created by", creator); // null if local
console.log("NFT viewed by", viewer); // null if local
console.log("OBJKT ID is", objkt); // null if local

const DEFAULTSEED = 1234;
let viewerSeed = DEFAULTSEED;

const DUMMY = "tz1dd2tmTJFRJh8ycLuZeMpKLquJYkMypu2Q"; // simulate a synced viewer (user a different address to try another viewer)
const UNSYNCED = "false"; // simulate an unsynced user

const PREVIEW = "false"; // simulate the preview page
const DUMMY_OBJKT = 856725; // simulate an OBJKT ID

// Default is viewer. Try with DUMMY or UNSYNCED only for debugging
let viewerData = viewer;
//let viewerData = UNSYNCED;
//let viewerData = DUMMY;

// Default is creator. Try with DUMMY only for debugging
let creatorData = creator;
// let creatorData = DUMMY;

// Default is objkt. Try with DUMMY_OBJKT or PREVIEW_OBJKT only for debugging
let objktID = objkt; // will cause errors when ran locally (objkt is null)
// let objktID = DUMMY_OBJKT;
//let objktID = PREVIEW;

// Check if we have a viewer
let viewerWasFound = viewerData && !viewerData.includes("false");

// **************************
// *       PARAMETERS       *
// **************************

// Set this to true when minting
p5.disableFriendlyErrors = true;

// The title of your piece goes here (not visible on hicetnunc)
document.title = "This is an evolving artwork";

// Describe what your piece looks like to screen reader users
let description =
  "This evolving artwork, will currently display the name of one of its collectors randomly every day.";

let txtSize = 32;

// **************************
// *    GLOBAL VARIABLES    *
// **************************

let objktMetadata = {};

let owners = [];

let viewerIsOwner = false; // we will set this based on the teztok query

let isPreview = objktID === "false";

let isFirstLoading = true;

const SWITCHOVER_STATE_NONE = 0;
const SWITCHOVER_STATE_FADEOUT = 1;
const SWITCHOVER_STATE_LOADING = 2;
const SWITCHOVER_STATE_FADEIN = 3;
const SWITCHOVER_STATE_RETRY = 4;

let switchoverState = SWITCHOVER_STATE_NONE;
let switchoverRetries = 0;

let dataFinishedLoading = false;

let emptyCanvas;

let font;

let todaysOwner = "";
let ownerTextAlpha = 255;

let nextSwitchoverTimeout;

// **************************
// *        PRELOAD         *
// **************************

function preload() {
  randomSeed(viewerSeed);

  if (!isPreview) {
    // Initialize fallback data in case API calls fail
    todaysOwner = "someone"; // Fallback owner
    dataFinishedLoading = false;
    isFirstLoading = true;

    const fetchDataPromise = fetchData(objktID)
      .then((data) => checkViewerIsOwner(data))
      .then(() => {
        colors = getColors(viewerIsOwner);
      })
      .catch((error) => {
        console.error("Failed to fetch OBJKT data:", error);
      });

    const getTodaySeedPromise = getTodaySeed().catch((error) => {
      console.error("Failed to fetch today's seed:", error);
    });

    Promise.all([fetchDataPromise, getTodaySeedPromise])
      .then(() => {
        // If everything succeeds
        todaysOwner = getTodaysOnwer();
        dataFinishedLoading = true;
        isFirstLoading = false;
      })
      .catch((error) => {
        console.error("An error occurred while loading data:", error);
        // Fallback to default state
        dataFinishedLoading = true; // Mark loading as finished even in error
        isFirstLoading = false;
      });
  } else {
    console.warn(
      "This sketch doesn't have an OBJKT ID yet (preview mode?). Unable to fetch data"
    );
    isFirstLoading = false; // No loading if in preview
  }

  emptyCanvas = loadImage(
    "assets/v4_canvas.png",
    () => {},
    () => {
      console.error("Failed to load emptyCanvas image.");
    }
  );
  font = loadFont("fonts/LiberationSerif-Bold.ttf");
}

// **************************
// *          SETUP         *
// **************************

function setup() {
  createCanvas(windowWidth, windowHeight);

  imageMode(CENTER);
  rectMode(CENTER);
  textFont(font);

  describe(description); // Create a screen reader accessible description for the canvas

  scheduleNextSwitchover();
  scheduleNextCheck();

  if (isPreview) {
    console.log("Preview mode");
  }
}

// **************************
// *          DRAW          *
// **************************

function draw() {
  background(255);

  if (isFirstLoading) {
    showLoadingAnimation();
  } else {
    if (dataFinishedLoading) {
      if (viewerIsOwner === true) {
        showOwnerArt();
      } else {
        showDefaultArt();
      }
    }
  }
}

function getColors() {
  // TODO
}

// We do this if the viewer owns the OBJKT
function showOwnerArt() {
  showCanvas();
}

// We do that if the viewer does NOT own the OBJKT
function showDefaultArt() {
  showCanvas();
}

function showCanvas() {
  background("rgb(0, 0, 0)");

  // Calculate scaling factor to fit the smallest dimension of the screen
  let imgAspect = emptyCanvas.width / emptyCanvas.height;
  let canvasAspect = width / height;

  let scaledWidth, scaledHeight;

  if (canvasAspect > imgAspect) {
    // If the canvas is wider than the image's aspect ratio,
    // scale based on the height
    scaledHeight = height;
    scaledWidth = imgAspect * height;
  } else {
    // Otherwise, scale based on the width
    scaledWidth = width;
    scaledHeight = width / imgAspect;
  }

  // Draw the image scaled to fit the smallest dimension
  image(emptyCanvas, width / 2, height / 2, scaledWidth, scaledHeight);

  let fontSize = scaledWidth * 0.10;
  textSize(fontSize);
  textAlign(CENTER, CENTER);
  fill("rgb(78, 76, 68)");
  stroke("rgb(78, 76, 68)");
  text(
    "This is\n\nevolving\nartwork",
    width / 2 - scaledWidth * 0.005,
    height / 2 - scaledHeight * 0.02
  );

  let ownerText = todaysOwner + "'s";

  fontSizeOwner = calculateFontSizeToFit(
    ownerText,
    scaledWidth * 0.55,
    scaledHeight * 0.1
  );

  if (fontSizeOwner > fontSize) {
    fontSizeOwner = fontSize;
  }

  textSize(fontSizeOwner);
  textAlign(CENTER, CENTER);
  fill(217, 22, 86, ownerTextAlpha);
  stroke(217, 22, 86, ownerTextAlpha);
  text(ownerText, width / 2 - scaledWidth * 0.005, height / 2 - scaledHeight * 0.08);

  if (switchoverState === SWITCHOVER_STATE_FADEOUT) {
    ownerTextAlpha -= 0.5;
    if (ownerTextAlpha <= 0) {
      ownerTextAlpha = 0;
      switchoverState = SWITCHOVER_STATE_LOADING;
    }
  } else if (switchoverState === SWITCHOVER_STATE_FADEIN) {
    ownerTextAlpha += 0.5;
    if (ownerTextAlpha >= 255) {
      ownerTextAlpha = 255;
      switchoverState = SWITCHOVER_STATE_NONE;
    }
  }
}

function getTodaysOnwer() {
  let ownerNames = getOwnerNames();

  if (ownerNames.length === 0) {
    // Fallback to "someone" if no owners are found
    return "someone";
  }

  let owner = random(ownerNames);
  print("Today's owner: " + owner);

  return owner;
}

function getOwnerNames() {
  let ownerNames = [];

  let holdings = OBJKTdata.holdings;

  for (let i = 0; i < holdings.length; i++) {
    let owner = holdings[i];

    let ownerName = truncate(owner.holder_address, 12);

    if (owner.holder_profile && owner.holder_profile.name) {
      ownerName = owner.holder_profile.name;
    }

    if (ownerName.startsWith("KT")) {
      continue; // ignore marketplace ownership
    }

    ownerNames.push(ownerName);
  }

  return ownerNames;
}

function scheduleNextSwitchover() {
  let now = new Date();
  let switchoverTime = getNextSwitchoverTime();
  let timeUntilSwitchover = switchoverTime.getTime() - now.getTime();

  // Clear any existing timeout
  if (nextSwitchoverTimeout) {
    clearTimeout(nextSwitchoverTimeout);
  }


  let formattedDate = switchoverTime.toISOString();

  console.log("Next switchover time is", formattedDate);
  console.log("Scheduling next switchover in", timeUntilSwitchover / (1000 * 60 * 60), " hours");

  // Set a new timeout to call the function at midnight GMT
  nextSwitchoverTimeout = setTimeout(updateOwner, timeUntilSwitchover);
}

function scheduleNextCheck() {
  let now = new Date();
  let switchoverTime = getNextSwitchoverTime();
  let timeUntilSwitchover = switchoverTime.getTime() - now.getTime();
  let checkInterval = timeUntilSwitchover / 2;

  // Schedule the next check at half the current interval
  setTimeout(() => {
    scheduleNextSwitchover();
    if (checkInterval >= 60000) { // Ensure the minimum interval is 1 minute
      scheduleNextCheck();
    }
  }, Math.min(checkInterval, timeUntilSwitchover));


  console.log("Next check scheduled in", Math.min(checkInterval, timeUntilSwitchover) / (1000 * 60), " minutes");
}

function getNextSwitchoverTime() {
  let now = new Date();
  let midnightGMT = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
  //let midnightGMT = new Date(Date.now() + 1 * 60 * 1000);

  return midnightGMT;
}

function updateOwner() {
  console.log("Function called at switchover time");

  // Set state to switchover, to start fade out
  switchoverState = SWITCHOVER_STATE_FADEOUT;

  // First async task: fetchData + checkViewerIsOwner
  const fetchDataPromise = fetchData(objktID)
    .then((data) => checkViewerIsOwner(data))
    .then(() => {
      colors = getColors(viewerIsOwner);
    })
    .catch((error) => {
      console.error("Failed to fetch OBJKT data:", error);
    });

  // Second async task: getTodaySeed with retry mechanism
  const getTodaySeedPromise = getTodaySeedWithRetry();

  // Wait for both before proceeding
  Promise.all([fetchDataPromise, getTodaySeedPromise])
    .then(() => {
      // If everything succeeds
      todaysOwner = getTodaysOnwer(); // NOTE: check if this should also be async
      switchoverState = SWITCHOVER_STATE_FADEIN;

      scheduleNextSwitchover();
      scheduleNextCheck();
    })
    .catch((error) => {
      console.error("An error occurred while loading data:", error);
      // Fallback to default state even if only one failed
      switchoverState = SWITCHOVER_STATE_FADEIN;
    });
}

function getTodaySeedWithRetry(retryCount = 0) {
  const maxRetries = 5;
  const delay = 15000 + retryCount * 30000; // 15s initial + 30s per retry

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      getTodaySeed()
        .then(resolve)
        .catch((error) => {
          console.error(`Attempt ${retryCount + 1} failed:`, error);

          if (retryCount < maxRetries - 1) {
            // Retry after increasing delay
            getTodaySeedWithRetry(retryCount + 1).then(resolve).catch(reject);
          } else {
            console.error("Max retries reached. Giving up.");
            reject(error);
          }
        });
    }, delay);
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  todaysOwner = getTodaysOnwer();
}

// Basic loading animation
function showLoadingAnimation() {
  background(0);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);

  push();
  translate(width / 2, height / 2);
  rotate(frameCount * 0.1);
  noFill();
  stroke(255);
  strokeWeight(4);
  ellipse(0, 0, 50, 50);
  line(0, -25, 0, -50);
  pop();

  text("Loading...", width / 2, height / 2 + 70);
}
