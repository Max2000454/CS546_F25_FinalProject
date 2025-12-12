import insertDataFunctions from "./data/usersData.js";
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

var localVendors = [];

var initializeLocalVendors = async function(){
    var hashedPassword = await bcrypt.hash("password123",10);
    localVendors.push({
        username:"vendor1",
        hashedPassword:hashedPassword
    });
};

await initializeLocalVendors();

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
    var username = req.body.username;
    var password = req.body.password;
    var output = "";

    if(!username || !password){
        output = "Missing username or password";
        return res.render("main/vendorRegister.handlebars",{
            error:output,
            title:"Vendor Register",
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/vendorLogin.css"
        });
    }

    for(var x=0;x<localVendors.length;x++){
        if(localVendors[x].username === username){
            output = "Username already exists";
            return res.render("main/vendorRegister.handlebars",{
                error:output,
                title:"Vendor Register",
                topBarStyleSheet:"/css/topBar.css",
                pageStyleSheet:"/css/vendorLogin.css"
            });
        }
    }

    var hashedPassword = await bcrypt.hash(password,10);

    localVendors.push({
        username:username,
        hashedPassword:hashedPassword
    });

    req.session.vendor = username;
    return res.redirect("/openBids");
});

app.get("/vendorLogin",function(req,res){
    res.render("main/vendorLogin.handlebars",{
        topBarStyleSheet:"/css/topBar.css",
        pageStyleSheet:"/css/vendorLogin.css",
        title:"Vendor Login"
    });
});

app.post("/vendorLogin",async function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var output = false;

    if(!username || !password){
        output = "Missing username or password";
        return res.render("main/vendorLogin.handlebars",{
            error:output,
            topBarStyleSheet:"/css/topBar.css",
            pageStyleSheet:"/css/vendorLogin.css",
            title:"Vendor Login"
        });
    }

    for(var x=0;x<localVendors.length;x++){
        if(localVendors[x].username === username){
            var passwordMatch = await bcrypt.compare(password,localVendors[x].hashedPassword);
            if(passwordMatch){
                req.session.vendor = username;
                output = true;
                break;
            }
        }
    }

    if(output === true){
        return res.redirect("/openBids");
    }

    output = "Invalid username or password";
    return res.render("main/vendorLogin.handlebars",{
        error:output,
        topBarStyleSheet:"/css/topBar.css",
        pageStyleSheet:"/css/vendorLogin.css",
        title:"Vendor Login"
    });
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