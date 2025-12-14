import express from "express"
import exphbs from"express-handlebars"
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";

import { closeConnection } from "./database_setup/mongoConnection.js";
import setupRoutesMethod from "./routes/index.js"
import middlewareRoutes from "./middleware.js";

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

//setup authorization/misc. middleware
app.use(middlewareRoutes);

//setup routes
setupRoutesMethod(app);

// run app
app.listen(3000, () => {
    console.log("Server is running!");
})
