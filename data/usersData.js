import { users } from "../database_setup/mongoCollections.js";
import validateFunctions from "../helpers/validate.js";
import { ObjectId } from "mongodb";

/*
INPUT:
- id : String
OUTPUT:
- userDocument : Object
*/
const getUserById = async (id) => {
    id = validateFunctions.validate_id(id);
    
    const usersCollection = await users();
    let userDocument = await usersCollection.findOne({"_id" : new ObjectId(id)});
    if (!userDocument) {
        throw `Error<${getUserById.name}>: No document found with id ${id}`;
    }
    return userDocument;
}

/*
INPUT:
- email : String
OUTPUT:
- documentExists : Boolean
*/
const checkUserByEmail = async (email) => {
    email = validateFunctions.validate_email(email);

    const usersCollection = await users();
    let userDocument = await usersCollection.findOne({"Email" : email});
    if (!userDocument) {
        return false
    }
    return true;
}

/*
INPUT:
- firstName : String
- lastName : String
- email : String
- password : String
OUTPUT:
- userDocument : Object
*/
const insertUser = async (firstName, lastName, email, password) => {
    firstName = validateFunctions.validate_name(firstName);
    lastName = validateFunctions.validate_name(lastName);
    email = validateFunctions.validate_email(email);
    password = validateFunctions.validate_password(password);

    const potentialUser = await checkUserByEmail(email);
    if (potentialUser) {
        console.log(potentialUser);
        throw `Error<${insertUser.name}>: User already exists with email ${email}`;
    }

    const usersCollection = await users();
    const newUser = {
        "First Name" : firstName,
        "Last Name" : lastName,
        "Email" : email,
        "Hashed Password" : password,
        "Open Proposals" : [],
        "Open Bids" : [],
    }
    const insertInfo = await usersCollection.insertOne(newUser);
    if (!insertInfo.acknowledged) {
        throw `Error<${insertUser.name}>: Failed to insert user with data ${newUser}`;
    }
    return await getUserById(insertInfo.insertedId.toString());
}

/*
INPUT:
- N/A
OUTPUT:
- deletedCount : Number
*/
const deleteAllUsers = async () => {
    const usersCollection = await users();
    const deleteInfo = await usersCollection.deleteMany({});
    return `Deleted ${deleteInfo.deletedCount} entries`;
}

export default {getUserById, checkUserByEmail, insertUser, deleteAllUsers};