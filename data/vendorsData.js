import { vendors } from "../database_setup/mongoCollections.js";
import bcrypt from "bcrypt";

const JERSEY_CITY_API_URL = "https://data.jerseycitynj.gov/api/explore/v2.1/catalog/datasets/vendors-directory/records";

/*
INPUT:
- businessName : String
OUTPUT:
- vendorData : Object or null
Checks if a vendor exists in the Jersey City API by business name
*/
const checkVendorInAPI = async (businessName) => {
    try {
        // Search for vendor by business name in the API
        const searchQuery = encodeURIComponent(businessName);
        const url = `${JERSEY_CITY_API_URL}?where=business_name='${searchQuery}'&limit=1`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error(`API request failed with status ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            return data.results[0];
        }

        return null;
    } catch (error) {
        console.error("Error checking vendor in API:", error);
        return null;
    }
};

/*
INPUT:
- businessName : String
OUTPUT:
- vendorDocument : Object or null
Gets vendor from local MongoDB database
*/
const getVendorByBusinessName = async (businessName) => {
    if (typeof businessName !== "string" || businessName.trim() === "") {
        throw new Error("Business name must be a non-empty string");
    }

    const vendorsCollection = await vendors();
    const vendorDocument = await vendorsCollection.findOne({ "Business Name": businessName });
    return vendorDocument;
};

/*
INPUT:
- apiVendor : Object (vendor data from Jersey City API)
- phoneNumber : String
OUTPUT:
- vendorDocument : Object
Creates a vendor record in MongoDB from API data
*/
const createVendorFromAPI = async (apiVendor, phoneNumber) => {
    const vendorsCollection = await vendors();

    // Hash the phone number to use as password
    const hashedPassword = await bcrypt.hash(phoneNumber, 10);

    const vendorDocument = {
        "Business Name": apiVendor.business_name,
        "Alternative Business Name": apiVendor.alternative_business_name || null,
        "Contact First Name": apiVendor.contact_first_name || null,
        "Contact Last Name": apiVendor.contact_last_name || null,
        "Primary Phone": apiVendor.primary_phone,
        "Fax Phone": apiVendor.fax_phone || null,
        "Email Address": apiVendor.e_mail_address || null,
        "Business Address 1": apiVendor.business_address_1 || null,
        "Business Address 2": apiVendor.business_address_2 || null,
        "Business City": apiVendor.business_city || null,
        "Business State": apiVendor.business_state || null,
        "Business Zip": apiVendor.business_zip || null,
        "Designation": apiVendor.designation || [],
        "Status": apiVendor.status || null,
        "Gross Sale Revenue": apiVendor.gross_sale_revnue || null,
        "Hashed Password": hashedPassword,
        "Open Bids": [],
        "Awarded Contracts": [],
        "Source": "Jersey City API"
    };

    const insertInfo = await vendorsCollection.insertOne(vendorDocument);

    if (!insertInfo.acknowledged) {
        throw new Error("Failed to insert vendor from API");
    }

    return vendorDocument;
};

/*
INPUT:
- businessName : String (username)
- phoneNumber : String (password)
OUTPUT:
- vendorDocument : Object or null
Validates vendor credentials
- First checks local database
- If not found, checks Jersey City API and creates record if valid
- Returns vendor document if authentication successful
*/
const validateVendorLogin = async (businessName, phoneNumber) => {
    if (!businessName || !phoneNumber) {
        return null;
    }

    // First, check if vendor exists in our database
    let vendorDocument = await getVendorByBusinessName(businessName);

    if (vendorDocument) {
        // vendor exists in database, validate password
        const passwordMatch = await bcrypt.compare(phoneNumber, vendorDocument["Hashed Password"]);

        if (passwordMatch) {
            return vendorDocument;
        }

        return null;
    }

    // vendor not in database, check Jersey City API
    console.log(`Vendor "${businessName}" not found in database, checking API...`);
    const apiVendor = await checkVendorInAPI(businessName);

    if (apiVendor) {
        // Vendor found in API, verify phone number matches
        if (apiVendor.primary_phone === phoneNumber) {
            console.log(`Vendor found in API with matching phone. Creating local record...`);
            // Create vendor record in database
            vendorDocument = await createVendorFromAPI(apiVendor, phoneNumber);
            return vendorDocument;
        } else {
            console.log("Phone number does not match API record");
            return null;
        }
    }

    console.log("Vendor not found in API");
    return null;
};

/*
INPUT:
- businessName : String
- phoneNumber : String
- email : String (optional)
OUTPUT:
- vendorDocument : Object
Registers a new vendor (for vendors not in Jersey City database)
First checks if vendor exists in API - if so, uses API data
If not, creates a self-registered vendor
*/
const registerNewVendor = async (businessName, phoneNumber, email = null) => {
    if (!businessName || !phoneNumber) {
        throw new Error("Business name and phone number are required");
    }

    // Check if vendor already exists in our database
    const existingVendor = await getVendorByBusinessName(businessName);
    if (existingVendor) {
        throw new Error(`Vendor with business name "${businessName}" already exists`);
    }

    // check if vendor exists in API
    console.log(`Checking if "${businessName}" exists in Jersey City API...`);
    const apiVendor = await checkVendorInAPI(businessName);

    if (apiVendor) {
        // vendor exists in API, create record using API data
        console.log("Vendor found in API, creating record with API data...");
        return await createVendorFromAPI(apiVendor, phoneNumber);
    }

    // vendor not in API, create self-registered vendor
    console.log("Vendor not in API, creating self-registered vendor...");
    const vendorsCollection = await vendors();

    const hashedPassword = await bcrypt.hash(phoneNumber, 10);

    const newVendor = {
        "Business Name": businessName,
        "Alternative Business Name": null,
        "Contact First Name": null,
        "Contact Last Name": null,
        "Primary Phone": phoneNumber,
        "Fax Phone": null,
        "Email Address": email,
        "Business Address 1": null,
        "Business Address 2": null,
        "Business City": null,
        "Business State": null,
        "Business Zip": null,
        "Designation": [],
        "Status": "Self-Registered",
        "Gross Sale Revenue": null,
        "Hashed Password": hashedPassword,
        "Open Bids": [],
        "Awarded Contracts": [],
        "Source": "Self-Registration"
    };

    const insertInfo = await vendorsCollection.insertOne(newVendor);

    if (!insertInfo.acknowledged) {
        throw new Error("Failed to insert new vendor");
    }

    return newVendor;
};

/*
INPUT:
- businessName : String
OUTPUT:
- exists : Boolean
*/
const checkVendorExists = async (businessName) => {
    const vendor = await getVendorByBusinessName(businessName);
    return vendor !== null;
};

/*
INPUT: N/A
OUTPUT: Number of vendors in database
*/
const getVendorCount = async () => {
    const vendorsCollection = await vendors();
    return await vendorsCollection.countDocuments();
};

/*
INPUT: N/A
OUTPUT: deletedCount : String
*/
const deleteAllVendors = async () => {
    const vendorsCollection = await vendors();
    const deleteInfo = await vendorsCollection.deleteMany({});
    return `Deleted ${deleteInfo.deletedCount} vendors`;
};

export default {
    checkVendorInAPI,
    getVendorByBusinessName,
    validateVendorLogin,
    registerNewVendor,
    checkVendorExists,
    getVendorCount,
    deleteAllVendors
};
