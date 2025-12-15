import { MongoClient, ObjectId } from "mongodb";

import { proposals } from "../database_setup/mongoCollections.js";
import userDataFunctions from "./userData.js";
import bidDataFunctions from "./bidsData.js";
import validationFunctions from "../helpers/validate.js";
import userData from "./userData.js";

/*
{ 
_id : ObjectId(...),
title : String,
posted_by : String,
date_posted : Date,
due_date : Date,
description : String,
budget : int,
bids : [bid1, bid2, bid3, ...],

status : String (awarded / open)
highestBid : int
imgSrc : String
}
*/

const insertProposal = async (title, due_date, description, budget, imgSrc, posted_by) => {
    // check for args
    if (!title || !due_date || !description || !budget || !posted_by) throw `Error<insertProposal>: Must provide all arguments`;
    
    // validation
    title = validationFunctions.check_string(title);
    due_date = validationFunctions.validate_date(due_date);
    description = validationFunctions.check_string(description);
    budget = validationFunctions.check_number(budget);
    
    if (imgSrc) {
        imgSrc = validationFunctions.validate_image_link(imgSrc);
    }

    posted_by = validationFunctions.validate_id(posted_by);
    let userObj = await userDataFunctions.getUserById(posted_by);
    if (!userObj) throw `Error<insertProposal>: no user with id ${posted_by}`;
    if (userObj.accountType !== "admin") throw `Error<insertProposal>: User must be of type 'admin' to submit a proposal`;

    // create proposal object
    let proposalObject = {
        title: title,
        posted_by: posted_by,
        date_posted: new Date(),
        due_date: due_date,
        description: description,
        budget: budget,
        bids: [],
        status: "open",
        highestBid: budget,
        imgSrc: imgSrc
    }

    const proposalsCollection = await proposals();
    let insertInfo = await proposalsCollection.insertOne(proposalObject);
    if (!insertInfo) throw `Error<InsertProposal>: Failed to insert proposal`;

    // add proposal to user's "open_proposals"
    let succeeded = await userDataFunctions.addProposalToUser(posted_by, String(insertInfo.insertedId));
    if (!succeeded.success) throw `Error<InsertProposal>: Failed to insert proposal ID into user ID`;

    return await getProposalById(String(insertInfo.insertedId));
}

const getProposalById = async (id) => {
    if (!id) throw "Please proivde id";
    id = validationFunctions.validate_id(id);
    const proposalsCollection = await proposals();
    let proposalObj = await proposalsCollection.findOne({_id : new ObjectId(id)});
    return proposalObj;
}

const getProposalByTitle = async (name) => {
    if (!name) throw "Please proivde name";
    name = validationFunctions.check_string(name);
    const proposalsCollection = await proposals();
    let proposalObj = await proposalsCollection.findOne({"title" : name});
    return proposalObj;
}

const removeProposalById = async (id) => {
    if (!id) throw `Error<removeProposalById>: Missing argument id`;
    
    // delete proposalId from user
    let proposalObj = await getProposalById(id);
    let userId = proposalObj.posted_by;
    await userDataFunctions.removeProposalFromUser(userId, id);

    // delete proposal bids
    let bid_ids = proposalObj["bids"];
    for (let bid_id of bid_ids) {
        await bidDataFunctions.RemoveBidById(bid_id);
    }
    
    const proposalsCollection = await proposals();
    let deleteInfo = await proposalsCollection.deleteOne({"_id" : id});
    if (deleteInfo) {
        return {id : id, deleted : true}
    } else {
        return {id : id, deleted : false}
    }
}

const removeProposalByTitle = async (title) => {
    if (!title) throw `Error<removeProposalByTitle>: Missing argument title`;
    
    // delete proposalId from user
    let proposalObj = await getProposalByTitle(title);
    let userId = proposalObj.posted_by;
    await userDataFunctions.removeProposalFromUser(userId, String(proposalObj._id));

    // delete proposal bids
    let bid_ids = proposalObj["bids"];
    for (let bid_id of bid_ids) {
        await bidDataFunctions.RemoveBidById(bid_id);
    }

    const proposalsCollection = await proposals();
    let deleteInfo = await proposalsCollection.deleteOne({"title" : title});
    if (deleteInfo) {
        return {id : title, deleted : true}
    } else {
        return {id : title, deleted : false}
    }
}

// this will run before any request to the database to get multiple proposals
// If due_date < Date() then we'll update status from "open" to "awarded"
const checkAllProposalDates = async () => {
    const proposalsCollection = await proposals();
    const now = new Date();

    // find all open proposals whose due_date has passed
    const expiredProposals = await proposalsCollection.find({
        status: "open",
        due_date: { $lt: now }
    }).toArray();

    if (expiredProposals.length === 0) {
        return {
            updatedAny: false,
            updateCount: 0
        };
    }

    const updateResult = await proposalsCollection.updateMany(
        {
            status: "open",
            due_date: { $lt: now }
        },
        {
            $set: { status: "awarded" }
        }
    );

    return {
        updatedAny: updateResult.modifiedCount > 0,
        updateCount: updateResult.modifiedCount
    };
}

const getAllProposals = async () => {
    await checkAllProposalDates();
    const proposalsCollection = await proposals();
    let allProposals = await proposalsCollection.find({}).toArray();
    return allProposals;
}

const getAwardedProposals = async () => {
    await checkAllProposalDates();
    const proposalsCollection = await proposals();
    let allAwardedProposals = await proposalsCollection.find({status : "awarded"}).toArray();
    return allAwardedProposals;
}

const getOpenProposals = async () => {
    await checkAllProposalDates();
    const proposalsCollection = await proposals();
    let allOpenProposals = await proposalsCollection.find({status : "open"}).toArray();
    return allOpenProposals;
}

const clearProposalsCollection = async () => {
    const proposalsCollection = await proposals();
    let deleteInfo = await proposalsCollection.deleteMany({});
    let returnObj = {deletedAny : false, deleteCount : 0};
    if (deleteInfo.deletedCount > 0) {
        returnObj.deletedAny = true;
        returnObj.deleteCount = deleteInfo.deletedCount;
    }
    return returnObj;
}

export default {
    insertProposal,
    getProposalById,
    getProposalByTitle,
    removeProposalById,
    removeProposalByTitle,
    getAllProposals,
    getAwardedProposals,
    getOpenProposals,
    clearProposalsCollection,
};
