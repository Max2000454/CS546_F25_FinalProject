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
    res.sendFile(path.join(__dirname, "static", "main.html"));
})

// main page (actually)
app.get("/main", (req, res) => {
    res.render("main/mainpage.handlebars", {
        topBarStyleSheet : "/css/topBar.css", 
        pageStyleSheet : "/css/mainPage.css",
        title : "Main Page", 
        topBar: "./views/main/topBar.handlebars",
    });
})

// awarded contracts
app.get("/awardedContracts", (req, res) => {
    res.render("main/awardedContracts.handlebars", {
        topBarStyleSheet : "/css/topBar.css", 
        pageStyleSheet : "/css/awardedContracts.css",
        title : "Awarded Contracts", 
        topBar: "./views/main/topBar.handlebars",
        contracts: [
            {name : "Contract1", awardee: "Sebastian Industries", amount: "$100000000", date: "12/02/2025", description: "This is a basic description that we can use as filler for now. This is a basic description that we can use as filler for now. This is a basic description that we can use as filler for now. This is a basic description that we can use as filler for now."},
            {name : "Contract1", awardee: "Sebastian Industries", amount: "$100000000", date: "12/02/2025", description: "This is a basic description that we can use as filler for now. This is a basic description that we can use as filler for now. This is a basic description that we can use as filler for now. This is a basic description that we can use as filler for now."},
        ],
    })
})

// VENDOR ROUTES:

app.get("/vendorLogin", (req, res) => {
    res.render("main/vendorLogin.handlebars", {
        topBarStyleSheet : "/css/topBar.css", 
        pageStyleSheet : "/css/vendorLogin.css",
        title : "Vendor Login", 
        topBar: "./views/main/topBar.handlebars",
    })
})

app.get("/vendorRegister", (req, res) => {
    
})

app.get("/openBids", (req, res) => {
    
})

app.get("/yourBids", (req, res) => {
    
})

app.get("/ratingSystem", (req, res) => { // optional
    
})

// ADMIN ROUTES:

app.get("/adminLogin", (req, res) => {
    
})

app.get("/bididngPortal", (req, res) => {
    
})

app.get("/analytics", (req, res) => {
    
})

app.get("/questions", (req, res) => { // optional
    
})

// run app
app.listen(3000, () => {
    console.log("Server is running!");
})
