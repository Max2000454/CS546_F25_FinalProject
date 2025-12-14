import path from "path";
import { fileURLToPath } from "url";
import {Router} from "express";

import bidsData from "../data/bidsData.js";

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

router.get("/awardedContracts",function(req,res){
    var output = bidsData.getAwardedBids();

    res.render("main/awardedContracts.handlebars",{
        topBarStyleSheet:"/css/topBar.css",
        pageStyleSheet:"/css/awardedContracts.css",
        title:"Awarded Contracts",
        vendorLoggedIn: req.session.vendor,
        adminLoggedIn: req.session.admin,
        contracts:output
    });
});

export default router;

