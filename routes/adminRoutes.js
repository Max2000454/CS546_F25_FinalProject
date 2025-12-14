import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import {Router} from "express";

import userData from "../data/userData.js";
import bidsData from "../data/bidsData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// ADMIN ROUTES:
router.get("/adminLogin",function(req,res){
    res.render("main/adminLogin.handlebars",{
        pageStyleSheet:"/css/adminLogin.css",
        title:"Admin Login",
        vendorLoggedIn: req.session.vendor,
        adminLoggedIn: req.session.admin,
    });
});

router.post("/adminLogin",async function(req,res){
    let username = req.body.username;
    let password = req.body.password;

    if(!username || !password){
        return res.render("main/adminLogin.handlebars",{
            error:"Missing username or password",
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/adminLogin.css",
            title:"Admin Login",
        });
    }

    try {
        const userDocument = await userData.validateUserLogin(username, password, "admin");

        if(userDocument && userDocument.accountType && userDocument.accountType == "admin"){
            req.session.admin = username;
            return res.redirect("/biddingPortal");
        }

        return res.render("main/adminLogin.handlebars",{
            error:"Invalid username or password",
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/adminLogin.css",
            title:"Admin Login",
        });
        
    } catch(error) {
        console.error("Admin login error:", error);
        return res.render("main/adminLogin.handlebars",{
            error:`Error: ${error}`,
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/adminLogin.css",
            title:"Admin Login",
        })
    }
});

router.post("/adminCreateOpenBid",function(req,res){
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

router.post("/adminDeleteOpenBid",function(req,res){
    bidsData.removeOpenBid(req.body.contractName);
    return res.redirect("/biddingPortal");
});

router.get("/biddingPortal",function(req,res){
    res.render("main/biddingPortal.handlebars",{
        title:"Admin Bidding Portal",
        vendorLoggedIn: req.session.vendor,
        adminLoggedIn: req.session.admin,
        bids:bidsData.getAllBids(),
        openBids:bidsData.getAllOpenBids()
    });
});

router.post("/awardBid",function(req,res){
    bidsData.awardBid(req.body.contractName,req.body.vendorName);
    return res.redirect("/biddingPortal");
});

router.get("/analytics",function(req,res){
    var output = bidsData.getAnalytics();

    res.render("main/analytics.handlebars",{
        title:"Analytics",
        vendorLoggedIn: req.session.vendor,
        adminLoggedIn: req.session.admin,
        analytics:output
    });
});

router.get("/questions", (req, res) => { // optional
    res.redirect("/main");
})

router.get("/adminLogout", (req, res) => {
    if (req.session.admin) {
        req.session.destroy();
    }

    res.redirect("/main");
})

export default router;