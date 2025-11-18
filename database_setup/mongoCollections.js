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

export const contracts = getCollection("contracts");