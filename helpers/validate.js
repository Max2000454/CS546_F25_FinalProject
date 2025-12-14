// ANY IMPORTS HERE
import { ObjectId } from "mongodb";

// NEED SOMEONE TO IMPLEMENT AND TEST THESE. SHOULDN'T TAKE MORE THAN 1-2 HOURS

// ---------------------

// Returns trimmed validated string
function check_string(str) {
    if (typeof str !== 'string' || str.trim().length === 0) {
        throw new Error('Input must be a string');
    }
    const trimmed = str.trim();
    return trimmed;
}

function check_number(num) {
    num = Number(num);
    if (typeof num !== "number" || num === NaN) {
        throw new Error('Input must be an integer');
    }
    return num.toFixed(2);
}

// ---------------------

function validate_id(id) {
    try{
        const trimmed_id = check_string(id);

        if (!ObjectId.isValid(trimmed_id)) {
        throw new Error("Invalid user_id format. Must be a valid MongoDB ObjectId.");
        }
        return trimmed_id; 
    }
    catch(e){
        console.error("validate_id error: ", e);
        throw e;
    }

}

function validate_name(first_name, last_name) {
    try{
        let first = check_string(first_name);
        if (first.length < 2 || first.length > 20){
            throw new Error('First name must be between 2 and 20 characters long');
        }
        let last = check_string(last_name);
        if (last.length < 2 || last.length > 20){
            throw new Error('Last name must be between 2 and 20 characters long');
        }

        return {first_name: first.trim(), last_name: last.trim()};
    }
    catch(e){
        console.error("validate_name error: ", e);
        throw e;
    }
}

function validate_email(email_address) {
    try{
        const email = check_string(email_address);

        // email should match format 'a@b.c'
        const pattern = /\S+@\S+\.\S+/;
        if (!pattern.test(email)){
            throw new Error('Invalid email format');
        }

        return email;
    }
    catch(e){
        console.error("validate_email error: ", e);
        throw e;
    }
}

function validate_username(username) {
    try {
        const uname = check_string(username).trim();

        // length between 3 and 20
        if (uname.length < 3) {
            throw new Error('Username must be at least 3 characters long');
        }
        if (uname.length > 20) {
            throw new Error('Username must be at most 20 characters long');
        }

        // allowed characters: letters, numbers, underscores
        const validChars = /^[A-Za-z0-9_]+$/;
        if (!validChars.test(uname)) {
            throw new Error('Username may only contain letters, numbers, and underscores');
        }

        // must start with a letter
        if (!/^[A-Za-z]/.test(uname)) {
            throw new Error('Username must start with a letter');
        }

        // no consecutive underscores
        if (/__/.test(uname)) {
            throw new Error('Username may not contain consecutive underscores');
        }

        return uname;
    }
    catch (e) {
        console.error("validate_username error:", e);
        throw e;
    }
}

function validate_password(password) {
    try{
        const pswd = check_string(password);

        // length between 8 and 30
        if (pswd.length < 8){
            throw new Error('Password must be at least 8 characters long');
        }
        if (pswd.length > 30){
            throw new Error('Password must be at most 30 characters long');
        }

        // at least one uppercase, one lowercase, one digit, one special character
        const uppercase = /[A-Z]/;
        const lowercase = /[a-z]/;
        const digit = /[0-9]/;
        const specialChar = /[!@#$%^&*(),.?":{}|<>]/;
        if (!uppercase.test(pswd)){
            throw new Error('Password must contain at least one uppercase letter');
        }
        if (!lowercase.test(pswd)){
            throw new Error('Password must contain at least one lowercase letter');
        }
        if (!digit.test(pswd)){
            throw new Error('Password must contain at least one digit');
        }
        if (!specialChar.test(pswd)){
            throw new Error('Password must contain at least one special character');
        }

        return pswd;    
    }
    catch(e){
        console.error("validate_password error: ", e);
        throw e;
    }
}

function validate_date(input_date) {
    try{
        const date = new Date(input_date);
        if (isNaN(date.getTime())){
            throw new Error('Invalid date format');
        }
        const now = new Date();
        if (date < now){
            throw new Error('Dates must be in the future');
        }

        return date;
    }
    catch(e){
        console.error("validate_date error: ", e);
        throw e;
    }
}

function validate_image_link(src) {
    try {
        if (!src || typeof src !== "string") {
            throw new Error("Image link must be a string");
        }

        const url = new URL(src);

        if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error("Image link must use http or https");
        }

        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
        if (!imageExtensions.test(url.pathname)) {
            throw new Error("URL does not point to a supported image type");
        }

        return url.toString();
    } catch (e) {
        console.error("validate_image_link error:", e);
        throw e;
    }
}

export default {check_string, check_number, validate_id, validate_name, validate_email, validate_password, validate_date, validate_username, validate_image_link};