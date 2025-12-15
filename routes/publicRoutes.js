import path from "path";
import { fileURLToPath } from "url";
import {Router} from "express";
import { openConnection } from "../database_setup/mongoConnection.js";

import proposalsDataFunctions from "../data/proposalsData.js";
import userDataFunctions from "../data/userData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.get("/", (req, res) => {
    res.redirect("/main");
})

router.get("/main",function(req,res){
    let message = req.query.message;

    res.render("main/mainPage.handlebars",{
        topBarStyleSheet:"/css/topBar.css",
        pageStyleSheet:"/css/mainPage.css",
        title:"Main Page",
        vendorLoggedIn: req.session.vendor,
        adminLoggedIn: req.session.admin,
        onMainPage: true,
        error: message,
    });
});

router.get("/awardedContracts", async function(req,res){
    let output = await proposalsDataFunctions.getAwardedProposals();
    
    res.render("main/awardedContracts.handlebars",{
        topBarStyleSheet:"/css/topBar.css",
        pageStyleSheet:"/css/awardedContracts.css",
        title:"Awarded Contracts",
        vendorLoggedIn: req.session.vendor,
        adminLoggedIn: req.session.admin,
        contracts:output
    });
});

router.get("/feedback", (req, res) => {
  let message = req.query.message; 
  let success = req.query.success;
  res.render("main/feedback.handlebars", {
    topBarStyleSheet: "/css/topBar.css",
    pageStyleSheet: "/css/feedback.css",
    title: "Feedback",
    vendorLoggedIn: req.session.vendor,
    adminLoggedIn: req.session.admin,
    error: message,
    success: success
  });
});

router.post("/feedback", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.redirect("/feedback?message=Message%20is%20required");
    }
    
    const db = await openConnection();
    const feedbackCollection = db.collection('feedback');
    
    await feedbackCollection.insertOne({
      message: message.trim(),
    });
    
    console.log('Feedback saved to database');
    
    res.redirect("/feedback?success=Thank%20you%20for%20your%20feedback!");
    
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.redirect("/feedback?message=Error%20submitting%20feedback.%20Please%20try%20again.");
  }
});


export default router;

