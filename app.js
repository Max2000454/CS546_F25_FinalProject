import vendorsData from "./data/vendorsData.js";
import { closeConnection } from "./database_setup/mongoConnection.js";
import bidsData from "./data/bidsData.js";

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
    var output = bidsData.getAwardedBids();

    res.render("main/awardedContracts.handlebars",{
        topBarStyleSheet:"/css/topBar.css",
        pageStyleSheet:"/css/awardedContracts.css",
        title:"Awarded Contracts",
        contracts:output
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

app.get("/openBids",function(req,res){
    if(!req.session.vendor){
        return res.redirect("/vendorLogin");
    }

    var openBids = bidsData.getAllOpenBids();
    var output = [];

    for(var x=0;x<openBids.length;x++){
        var highestBidValue = bidsData.getHighestBidForContract(openBids[x].name);

        var bestBid = Number(openBids[x].highestBid);
        if(highestBidValue !== null && highestBidValue > bestBid){
            bestBid = highestBidValue;
        }

        output.push({
            name:openBids[x].name,
            highestBid:String(bestBid),
            expirationDate:openBids[x].expirationDate,
            description:openBids[x].description,
            imgSrc:openBids[x].imgSrc
        });
    }

    res.render("main/openBids.handlebars",{
        pageStyleSheet:"/css/openBids.css",
        title:"Open Bids",
        contracts:output
    });
});



app.get("/yourBids",function(req,res){
    if(!req.session.vendor){
        return res.redirect("/vendorLogin");
    }

    var output = bidsData.getBidsByVendor(req.session.vendor);

    res.render("main/yourBids.handlebars",{
        pageStyleSheet:"/css/yourBids.css",
        title:"Your Bids",
        contracts:output
    });
});




app.get("/submitBid/:contractName",function(req,res){
    if(!req.session.vendor){
        return res.redirect("/vendorLogin");
    }

    res.render("main/submitBids.handlebars",{
        title:"Submit Bid",
        contractName:req.params.contractName
    });

});

app.post("/submitBid/:contractName",function(req,res){
    if(!req.session.vendor){
        return res.redirect("/vendorLogin");
    }

    var bidAmount = req.body.bidAmount;
    if(!bidAmount){
        return res.redirect("/openBids");
    }

    bidsData.addBid(req.session.vendor,req.params.contractName,bidAmount);
    return res.redirect("/yourBids");

});


app.post("/withdrawBid",function(req,res){
    if(!req.session.vendor){
        return res.redirect("/vendorLogin");
    }

    bidsData.withdrawBid(req.session.vendor,req.body.contractName);
    return res.redirect("/yourBids");
});

app.get("/ratingSystem", (req, res) => { // optional
    res.redirect("/main");
})

// ADMIN ROUTES:
app.get("/adminLogin",function(req,res){
    res.render("main/adminLogin.handlebars",{
        pageStyleSheet:"/css/adminLogin.css",
        title:"Admin Login"
    });
});

app.post("/adminLogin",function(req,res){
    if(req.body.username === "admin" && req.body.password === "admin"){
        req.session.admin = true;
        return res.redirect("/biddingPortal");
    }

    return res.redirect("/adminLogin");
});
app.post("/adminCreateOpenBid",function(req,res){
    if(!req.session.admin){
        return res.redirect("/adminLogin");
    }

    var contractName = req.body.contractName;
    var highestBid = req.body.highestBid;
    var expirationDate = req.body.expirationDate;
    var description = req.body.description;
    var imgSrc = req.body.imgSrc || "";

    if(!contractName || !highestBid || !expirationDate || !description){
        return res.redirect("/biddingPortal");
    }

    bidsData.addOpenBid(contractName,highestBid,expirationDate,description,imgSrc);
    return res.redirect("/biddingPortal");
});

app.post("/adminDeleteOpenBid",function(req,res){
    if(!req.session.admin){
        return res.redirect("/adminLogin");
    }

    bidsData.removeOpenBid(req.body.contractName);
    return res.redirect("/biddingPortal");
});

app.get("/biddingPortal",function(req,res){
    if(!req.session.admin){
        return res.redirect("/adminLogin");
    }

    res.render("main/biddingPortal.handlebars",{
        title:"Admin Bidding Portal",
        bids:bidsData.getAllBids(),
        openBids:bidsData.getAllOpenBids()
    });
});


app.post("/awardBid",function(req,res){
    if(!req.session.admin){
        return res.redirect("/adminLogin");
    }

    bidsData.awardBid(req.body.contractName,req.body.vendorName);
    return res.redirect("/biddingPortal");
});

app.get("/analytics",function(req,res){
    var output = bidsData.getAnalytics();

    res.render("main/analytics.handlebars",{
        title:"Analytics",
        analytics:output
    });
});

app.get("/questions", (req, res) => { // optional
    res.redirect("/main");
})

// run app
app.listen(3000, () => {
    console.log("Server is running!");
})
