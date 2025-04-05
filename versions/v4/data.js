// **************************
// *      TEZTOK API        *
// **************************

function checkViewerIsOwner(data) {
    if (data.holdings.some((e) => e.holder_address === viewerData)) {
      console.log(`🦄 viewer IS owner`);
      viewerIsOwner = true;
    } else {
      console.log(`🦆 viewer is NOT owner`);
    }
    OBJKTdata = data;
    console.log({ OBJKT: data });
  }
  
  const query = `
    query Objkt($id: String!) {
      tokens_by_pk(fa2_address: "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton", token_id: $id) {
  
        listings(where: {}, order_by: {swap_id: asc}) {
          price
          status
          amount
          amount_left
          created_at
          seller_profile {
            user_address
            name
          }
        }
  
        holdings(where: {amount: {_gt: "0"}}) {
          holder_address
          holder_profile {
            user_address
            name
          }
          amount
        }
  
      }
    }
  `;
  
  async function fetchGraphQL(operationsDoc, operationName, variables) {
    const result = await fetch("https://teztok.teia.rocks/v1/graphql", {
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      }),
    });
  
    return await result.json();
  }
  
  async function fetchData(objktId) {
    const { errors, data } = await fetchGraphQL(query, "Objkt", {
      id: "" + objktId,
    });
    if (errors) {
      console.error(errors);
    }
  
    const result = data.tokens_by_pk;
    OBJKTdata = result;
    return result;
  }
  
  
  async function getTodaySeed() {
    // Step 1: Get the current date in UTC and format it for 00:00:00Z
    let now = new Date();
    let startOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    let formattedDate = startOfDayUTC.toISOString();
  
    console.log("Formatted date (for API):", formattedDate);
  
    // Step 2: Assemble the API URL
    let url = `https://api.tzkt.io/v1/blocks?timestamp.gt=${formattedDate}&limit=1`;
  
    console.log("API URL:", url);
  
    try {
      // Step 3: Fetch data from the API
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
  
      if (data.length > 0) {
        // Extract the hash from the first item in the array
        let hash = data[0].hash;
        console.log("Hash:", hash);
  
        // Convert hash to a numeric seed
        let seed = hashToSeed(hash);
        console.log("Numeric seed:", seed);
  
        // Set the seed in p5.js
        randomSeed(seed);
        console.log("Random seed initialized with:", seed);
  
      } else {
        console.log("No data available.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error; // Rethrow the error to propagate it to Promise.all
    }
  }