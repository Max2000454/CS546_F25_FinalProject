import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import {Router} from "express";
import { openConnection } from "../database_setup/mongoConnection.js";
import vendorsData from "../data/vendorsData.js";
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

router.post("/adminLogin",function(req,res){
    if(req.body.username === "admin" && req.body.password === "admin"){
        req.session.admin = true;
        return res.redirect("/biddingPortal");
    }

    return res.redirect("/adminLogin");
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

router.get("/adminFeedback", async (req, res) => {
  try {
    const db = await openConnection();
    const feedbackCollection = db.collection('feedback');
    const allFeedback = await feedbackCollection.find({}).toArray();
    
    res.render("main/adminFeedback.handlebars", {
      title: "Admin Feedback Portal",
      pageStyleSheet: "/css/adminFeedback.css",
      vendorLoggedIn: req.session.vendor,
      adminLoggedIn: req.session.admin,
      feedbackList: allFeedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.redirect("/biddingPortal?message=Error%20loading%20feedback");
  }
});

router.get("/adminLogout", (req, res) => {
    if (req.session.admin) {
        req.session.destroy();
    }

    res.redirect("/main");
})

export default router;