import insertDataFunctions from "./data/usersData.js";
import { closeConnection } from "./database_setup/mongoConnection.js";

import express from "express"
import exphbs from"express-handlebars"
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
async function main() {
    console.log(await insertDataFunctions.deleteAllUsers());
    await insertDataFunctions.insertUser("Sebastian", "Sztolberg", "ssztolbe@stevens.edu", "Gamer@1805");
    await closeConnection();
}
main();
*/


const app = express();

// connect ./public to static middleware
app.use(express.static(path.join(__dirname, "public")));

// other middleware
// ADD PER LECTURE CODE

// setup handlebars, html templating
app.engine("handlebars", exphbs.engine({defaultLayout: "main"}));
app.set("view engine", "handlebars");

// main page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'main.html'));
})

// handlebar testing
app.get("/templateTest", (req, res) => {
    res.render("./main/test", {title : "test"});
})

// run app
app.listen(3000, () => {
    console.log("Server is running!");
})
