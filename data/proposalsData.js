import { MongoClient, ObjectId } from "mongodb";

import { proposals } from "../database_setup/mongoCollections.js";
import userDataFunctions from "./userData.js";
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

const removeProposalById = async (id) => {
    if (!id) throw `Error<removeProposalById>: Missing argument id`;
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
    const proposalsCollection = await proposals();
    let deleteInfo = await proposalsCollection.deleteOne({"title" : title});
    if (deleteInfo) {
        return {id : title, deleted : true}
    } else {
        return {id : title, deleted : false}
    }
}

const getAllProposals = async () => {
    const proposalsCollection = await proposals();
    let allProposals = await proposalsCollection.find({}).toArray();
    return allProposals;
}

const getAwardedProposals = async () => {
    const proposalsCollection = await proposals();
    let allAwardedProposals = await proposalsCollection.find({status : "awarded"}).toArray();
    return allAwardedProposals;
}

const getOpenProposals = async () => {
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
    removeProposalById,
    removeProposalByTitle,
    getAllProposals,
    getAwardedProposals,
    getOpenProposals,
    clearProposalsCollection,
};
