import { MongoClient, ObjectId } from "mongodb";

import { bids } from "../database_setup/mongoCollections.js";
import validationFunctions from "../helpers/validate.js";

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
    // validation
    if (!user_id || !proposal_id || !amount || !date_posted) {
        throw "Error<InsertBid>: Please provide all proper arguments [user_id, proposal_id, amount, date_posted]";
    }

    user_id = validationFunctions.validate_id(user_id);
    proposal_id = validationFunctions.validate_id(proposal_id);
    amount = validationFunctions.check_integer(amount);
    date_posted = validationFunctions.validate_date(date_posted);

    // validate we are given a valid user_id and proposal_id
    // if other bid from user for exact proposal exists, remove it!

    let bidObj = {
        user_id : user_id,
        proposal_id : proposal_id,
        amount : amount,
        date_posted : date_posted,
    }

    const bidsCollection = await bids();
    let insertInfo = await bidsCollection.insertOne(bidObj);
    return await GetBidById(insertInfo.insertedId);
}

const GetBidById = async (id) => {
    if (!id) throw `Error<GetBidById>: Missing argument id`;
    const bidsCollection = await bids();
    let bidObj = await bidsCollection.findOne({"_id" : id});
    if (!bidObj) throw `Error<GetBidById>: Could not find bid with id ${id}`;
    return bidObj;
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
    RemoveBidById,
    ClearBidCollection
 }