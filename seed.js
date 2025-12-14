import { ObjectId } from "mongodb";
import { closeConnection } from "./database_setup/mongoConnection.js";

import usersData from "./data/userData.js";
import proposalsData from "./data/proposalsData.js";
import bidsData from "./data/bidsData2.js";

const main = async () => {
    await addVendors();
    await addAdmins();
    await addProposals();
    await addBids();
    await closeConnection();
}

const addVendors = async () => {
    await usersData.clearUserCollection();

    await usersData.insertUser("gamma123", "Gamer@1805", "vendor");
    await usersData.insertUser("Max2000454", "Gamer@1805", "vendor");
    await usersData.insertUser("Sebastian", "Gamer@1805", "vendor");
    await usersData.insertUser("LetsGo", "Gamer@1805", "vendor");

}

const addAdmins = async () => {
    await usersData.insertUser("SebastianPS", "Gamer@1805", "admin");
    await usersData.insertUser("AdminGeneral", "Password123@", "admin");
}

const addProposals = async () => {
    await proposalsData.clearProposalsCollection();

    let adminUser = await usersData.getUserByUsername("SebastianPS");
    let adminUserId = String(adminUser["_id"]);
    
    await proposalsData.insertProposal("Proposal title1", "12/31/2025", "This is the description of the proposal", 1000.2345, null, adminUserId);
    await proposalsData.insertProposal("Proposal title2", "12/31/2025", "This is the description of the proposal", 1000.2345, "https://www.aiseesoft.com/images/tutorial/images-to-link/images-to-link.jpg", adminUserId);
    await proposalsData.insertProposal("Proposal title3", "12/31/2025", "This is the description of the proposal", 1000.2345, null, adminUserId);
    await proposalsData.insertProposal("Proposal title4", "12/31/2025", "This is the description of the proposal", 1000.2345, null, adminUserId);
    await proposalsData.insertProposal("Proposal title5", "12/31/2025", "This is the description of the proposal", 1000.2345, null, adminUserId);
}

const addBids = async (userIds, proposalIds) => {
    await bidsData.ClearBidCollection();

    await bidsData.InsertBid((new ObjectId()).toString(), (new ObjectId()).toString(), 123654, "12/15/2026");
    await bidsData.InsertBid((new ObjectId()).toString(), (new ObjectId()).toString(), 321, "12/16/2026");
    await bidsData.InsertBid((new ObjectId()).toString(), (new ObjectId()).toString(), 321, "12/16/2026");
    await bidsData.InsertBid((new ObjectId()).toString(), (new ObjectId()).toString(), 321, "12/16/2026");
    await bidsData.InsertBid((new ObjectId()).toString(), (new ObjectId()).toString(), 321, "12/16/2026");

}

main();