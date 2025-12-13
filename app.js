import insertDataFunctions from "./data/usersData.js";
import vendorsData from "./data/vendorsData.js";
import { closeConnection } from "./database_setup/mongoConnection.js";

import express from "express";
import exphbs from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import bcrypt from "bcrypt";

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

app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(
    session({
        name:"AuthSession",
        secret:"ThisIsASecretKey",
        resave:false,
        saveUninitialized:false
    })
);

app.engine("handlebars",exphbs.engine({defaultLayout:"main"}));
app.set("view engine","handlebars");

app.get("/",function(req,res){
    res.redirect("/main");
});

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

app.get("/openBids",function(req,res){
    if(!req.session.vendor){
        return res.redirect("/vendorLogin");
    }

    res.render("main/openBids.handlebars",{
        title:"Open Bids",
        topBarStyleSheet:"/css/topBar.css"
    });
});

app.get("/yourBids",function(req,res){
    if(!req.session.vendor){
        return res.redirect("/vendorLogin");
    }

    res.render("main/yourBids.handlebars",{
        title:"Your Bids",
        topBarStyleSheet:"/css/topBar.css"
    });
});

app.get("/adminLogin",function(req,res){
    res.render("main/adminLogin.handlebars",{
        title:"Admin Login",
        topBarStyleSheet:"/css/topBar.css"
    });
});

app.get("/analytics",function(req,res){
    res.render("main/analytics.handlebars",{
        title:"Analytics",
        topBarStyleSheet:"/css/topBar.css"
    });
});

app.listen(3000,function(){
    console.log("Server is running!");
});