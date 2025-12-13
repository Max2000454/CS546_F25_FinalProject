import { openConnection, closeConnection } from "./mongoConnection.js";


const getCollection = (collectionName) => {
    let _collection = undefined;

    return async () => {
        if (!_collection) {
            const db = await openConnection();
            _collection = await db.collection(collectionName);
        }

        return _collection;
    }
}

export const users = getCollection("Users");
export const proposals = getCollection("Proposals");
export const bids = getCollection("Bids");
export const vendors = getCollection("Vendors");
export const contracts = getCollection("Contracts");
