import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import {Router} from "express";
import { openConnection } from "../database_setup/mongoConnection.js";
import vendorsData from "../data/vendorsData.js";
import userData from "../data/userData.js";
import proposalsData from "../data/proposalsData.js";
import { proposals } from "../database_setup/mongoCollections.js";
import validationFunctions from "../helpers/validate.js";

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

router.post("/adminCreateOpenBid", async function(req,res){
    let title = req.body.contractName;
    let budget = req.body.highestBid;
    let due_date = req.body.expirationDate;
    let description = req.body.description;
    let imgSrc = req.body.imgSrc || "";

    if(!title || !budget || !due_date || !description){
        return res.redirect("/biddingPortal");
    }

    // validation
    title = validationFunctions.check_string(title);
    budget = validationFunctions.check_number(budget);
    due_date = validationFunctions.validate_date(due_date);
    description = validationFunctions.check_string(description);
    if (imgSrc !== null && imgSrc !== "") {
        console.log(imgSrc);
        imgSrc = validationFunctions.validate_image_link(imgSrc);
    }

    // get userid from session username
    let user = await userData.getUserByUsername(req.session.admin);

    // insert proposal
    try {
        await proposalsData.insertProposal(title, due_date, description, budget, imgSrc, String(user._id));
    } catch(e) {
        console.log(e);
        return res.redirect("/biddingPortal");
    }

     return res.redirect("/biddingPortal");
});

router.post("/adminDeleteOpenBid",async function(req,res){
    try {
        await proposalsData.removeProposalByTitle(req.body.contractName);
    } catch(e) {
        console.log(e);
        return res.redirect("/biddingPortal");
    }
    return res.redirect("/biddingPortal");
});

router.get("/biddingPortal", async function(req,res){
    let allProposals = await proposalsData.getAllProposals();
    let allOpenProposals = await proposalsData.getOpenProposals();

    res.render("main/biddingPortal.handlebars",{
        pageStyleSheet: "/css/biddingPortal.css",
        title:"Admin Bidding Portal",
        vendorLoggedIn: req.session.vendor,
        adminLoggedIn: req.session.admin,
        openBids: allOpenProposals
    });
});

router.post("/awardBid",function(req,res){
    //bidsData.awardBid(req.body.contractName,req.body.vendorName);
    //return res.redirect("/biddingPortal");
});

router.get("/analytics",function(req,res){
    //var output = bidsData.getAnalytics();

    res.render("main/analytics.handlebars",{
        title:"Analytics",
        vendorLoggedIn: req.session.vendor,
        adminLoggedIn: req.session.admin,
        //analytics:output
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