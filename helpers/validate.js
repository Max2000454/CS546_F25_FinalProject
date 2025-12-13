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

function check_integer(int) {
    if (typeof int !== 'number' || !Number.isInteger(int)) {
        throw new Error('Input must be an integer');
    }
    return int;
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
        const first = check_string(first_name);
        if (first.length < 2 || first.length > 20){
            throw new Error('First name must be between 2 and 20 characters long');
        }
        const last = check_string(last_name);
        if (last.length < 2 || last.length > 20){
            throw new Error('Last name must be between 2 and 20 characters long');
        }

        return {first_name: first, last_name: last};
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

export default {check_string, check_integer, validate_id, validate_name, validate_email, validate_password, validate_date};