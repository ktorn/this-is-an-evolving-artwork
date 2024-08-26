# this-is-an-evolving-artwork
Code used by "This is an evolving artwork" - [OBJKT 856725](https://teia.art/objkt/856725) on Teia


## To mint a version controllec "evolving" artwork:

1. deploy the smartcontract to the Tezos mainnet. make a note of the smart contract address.

2. mint your v1 artwork. can be anything, an image, an interactive OBJKT (application/x-directory), etc.
Keep it as 1 edition only, as you will shortly burn this OBJKT.

3. find the artifact URI (IPFS CID) of your v1 OBJKT and make a note of it (make sure to only get the CID, no other parts of the URL, like `https://cache.teia.rocks/ipfs/` or `/?creator=`)

For example, given this URL: `https://cache.teia.rocks/ipfs/bafybeigve4t3dxv6m2pvx5lhxsizo3my3utekyl3m47gbfkaarhf3r3zya/?creator=tz1dd2tmTJFRJh8ycLuZeMpKLquJYkMypu2Q&viewer=tz1dd2tmTJFRJh8ycLuZeMpKLquJYkMypu2Q&objkt=856725`

the CID is `bafybeigve4t3dxv6m2pvx5lhxsizo3my3utekyl3m47gbfkaarhf3r3zya`

4. burn the v1 OBJKT that you just created.

5. using better-call.dev, find your smartcontract and interact with the default endpoint. add the `ipfs_hash` that you got in step 3, and insert a version number (i.e. 1) and execute the transaction

example: `https://better-call.dev/mainnet/KT1D1xoPkaoS9yaFD6L6cuwUGqdxPuFmA7pq/interact/default`

when the transaction is confirmed, you should see your new version appearing under the storage tab

6. edit the `script.js` file in the bootloader code, and make sure to insert the smartcontract address that you noted down in step 1.

7. mint the bootloader as an OBJKT. this will be your main OBJKT, so make sure all the metadata details (like title, description, tags, number of editions, etc) are good. you won't be able to change these later. also make sure to upload a good thumbnail, because that is what Teia will display by default on OBJKT listings

8. your newly minted OBJKT should now query the smart contract and immediately redirect to your v1 artwork. even though you burned that OBJKT, the assets remain pinned by Teia and, more importantly, they are allow-listed by the Teia IPFS gateway.

----

## To add a new version

1. mint the new version OBJKT, make sure it works as intended, note down the IPFS CID, and burn the OBJKT

2. interact with your smartcontract again, adding the new `ipfs_hash` and a new version number

That's it. Open your main OBJKT, refresh the browser and it should now display the new content.