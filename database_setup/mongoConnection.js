import { MongoClient } from "mongodb"
import settings from "./settings.js"

let _connection = undefined
let _db = undefined

const openConnection = async () => {
    if (!_connection) {
        _connection = await MongoClient.connect(settings.serverUrl);
        _db = _connection.db(settings.database);
    }

    return _db;
}

const closeConnection = async() => {
    await _connection.close();
}

export {openConnection, closeConnection};