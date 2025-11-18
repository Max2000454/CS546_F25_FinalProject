import insertDataFunctions from './data/contractsData.js';
import { closeConnection } from './database_setup/mongoConnection.js';
import express from 'express'

const app = express();

/*
const main = async () => {
    //const insertedId = await insertDataFunctions.insertContract("MyName");
    //console.log(insertedId);

    //const amountDeleted = await insertDataFunctions.cleanOutContracts();
    //console.log(amountDeleted);

    await closeConnection();
}

main();
*/

app.get('/', (req, res) => {
    res.send("success!");
})

app.listen(3000, () => {
    console.log("Server is running!");
})


