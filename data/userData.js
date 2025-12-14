import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";

import { users } from "../database_setup/mongoCollections.js";
import validationFunctions from "../helpers/validate.js";
import proposalDataFunctions from "./proposalsData.js";

/*
{
_id : String,
username : String,
first_name : String,
last_name : String,
email : String,
password : String,

open_proposals : Array[ObjectId]
open_bids : Array[ObjectId]
accountType : String
}
*/


const getUserById = async (id) => {
    if (!id) throw "Error<getUserById>: provide id";
    id = validationFunctions.validate_id(id);
    const usersCollection = await users();
    let userObj = await usersCollection.findOne({_id : new ObjectId(id)});
    if (!userObj) throw `Error<getUserById>: could not find user with id ${id}`;
    return userObj;
}

/*
INPUT:
- businessName : String
- phoneNumber : String
- email : String (optional)
OUTPUT:
- vendorDocument : Object
Registers a new vendor (for vendors not in Jersey City database)
First checks if vendor exists in API - if so, uses API data
If not, creates a self-registered vendor
*/
const insertUser = async (username, password, accountType) => {
    if (!username || !password) {
        throw new Error("Business name and phone number are required");
    }

    username = validationFunctions.validate_username(username);
    password = validationFunctions.validate_password(password);

    username = username.toLowerCase();

    // Check if vendor already exists in our database
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
        throw new Error(`User with username "${username}" already exists`);
    }

    // check if vendor exists in API
    //console.log(`Checking if "${businessName}" exists in Jersey City API...`);
    //const apiVendor = await checkVendorInAPI(businessName);

    //if (apiVendor) {
    //    // vendor exists in API, create record using API data
    //    console.log("Vendor found in API, creating record with API data...");
    //    return await createVendorFromAPI(apiVendor, phoneNumber);
    //}

    // vendor not in API, create self-registered vendor
    const usersCollection = await users();
    const hashedPassword = await bcrypt.hash(password, 10);
    const userObj = {
        username: username,
        first_name: "HARDCODED",
        last_name: "HARDCODED",
        email: "HARDCODED@GMAIL.COM",
        password: hashedPassword,
        open_bids: [],
        open_proposals: [],
        accountType: accountType,
    };

    const insertInfo = await usersCollection.insertOne(userObj);

    if (!insertInfo.acknowledged) {
        throw new Error("Failed to insert new user");
    }

    return await getUserById(String(insertInfo.insertedId));
};

/*
INPUT:
- username : String
OUTPUT:
- userDocument : Object or null
Gets user from local MongoDB database
*/
const getUserByUsername = async (username) => {
    if (!username) throw `Error<getUserByUsername>: no username provided`;
    username = validationFunctions.validate_username(username);
    username = username.toLowerCase();

    const usersCollection = await users();
    const usersDocument = await usersCollection.findOne({ "username": username });
    return usersDocument;
};

/*
INPUT:
- username : String (username)
- password : String (password)
OUTPUT:
- vendorDocument : Object or null
Validates vendor credentials
- First checks local database
- If not found, checks Jersey City API and creates record if valid
- Returns vendor document if authentication successful
*/
const validateUserLogin = async (username, password, accountType) => {
    if (!username || !password || !accountType) throw `Error<validateUserLogin>: please provide username or password`;

    username = validationFunctions.validate_username(username);
    password = validationFunctions.validate_password(password);

    username = username.toLowerCase();

    // First, check if vendor exists in our database
    let userObj = await getUserByUsername(username);

    if (!userObj) throw `Error<validateUserLogin>: No user found`;

    // check account type
    if (userObj.accountType != accountType) throw `Error<validateUserLogin>: Incorrect account type, you are not a ${accountType}`;

    // vendor exists in database, validate password
    const passwordMatch = await bcrypt.compare(password, userObj["password"]);

    if (passwordMatch) {
        return userObj;
    } else {
        throw `Error<validateUserLogin>: Provided information is incorrect`;
    }

    /*
    // vendor not in database, check Jersey City API
    console.log(`Vendor "${businessName}" not found in database, checking API...`);
    const apiVendor = await checkVendorInAPI(businessName);

    if (apiVendor) {
        // Vendor found in API, verify phone number matches
        if (apiVendor.primary_phone === phoneNumber) {
            console.log(`Vendor found in API with matching phone. Creating local record...`);
            // Create vendor record in database
            vendorDocument = await createVendorFromAPI(apiVendor, phoneNumber);
            return vendorDocument;
        } else {
            console.log("Phone number does not match API record");
            return null;
        }
    }

    console.log("Vendor not found in API");
    return null;
    */
};

/*
INPUT:
- businessName : String
OUTPUT:
- exists : Boolean
*/
const checkUserExists = async (username) => {
    const user = await getUserByUsername(username);
    return user !== null;
};

/*
INPUT: N/A
OUTPUT: Number of useres in database
*/
const getUserCount = async () => {
    const usersCollection = await users();
    return await usersCollection.countDocuments();
};

/*
INPUT: N/A
OUTPUT: deletedCount : String
*/
const clearUserCollection = async () => {
    const usersCollection = await users();
    const deleteInfo = await usersCollection.deleteMany({});
    let returnObj = {deletedAny : false, deleteCount : 0};
    if (deleteInfo.deletedCount > 0) {
        returnObj.deletedAny = true;
        returnObj.deleteCount = deleteInfo.deletedCount;
    }
    return returnObj;
};

const addProposalToUser = async(user_id, proposal_id) => {
    if (!user_id || !proposal_id) throw `Error<addProposalToUser>: Please provide user_id, proposal_id`;
    user_id = validationFunctions.validate_id(user_id);
    proposal_id = validationFunctions.validate_id(proposal_id);
    
    // get user + check that user is admin
    let userObj = await getUserById(user_id);
    if (!userObj || userObj.accountType !== "admin") throw `Error<addProposalToUser>: Invalid user id ${id} provided`;

    // check proposal exists
    let proposalObj = await proposalDataFunctions.getProposalById(proposal_id);
    if (!proposalObj) throw `Error<addProposalToUser>: Invalid proposal id ${id} provided`;

    // add proposal id to user's open_proposals
    const usersCollection = await users();
    let updateInfo = await usersCollection.updateOne({_id : new ObjectId(user_id)}, { $addToSet: { open_proposals: proposal_id } });

    if (updateInfo.modifiedCount > 0) {
        return {success : true};
    } else {
        return {success : false};
    }
}

const removeProposalFromUser = async (user_id, proposal_id) => {
    if (!user_id || !proposal_id) throw `Error<removeProposalFromUser>: Please provide user_id, proposal_id`;
    user_id = validationFunctions.validate_id(user_id);
    proposal_id = validationFunctions.validate_id(proposal_id);
    
    // get user + check that user is admin
    let userObj = await getUserById(user_id);
    if (!userObj || userObj.accountType !== "admin") {
        throw `Error<removeProposalFromUser>: Invalid user id ${user_id} provided`;
    }

    // check proposal exists
    let proposalObj = await proposalDataFunctions.getProposalById(proposal_id);
    if (!proposalObj) {
        throw `Error<removeProposalFromUser>: Invalid proposal id ${proposal_id} provided`;
    }

    // remove proposal id from user's open_proposals
    const usersCollection = await users();
    let updateInfo = await usersCollection.updateOne(
        { _id: new ObjectId(user_id) },
        { $pull: { open_proposals: proposal_id } }
    );

    if (updateInfo.modifiedCount > 0) {
        return { success: true };
    } else {
        return { success: false };
    }
};

export default {
    getUserById,
    insertUser,
    getUserByUsername,
    validateUserLogin,
    checkUserExists,
    getUserCount,
    clearUserCollection,
    addProposalToUser,
    removeProposalFromUser,
}

//const JERSEY_CITY_API_URL = "https://data.jerseycitynj.gov/api/explore/v2.1/catalog/datasets/vendors-directory/records";

/*
INPUT:
- businessName : String
OUTPUT:
- vendorData : Object or null
Checks if a vendor exists in the Jersey City API by business name

const checkVendorInAPI = async (businessName) => {
    try {
        // Search for vendor by business name in the API
        const searchQuery = encodeURIComponent(businessName);
        const url = `${JERSEY_CITY_API_URL}?where=business_name='${searchQuery}'&limit=1`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error(`API request failed with status ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            return data.results[0];
        }

        return null;
    } catch (error) {
        console.error("Error checking vendor in API:", error);
        return null;
    }
};
*/

/*
INPUT:
- apiVendor : Object (vendor data from Jersey City API)
- phoneNumber : String
OUTPUT:
- vendorDocument : Object
Creates a vendor record in MongoDB from API data
*/
/*
const createVendorFromAPI = async (apiVendor, phoneNumber) => {
    const vendorsCollection = await vendors();

    // Hash the phone number to use as password
    const hashedPassword = await bcrypt.hash(phoneNumber, 10);

    const vendorDocument = {
        "Business Name": apiVendor.business_name,
        "Alternative Business Name": apiVendor.alternative_business_name || null,
        "Contact First Name": apiVendor.contact_first_name || null,
        "Contact Last Name": apiVendor.contact_last_name || null,
        "Primary Phone": apiVendor.primary_phone,
        "Fax Phone": apiVendor.fax_phone || null,
        "Email Address": apiVendor.e_mail_address || null,
        "Business Address 1": apiVendor.business_address_1 || null,
        "Business Address 2": apiVendor.business_address_2 || null,
        "Business City": apiVendor.business_city || null,
        "Business State": apiVendor.business_state || null,
        "Business Zip": apiVendor.business_zip || null,
        "Designation": apiVendor.designation || [],
        "Status": apiVendor.status || null,
        "Gross Sale Revenue": apiVendor.gross_sale_revnue || null,
        "Hashed Password": hashedPassword,
        "Open Bids": [],
        "Awarded Contracts": [],
        "Source": "Jersey City API"
    };

    const insertInfo = await vendorsCollection.insertOne(vendorDocument);

    if (!insertInfo.acknowledged) {
        throw new Error("Failed to insert vendor from API");
    }

    return vendorDocument;
};
*/