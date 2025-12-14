import {Router} from "express";

const router = Router();

// prevent users already logged in from accessing register/login pages
router.use("/vendorRegister", (req, res, next) => {
    if (req.session.vendor || req.session.admin) {
        res.redirect("/main?message=Already%20logged%20into%20account");
    }
    next();
})

router.use("/vendorLogin", (req, res, next) => {
    if (req.session.vendor || req.session.admin) {
        res.redirect("/main?message=Already%20logged%20into%20account");
    }
    next();
})

router.use("/adminLogin", (req, res, next) => {
    if (req.session.vendor || req.session.admin) {
        res.redirect("/main?message=Already%20logged%20into%20account");
    }
    next();
})

// vendor-only pages
router.use("/openBids", (req, res, next) => {
    if (!req.session.vendor) {
        res.redirect("/main?message=Must%20be%20logged%20in%20as%20vendor");
    }
    next();
})

router.use("/yourBids", (req, res, next) => {
    if (!req.session.vendor) {
        res.redirect("/main?message=Must%20be%20logged%20in%20as%20vendor");
    }
    next();
})

router.use("/submitBid/:contractName", (req, res, next) => {
    if (!req.session.vendor) {
        res.redirect("/main?message=Must%20be%20logged%20in%20as%20vendor");
    }
    next();
})

router.use("/withdrawBid", (req, res, next) => {
    if (!req.session.vendor) {
        res.redirect("/main?message=Must%20be%20logged%20in%20as%20vendor");
    }
    next();
})

router.use("/ratingSystem", (req, res, next) => {
    if (!req.session.vendor) {
        res.redirect("/main?message=Must%20be%20logged%20in%20as%20vendor");
    }
    next();
})

// admin-only pages
router.use("/adminCreateOpenBid", (req, res, next) => {
    if (!req.session.admin) {
        res.redirect("/main?message=Must%20be%20logged%20in%20as%admin");
    }
    next();
})

router.use("/adminDeleteOpenBid", (req, res, next) => {
    if (!req.session.admin) {
        res.redirect("/main?message=Must%20be%20logged%20in%20as%admin");
    }
    next();
})

router.use("/biddingPortal", (req, res, next) => {
    if (!req.session.admin) {
        res.redirect("/main?message=Must%20be%20logged%20in%20as%admin");
    }
    next();
})

router.use("/awardBid", (req, res, next) => {
    if (!req.session.admin) {
        res.redirect("/main?message=Must%20be%20logged%20in%20as%admin");
    }
    next();
})

router.use("/analytics", (req, res, next) => {
    if (!req.session.admin) {
        res.redirect("/main?message=Must%20be%20logged%20in%20as%admin");
    }
    next();
})

router.use("/questions", (req, res, next) => {
    if (!req.session.admin) {
        res.redirect("/main?message=Must%20be%20logged%20in%20as%admin");
    }
    next();
})

export default router;