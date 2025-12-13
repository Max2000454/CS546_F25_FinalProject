import vendorsData from "./data/vendorsData.js";
import { closeConnection } from "./database_setup/mongoConnection.js";

import express from "express"
import exphbs from"express-handlebars"
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// connect ./public to static middleware
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        name:"AuthSession",
        secret:"ThisIsASecretKey",
        resave:false,
        saveUninitialized:false
    })
);

// connect other middleware
app.use(express.urlencoded({extended:true}));
app.use(express.json());

// setup handlebars, html templating
app.engine("handlebars", exphbs.engine({defaultLayout: "main"}));
app.set("view engine", "handlebars");

// main page
app.get("/", (req, res) => {
    //res.sendFile(path.join(__dirname, "static", "main.html"));
    res.redirect("/main");
})

app.get("/main",function(req,res){
    res.render("main/mainPage.handlebars",{
        topBarStyleSheet:"/css/topBar.css",
        pageStyleSheet:"/css/mainPage.css",
        title:"Main Page"
    });
});

app.get("/awardedContracts",function(req,res){
    res.render("main/awardedContracts.handlebars",{
        topBarStyleSheet:"/css/topBar.css",
        pageStyleSheet:"/css/awardedContracts.css",
        title:"Awarded Contracts",
        contracts:[
            {name:"Contract1",awardee:"Sebastian Industries",amount:"$100000",date:"12/02/2025",description:"Example description"},
            {name:"Contract2",awardee:"Jaran Solutions",amount:"$50000",date:"12/03/2025",description:"Example description"}
        ]
    });
});

// VENDOR ROUTES

app.get("/vendorRegister",function(req,res){
    res.render("main/vendorRegister.handlebars",{
        title:"Vendor Register",
        topBarStyleSheet:"/css/topBar.css",
        pageStyleSheet:"/css/vendorLogin.css"
    });
});

app.post("/vendorRegister",async function(req,res){
    var businessName = req.body.username;
    var phoneNumber = req.body.password;
    var email = req.body.email || null;

    if(!businessName || !phoneNumber){
        return res.render("main/vendorRegister.handlebars",{
            error:"Missing business name or phone number",
            title:"Vendor Register",
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/vendorLogin.css"
        });
    }

    try {
        // check if vendor already exists
        const vendorExists = await vendorsData.checkVendorExists(businessName);
        if(vendorExists){
            return res.render("main/vendorRegister.handlebars",{
                error:"Business name already exists",
                title:"Vendor Register",
                topBarStyleSheet:"/css/topBar.css",
                pageStyleSheet:"/css/vendorLogin.css"
            });
        }

        // register new vendor
        await vendorsData.registerNewVendor(businessName, phoneNumber, email);

        req.session.vendor = businessName;
        return res.redirect("/openBids");
    } catch(error) {
        console.error("Vendor registration error:", error);
        return res.render("main/vendorRegister.handlebars",{
            error:"An error occurred during registration",
            title:"Vendor Register",
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/vendorLogin.css"
        });
    }
});

app.get("/vendorLogin",function(req,res){
    res.render("main/vendorLogin.handlebars",{
        topBarStyleSheet:"/css/topBar.css",
        pageStyleSheet:"/css/vendorLogin.css",
        title:"Vendor Login"
    });
});

app.post("/vendorLogin",async function(req,res){
    var businessName = req.body.username;
    var phoneNumber = req.body.password;

    if(!businessName || !phoneNumber){
        return res.render("main/vendorLogin.handlebars",{
            error:"Missing business name or phone number",
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/vendorLogin.css",
            title:"Vendor Login"
        });
    }

    try {
        const vendorDocument = await vendorsData.validateVendorLogin(businessName, phoneNumber);

        if(vendorDocument){
            req.session.vendor = businessName;
            return res.redirect("/openBids");
        }

        return res.render("main/vendorLogin.handlebars",{
            error:"Invalid business name or phone number",
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/vendorLogin.css",
            title:"Vendor Login"
        });
    } catch(error) {
        console.error("Vendor login error:", error);
        return res.render("main/vendorLogin.handlebars",{
            error:"An error occurred during login",
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/vendorLogin.css",
            title:"Vendor Login"
        });
    }
});

app.get("/openBids", (req, res) => {
    if(!req.session.vendor){
        return res.redirect("/vendorLogin");
    }

    res.render("main/openBids.handlebars", {
        pageStyleSheet : "/css/openBids.css",
        title : "Open Bids",
        contracts : [
            {name: "Contract1", highestBid: "1,000,000", expirationDate: "12/14/2025", description: "This is a palceholder description for a placeholder contract that will be replaced later, it is static right now!", imgSrc : ""},
            {name: "Contract1", highestBid: "1,000,000", expirationDate: "12/14/2025", description: "This is a palceholder description for a placeholder contract that will be replaced later, it is static right now!", imgSrc : ""},
        ]
    })
})

app.get("/yourBids", (req, res) => {
    if(!req.session.vendor){
        return res.redirect("/vendorLogin");
    }

    res.render("main/yourBids.handlebars", {
        pageStyleSheet : "/css/yourBids.css",
        title: "Your Bids",
        contracts: [
            {name: "Contract1", highestBid: "1,000,000", expirationDate: "12/14/2025", yourBid: "1,000,000", status: "Pending", ongoing : true},
            {name: "Contract1", highestBid: "1,000,000", expirationDate: "12/13/2025", yourBid: "1,000,000", status: "Finished", ongoing : false},
        ]
    })
})

app.get("/ratingSystem", (req, res) => { // optional
    res.redirect("/main");
})

// ADMIN ROUTES:

app.get("/adminLogin", (req, res) => {
    res.render("main/adminLogin.handlebars", {
        pageStyleSheet : "/css/adminLogin.css",
        title: "Admin Login",
    })
})

app.get("/biddingPortal", (req, res) => {
    
})

app.get("/analytics", (req, res) => {
    
})

app.get("/questions", (req, res) => { // optional
    res.redirect("/main");
})

// run app
app.listen(3000, () => {
    console.log("Server is running!");
})
