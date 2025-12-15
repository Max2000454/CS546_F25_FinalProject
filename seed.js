import { ObjectId } from "mongodb";
import { closeConnection } from "./database_setup/mongoConnection.js";

import usersData from "./data/userData.js";
import proposalsData from "./data/proposalsData.js";
import bidsData from "./data/bidsData.js";

import {proposals} from "./database_setup/mongoCollections.js"

const main = async () => {
    await addVendors();
    await addAdmins();
    await addProposals();
    await addBids();
    await closeConnection();
    //await addAwardedProposals();
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
    
    await proposalsData.insertProposal("Proposal title1", "12/31/2026", "This is the description of the proposal", 1000000.2345, null, adminUserId);
    await proposalsData.insertProposal("Proposal title2", "12/31/2026", "This is the description of the proposal", 1000000.2345, "https://www.aiseesoft.com/images/tutorial/images-to-link/images-to-link.jpg", adminUserId);
    await proposalsData.insertProposal("Proposal title3", "12/31/2026", "This is the description of the proposal", 1000000.2345, null, adminUserId);
    await proposalsData.insertProposal("Proposal title4", "12/31/2026", "This is the description of the proposal", 1000000.2345, null, adminUserId);
    await proposalsData.insertProposal("Proposal title5", "12/31/2026", "This is the description of the proposal", 1000000.2345, null, adminUserId);

    // seed proposal with date that expires, s.t. when anyone loads proposal list it'll automatically be set to 'awarded'
    let proposalObject = {
        title: "Proposal title6",
        posted_by: adminUserId,
        date_posted: new Date(),
        due_date: new Date("12/14/2025"),
        description: "This is the description of the proposal",
        budget: 1000000.2345,
        bids: [],
        status: "open",
        highestBid: 1000000.2345,
        imgSrc: null
    }

    // seed awarded proposal as well
    let proposalObject2 = {
        title: "Proposal titleAccepted",
        posted_by: adminUserId,
        date_posted: new Date(),
        due_date: new Date("12/14/2025"),
        description: "This is the description of the proposal",
        budget: 1000000.2345,
        bids: [],
        status: "awarded",
        highestBid: 1000000.2345,
        imgSrc: null
    }

    const proposalsCollection = await proposals();
    await proposalsCollection.insertOne(proposalObject);
    await proposalsCollection.insertOne(proposalObject2);

}

const addBids = async () => {
    await bidsData.ClearBidCollection();

    let vendorUser = await usersData.getUserByUsername("Max2000454");
    let vendorUserId = String(vendorUser["_id"]);

    let vendorUser2 = await usersData.getUserByUsername("gamma123");
    let vendorUserId2 = String(vendorUser2["_id"]);

    let proposal = await proposalsData.getProposalByTitle("Proposal title1");
    let proposalId = String(proposal["_id"]);

    let proposal2 = await proposalsData.getProposalByTitle("Proposal title2");
    let proposalId2 = String(proposal2["_id"]);

    await bidsData.InsertBid(vendorUserId, proposalId, 12654, "12/15/2026");
    await bidsData.InsertBid(vendorUserId2, proposalId, 10000, "12/15/2026");
    await bidsData.InsertBid(vendorUserId, proposalId2, 1000, "12/15/2026");
    await bidsData.InsertBid(vendorUserId2, proposalId2, 500, "12/15/2026");
}

main();