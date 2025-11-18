import { ObjectId } from "mongodb";
import { contracts } from "../database_setup/mongoCollections.js";

const getContractById = async (id) => {
    if (typeof(id) !== "string") throw `Error<getContractById>: id provided must be of type string, given type: ${typeof(id)}`;
    
    const contractsCollection = await contracts();

    let contract = await contractsCollection.findOne({'_id' : new ObjectId(id)}, {projection : {_id : 0, name : 1}});
    return contract;
}

const insertContract = async (name) => {
    if (typeof(name) !== "string") throw `Error<insertContract>: name provided must be of type string, given type: ${typeof(name)}`;
    
    const contractsCollection = await contracts();

    const contractObject = {
        "name" : name
    }
    
    const insertInfo = await contractsCollection.insertOne(contractObject);
    if (insertInfo.acknowledged !== true) throw `Error<insertContract>: failed to insert new contract!`;
    return await getContractById(insertInfo.insertedId.toString());
}

const cleanOutContracts = async () => {
    const contractsCollection = await contracts();
    const deleteInfo = await contractsCollection.deleteMany({});
    return `Deleted ${deleteInfo.deletedCount} entries`;
}

export default { getContractById, insertContract, cleanOutContracts };