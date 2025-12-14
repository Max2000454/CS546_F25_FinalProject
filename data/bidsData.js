import { MongoClient, ObjectId } from "mongodb";

import { users, proposals } from "../database_setup/mongoCollections.js";
import { bids } from "../database_setup/mongoCollections.js";
import validationFunctions from "../helpers/validate.js";
import userDataFunctions from "./userData.js";
import proposalDataFunctions from "./proposalsData.js";

/* 
{
_id : ObjectId(...),
user_id : String,
proposal_id : String,
amount : int,
date_posted : Date
}
*/

const InsertBid = async (user_id, proposal_id, amount, date_posted) => {
    if (!user_id || !proposal_id || !amount || !date_posted) {
        throw "Error<InsertBid>: Please provide all proper arguments [user_id, proposal_id, amount, date_posted]";
    }

    user_id = validationFunctions.validate_id(user_id);
    proposal_id = validationFunctions.validate_id(proposal_id);
    amount = validationFunctions.check_number(amount);
    
    date_posted = new Date(date_posted);

    // validate user and proposal exist
    await userDataFunctions.getUserById(user_id);
    let proposalObj = await proposalDataFunctions.getProposalById(proposal_id);
    if (proposalObj["status"] !== "open") throw `Error<InsertBid>: Cannot make a bid on proposal already closed`;
    if (amount > proposalObj.highestBid) throw `Error<InsertBid>: Bid amount cannot be greater than current amount`;

    // check/remove duplicate bid
    let bidAlreadyMade = await CheckBidByUserProposalID(user_id, proposal_id);
    if (bidAlreadyMade) {
        RemoveBidByUserProposalID(user_id, proposal_id);
    }

    const bidObj = {
        user_id: user_id,
        proposal_id: proposal_id,
        amount: amount,
        date_posted: date_posted
    };

    const bidsCollection = await bids();
    const usersCollection = await users();
    const proposalsCollection = await proposals();

    // insert bid
    const insertInfo = await bidsCollection.insertOne(bidObj);
    const bidId = String(insertInfo.insertedId);

    // add bid to user.open_bids
    await usersCollection.updateOne(
        { _id: new ObjectId(user_id) },
        { $addToSet: { open_bids: bidId } }
    );

    // add bid to proposal.bids
    await proposalsCollection.updateOne(
        { _id: new ObjectId(proposal_id) },
        { $addToSet: { bids: bidId } }
    );

    // update highestBid (lowest amount wins)
    if (amount < proposalObj.highestBid) {
        await proposalsCollection.updateOne(
            { _id: new ObjectId(proposal_id) },
            { $set: { highestBid: amount } }
        );
    }

    return await GetBidById(bidId);
};

const GetBidById = async (id) => {
    if (!id) throw `Error<GetBidById>: Missing argument id`;
    id = validationFunctions.validate_id(id);
    const bidsCollection = await bids();
    let bidObj = await bidsCollection.findOne({"_id" : new ObjectId(id)});
    if (!bidObj) throw `Error<GetBidById>: Could not find bid with id ${id}`;
    return bidObj;
}

const CheckBidByUserProposalID = async (user_id, proposal_id) => {
    if (!user_id || !proposal_id) {
        throw "Error<GetBidByUserProposalID>: Missing argument [user_id, proposal_id]";
    }

    user_id = validationFunctions.validate_id(user_id);
    proposal_id = validationFunctions.validate_id(proposal_id);

    const bidsCollection = await bids();
    const bid_obj = await bidsCollection.findOne({
        user_id: user_id,
        proposal_id: proposal_id
    });

    if (bid_obj) return true;
    return false;
}

const RemoveBidById = async (id) => {
    if (!id) throw `Error<RemoveBidById>: Missing argument id`;
    const bidsCollection = await bids();
    let deleteInfo = await bidsCollection.deleteOne({"_id" : id});
    if (deleteInfo) {
        return {id : id, deleted : true}
    } else {
        return {id : id, deleted : false}
    }
}

const RemoveBidByUserProposalID = async (user_id, proposal_id) => {
    if (!user_id || !proposal_id) {
        throw "Error<RemoveBidByUserProposalID>: Missing argument [user_id, proposal_id]";
    }

    user_id = validationFunctions.validate_id(user_id);
    proposal_id = validationFunctions.validate_id(proposal_id);

    const bidsCollection = await bids();
    const usersCollection = await users();
    const proposalsCollection = await proposals();

    // find the bid
    const bidObj = await bidsCollection.findOne({ user_id, proposal_id });
    if (!bidObj) {
        return { user_id, proposal_id, deleted: false };
    }

    const bidId = String(bidObj._id);

    // delete bid
    await bidsCollection.deleteOne({ _id: bidObj._id });

    // remove bid from user.open_bids
    await usersCollection.updateOne(
        { _id: new ObjectId(user_id) },
        { $pull: { open_bids: bidId } }
    );

    // remove bid from proposal.bids
    await proposalsCollection.updateOne(
        { _id: new ObjectId(proposal_id) },
        { $pull: { bids: bidId } }
    );

    // recompute highestBid
    const remainingBids = await bidsCollection.find({ proposal_id }).toArray();

    let newHighestBid;
    if (remainingBids.length === 0) {
        const proposalObj = await proposalDataFunctions.getProposalById(proposal_id);
        newHighestBid = proposalObj.budget;
    } else {
        newHighestBid = Math.min(...remainingBids.map(b => b.amount));
    }

    await proposalsCollection.updateOne(
        { _id: new ObjectId(proposal_id) },
        { $set: { highestBid: newHighestBid } }
    );

    return {
        user_id: user_id,
        proposal_id: proposal_id,
        deleted: true
    };
};


const ClearBidCollection = async () => {
    const bidsCollection = await bids();
    let deleteInfo = await bidsCollection.deleteMany({});
    let returnObj = {deletedAny : false, deleteCount : 0};
    if (deleteInfo.deletedCount > 0) {
        returnObj.deletedAny = true;
        returnObj.deleteCount = deleteInfo.deletedCount;
    }
    return returnObj;
}

export default { 
    InsertBid,
    GetBidById,
    CheckBidByUserProposalID,
    RemoveBidById,
    RemoveBidByUserProposalID,
    ClearBidCollection
 }