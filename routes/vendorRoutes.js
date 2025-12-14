import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import {Router} from "express";

import vendorsData from "../data/vendorsData.js";
import bidsData from "../data/bidsData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.get("/vendorRegister",function(req,res){
    res.render("main/vendorRegister.handlebars",{
        title:"Vendor Register",
        topBarStyleSheet:"/css/topBar.css",
        pageStyleSheet:"/css/vendorLogin.css",
        vendorLoggedIn: req.session.vendor,
        adminLoggedIn: req.session.admin,
    });
});

router.post("/vendorRegister",async function(req,res){
    var businessName = req.body.username;
    var phoneNumber = req.body.password;
    var email = req.body.email || null;

    if(!businessName || !phoneNumber){
        return res.render("main/vendorRegister.handlebars",{
            error:"Missing business name or phone number",
            title:"Vendor Register",
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/vendorLogin.css",
            vendorLoggedIn: req.session.vendor,
            adminLoggedIn: req.session.admin,
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
                pageStyleSheet:"/css/vendorLogin.css",
                vendorLoggedIn: req.session.vendor,
                adminLoggedIn: req.session.admin,
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
            pageStyleSheet:"/css/vendorLogin.css",
            vendorLoggedIn: req.session.vendor,
            adminLoggedIn: req.session.admin,
        });
    }
});

router.get("/vendorLogin",function(req,res){
    res.render("main/vendorLogin.handlebars",{
        topBarStyleSheet:"/css/topBar.css",
        pageStyleSheet:"/css/vendorLogin.css",
        title:"Vendor Login",
        vendorLoggedIn: req.session.vendor,
        adminLoggedIn: req.session.admin,
    });
});

router.post("/vendorLogin",async function(req,res){
    var businessName = req.body.username;
    var phoneNumber = req.body.password;

    if(!businessName || !phoneNumber){
        return res.render("main/vendorLogin.handlebars",{
            error:"Missing business name or phone number",
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/vendorLogin.css",
            title:"Vendor Login",
            vendorLoggedIn: req.session.vendor,
            adminLoggedIn: req.session.admin,
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
            title:"Vendor Login",
            vendorLoggedIn: req.session.vendor,
            adminLoggedIn: req.session.admin,
        });
    } catch(error) {
        console.error("Vendor login error:", error);
        return res.render("main/vendorLogin.handlebars",{
            error:"An error occurred during login",
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/vendorLogin.css",
            title:"Vendor Login",
            vendorLoggedIn: req.session.vendor,
            adminLoggedIn: req.session.admin,
        });
    }
});

router.get("/openBids",function(req,res){
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
        vendorLoggedIn: req.session.vendor,
        adminLoggedIn: req.session.admin,
        contracts:output,
    });
});



router.get("/yourBids",function(req,res){
    var output = bidsData.getBidsByVendor(req.session.vendor);

    res.render("main/yourBids.handlebars",{
        pageStyleSheet:"/css/yourBids.css",
        title:"Your Bids",
        vendorLoggedIn: req.session.vendor,
        adminLoggedIn: req.session.admin,
        contracts:output,
    });
});

router.get("/submitBid/:contractName",function(req,res){
    res.render("main/submitBids.handlebars",{
        title:"Submit Bid",
        vendorLoggedIn: req.session.vendor,
        adminLoggedIn: req.session.admin,
        contractName:req.params.contractName
    });

});

router.post("/submitBid/:contractName",function(req,res){
    var bidAmount = req.body.bidAmount;
    if(!bidAmount){
        return res.redirect("/openBids");
    }

    bidsData.addBid(req.session.vendor,req.params.contractName,bidAmount);
    return res.redirect("/yourBids");
});


router.post("/withdrawBid",function(req,res){
    bidsData.withdrawBid(req.session.vendor,req.body.contractName);
    return res.redirect("/yourBids");
});

router.get("/ratingSystem", (req, res) => { // optional
    res.redirect("/main");
})

router.get("/vendorLogout", (req, res) => {
    if (req.session.vendor) {
        req.session.destroy();
    }

    res.redirect("/main");
})

export default router;