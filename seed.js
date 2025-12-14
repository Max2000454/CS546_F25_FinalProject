import { ObjectId } from "mongodb";
import { closeConnection } from "./database_setup/mongoConnection.js";

import usersData from "./data/userData.js";
//import proposalsData from "./data/proposalsData.js";
import bidsData from "./data/bidsData2.js";

const main = async () => {
    await addVendors();
    await addAdmins();
    await addBids();
    await closeConnection();
}

const addVendors = async () => {
    await usersData.clearUserCollection();

    await usersData.insertUser("Gamma123", "Gamer@1805", "vendor");
    await usersData.insertUser("Max2000454", "Gamer@1805", "vendor");
    await usersData.insertUser("Sebastian", "Gamer@1805", "vendor");
    await usersData.insertUser("LetsGo", "Gamer@1805", "vendor");

}

const addAdmins = async () => {
    await usersData.insertUser("SebastianPS", "Gamer@1805", "admin");
    await usersData.insertUser("AdminGeneral", "Password123@", "admin");
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