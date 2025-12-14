import { ObjectId } from "mongodb";
import { closeConnection } from "./database_setup/mongoConnection.js";

import usersData from "./data/usersData.js";
//import proposalsData from "./data/proposalsData.js";
import bidsData from "./data/bidsData2.js";

const main = async () => {
    await addBids();
    await closeConnection();
}

const addVendors = async () => {

}

const addAdmins = async () => {

}

const addProposals = async () => {

}

const addBids = async (userIds, proposalIds) => {
    await bidsData.ClearBidCollection();

    await bidsData.InsertBid((new ObjectId()).toString(), (new ObjectId()).toString(), 123654, "12/15/2025");
    await bidsData.InsertBid((new ObjectId()).toString(), (new ObjectId()).toString(), 321, "12/16/2025");
    await bidsData.InsertBid((new ObjectId()).toString(), (new ObjectId()).toString(), 321, "12/16/2025");
    await bidsData.InsertBid((new ObjectId()).toString(), (new ObjectId()).toString(), 321, "12/16/2025");
    await bidsData.InsertBid((new ObjectId()).toString(), (new ObjectId()).toString(), 321, "12/16/2025");

}

main();