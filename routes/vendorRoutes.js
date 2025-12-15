import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import {Router} from "express";

import userData from "../data/userData.js";
import proposalsData from "../data/proposalsData.js";
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

router.post("/vendorRegister", async function(req,res){
    let username = req.body.username;
    let password = req.body.password;

    if(!username || !password){
        return res.render("main/vendorRegister.handlebars",{
            error:"Missing username or password",
            title:"Vendor Register",
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/vendorLogin.css",
            vendorLoggedIn: req.session.vendor,
            adminLoggedIn: req.session.admin,
        });
    }

    try {
        // check if user already exists
        const userExists = await userData.checkUserExists(username);
        if(userExists){
            return res.render("main/vendorRegister.handlebars",{
                error:`account with username ${username} already exists`,
                title:"Vendor Register",
                topBarStyleSheet:"/css/topBar.css",
                pageStyleSheet:"/css/vendorLogin.css",
                vendorLoggedIn: req.session.vendor,
                adminLoggedIn: req.session.admin,
            });
        }

        // register new user
        await userData.insertUser(username, password, "vendor");
        req.session.vendor = username;
        return res.redirect("/openBids");
        
    } catch(error) {
        console.error("Vendor registration error:", error);
        return res.render("main/vendorRegister.handlebars",{
            error:`Error: ${error}`,
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
    var username = req.body.username;
    var password = req.body.password;

    if(!username || !password){
        return res.render("main/vendorLogin.handlebars",{
            error:"Missing username or password",
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/vendorLogin.css",
            title:"Vendor Login",
            vendorLoggedIn: req.session.vendor,
            adminLoggedIn: req.session.admin,
        });
    }

    try {
        const userDocument = await userData.validateUserLogin(username, password, "vendor");

        if(userDocument){
            req.session.vendor = username;
            return res.redirect("/openBids");
        }

        return res.render("main/vendorLogin.handlebars",{
            error:"Invalid username or password",
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/vendorLogin.css",
            title:"Vendor Login",
            vendorLoggedIn: req.session.vendor,
            adminLoggedIn: req.session.admin,
        });
        
    } catch(error) {
        console.error("Vendor login error:", error);
        return res.render("main/vendorLogin.handlebars",{
            error:`Error: ${error}`,
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/vendorLogin.css",
            title:"Vendor Login",
            vendorLoggedIn: req.session.vendor,
            adminLoggedIn: req.session.admin,
        });
    }
});

router.get("/openBids", async function(req,res){
    let message = req.query.message;
    let openProposals = await proposalsData.getOpenProposals();

    res.render("main/openBids.handlebars",{
        pageStyleSheet:"/css/openBids.css",
        title:"Open Bids",
        vendorLoggedIn: req.session.vendor,
        contracts:openProposals,
        error:message,
    });
});



router.get("/yourBids", async function(req,res){
    let message = req.query.message;
    let vendor_username = req.session.vendor;
    let user_obj = await userData.getUserByUsername(vendor_username);
    let list_of_bid_ids = user_obj["open_bids"];

    let vendor_bids = [];
    for (let id of list_of_bid_ids) {
        let bid_obj = await bidsData.GetBidById(id);
        let prop_obj = await proposalsData.getProposalById(bid_obj["proposal_id"]);
        let ongoing = false;
        if (prop_obj["status"] === "open") ongoing = true;
        vendor_bids.push({...bid_obj, ...prop_obj, ongoing: ongoing});
    }

    res.render("main/yourBids.handlebars",{
        pageStyleSheet:"/css/yourBids.css",
        title:"Your Bids",
        vendorLoggedIn: req.session.vendor,
        adminLoggedIn: req.session.admin,
        contracts:vendor_bids,
        error:message,
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

router.post("/submitBid/:contractName", async function(req,res){
    // check that user submitted amount for bid
    let bidAmount = req.body.bidAmount;
    if(!bidAmount){
        return res.redirect("/openBids");
    }

    try {
        let user_obj = await userData.getUserByUsername(req.session.vendor);
        let prop_obj = await proposalsData.getProposalByTitle(req.params.contractName);
        await bidsData.InsertBid(String(user_obj._id), String(prop_obj._id), bidAmount, Date());
    } catch(e) {
        res.redirect(`/yourBids?message=Failed%20to%20make%20proposal%20${e}`);
    }

    return res.redirect("/yourBids?message=Success%20posting%20bid");
});


router.post("/withdrawBid", async function(req,res){
    try {
        let user_obj = await userData.getUserByUsername(req.session.vendor);
        let prop_obj = await proposalsData.getProposalByTitle(req.body.contractName);
        await bidsData.RemoveBidByUserProposalID(String(user_obj._id), String(prop_obj._id));
    } catch(e) {
        res.redirect("/yourBids?message=failed%20to%20remove%20your%20bid");
    }

    return res.redirect("/yourBids?message=bid%20sucessfully%20removed");
});



router.get("/vendorLogout", (req, res) => {
    if (req.session.vendor) {
        req.session.destroy();
    }

    res.redirect("/main");
})

export default router;