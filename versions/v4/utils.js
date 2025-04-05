function truncate(fullStr, strLen, separator) {
    if (fullStr.length <= strLen) return fullStr;

    separator = separator || '...';

    var sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow/2),
        backChars = Math.floor(charsToShow/2);

    return fullStr.substr(0, frontChars) + 
           separator + 
           fullStr.substr(fullStr.length - backChars);
}



const originalFetch = window.fetch;
window.fetch = async (...args) => {
    console.log('HTTP Request:', args);
    const response = await originalFetch(...args);
    const clone = response.clone();

    let body;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
        body = await clone.json();
    } else if (contentType && contentType.includes("text")) {
        body = await clone.text();
    } else if (contentType && (contentType.includes("image") || contentType.includes("audio") || contentType.includes("video") || contentType.includes("application/octet-stream"))) {
        body = await clone.blob();
    } else {
        body = 'Unable to parse body content';
    }

    console.log('HTTP Response:', response, 'Body:', body);
    return response;
};


// Helper function to convert hash to a numeric seed
function hashToSeed(hash) {
  let seed = BigInt(0);
  let multiplier = BigInt(31); // Use a prime number multiplier for better distribution
  let mod = BigInt(2 ** 53); // Use a large modulus for wide seed space

  for (let i = 0; i < hash.length; i++) {
    seed = (seed * multiplier + BigInt(hash.charCodeAt(i))) % mod;
  }
  return Number(seed); // Convert BigInt to regular number for p5.js compatibility
}

// Function to calculate font size
function calculateFontSizeToFit(text, rectWidth, rectHeight) {
    let testSize = 1; // Start small and increase until the text fits
    textSize(testSize);
  
    while (textWidth(text) < rectWidth && textAscent() + textDescent() < rectHeight + 50) {
      testSize++;
      textSize(testSize);
    }
  
    // Subtract a small amount to ensure the text fits comfortably
    return testSize - 1;
  }