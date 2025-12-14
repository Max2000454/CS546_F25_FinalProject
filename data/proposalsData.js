import { MongoClient, ObjectId } from "mongodb";

import { proposals } from "../database_setup/mongoCollections.js";
import validationFunctions from "../helpers/validate.js";

/*
{ 
_id : ObjectId(...),
title : String,
posted_by : String,
date_posted : Date,
due_date : Date,
description : String,
budget : int,
bids : [bid1, bid2, bid3, ...],

status : String (awarded / open)
highestBid : int
imgSrc : String
}
*/

var bids = [];
var awardedBids = [];
var openBids = [];

const addOpenBid = function(contractName,highestBid,expirationDate,description,imgSrc){
    var output = {
        name:String(contractName),
        highestBid:String(highestBid),
        expirationDate:String(expirationDate),
        description:String(description),
        imgSrc:imgSrc ? String(imgSrc) : ""
    };

    for(var x=0;x<openBids.length;x++){
        if(openBids[x].name === output.name){
            openBids[x] = output;
            return output;
        }
    }

    openBids.push(output);
    return output;
};

const removeOpenBid = function(contractName){
    var output = false;
    for(var x=0;x<openBids.length;x++){
        if(openBids[x].name === contractName){
            openBids.splice(x,1);
            output = true;
            break;
        }
    }
    return output;
};

var getAllOpenBids = function(){
    var output = [];
    for(var x=0;x<openBids.length;x++){
        output.push(openBids[x]);
    }
    return output;
};




var addBid = function(vendorName, contractName, bidAmount){
    var output = {
        vendorName:vendorName,
        contractName:contractName,
        bidAmount:String(bidAmount),
        status:"Pending",
        isPending:true
    };
    bids.push(output);
    return output;
};

var getBidsByVendor = function(vendorName){
    var output = [];
    for(var x=0;x<bids.length;x++){
        if(bids[x].vendorName === vendorName){
            var bidCopy = {
                name:bids[x].contractName,
                contractName:bids[x].contractName,
                highestBid:bids[x].bidAmount,
                yourBid:bids[x].bidAmount,
                expirationDate:"",
                status:bids[x].status,
                ongoing:(bids[x].status === "Pending"),
                isPending:(bids[x].status === "Pending"),
                vendorName:bids[x].vendorName,
                bidAmount:bids[x].bidAmount
            };
            output.push(bidCopy);
        }
    }
    return output;
};

var getAllBids = function(){
    var output = [];
    for(var x=0;x<bids.length;x++){
        var bidCopy = {
            vendorName:bids[x].vendorName,
            contractName:bids[x].contractName,
            bidAmount:bids[x].bidAmount,
            status:bids[x].status,
            isPending:(bids[x].status === "Pending")
        };
        output.push(bidCopy);
    }
    return output;
};

var withdrawBid = function(vendorName, contractName){
    var output = false;
    for(var x=0;x<bids.length;x++){
        if(bids[x].vendorName === vendorName && bids[x].contractName === contractName && bids[x].status === "Pending"){
            bids.splice(x,1);
            output = true;
            break;
        }
    }
    return output;
};

var awardBid = function(contractName, vendorName){
    var output = null;

    for(var x=0;x<bids.length;x++){
        if(bids[x].contractName === contractName && bids[x].vendorName === vendorName){
            bids[x].status = "Awarded";
            bids[x].isPending = false;

            var awardedContract = {
                name:contractName,
                awardee:vendorName,
                amount:bids[x].bidAmount,
                date:(new Date()).toLocaleDateString(),
                description:"Awarded contract",
                contractName:contractName,
                vendorName:vendorName,
                bidAmount:bids[x].bidAmount
            };

            awardedBids.push(awardedContract);
            output = awardedContract;

            removeOpenBid(contractName);
            break;
        }
    }

    return output;
};

var getAwardedBids = function(){
    var output = [];
    for(var x=0;x<awardedBids.length;x++){
        output.push(awardedBids[x]);
    }
    return output;
};

var getAnalytics = function(){
    var totalBidAmount = 0;

    for(var x=0;x<bids.length;x++){
        var numericBid = Number(bids[x].bidAmount);
        if(!isNaN(numericBid)){
            totalBidAmount = totalBidAmount + numericBid;
        }
    }

    var output = {
        totalBids:bids.length,
        averageBid:(bids.length > 0 ? (totalBidAmount / bids.length) : 0)
    };

    return output;
};

var getHighestBidForContract = function(contractName){
    var output = null;

    for(var x=0;x<bids.length;x++){
        if(bids[x].contractName === contractName){
            var numericBid = Number(bids[x].bidAmount);
            if(isNaN(numericBid)){
                numericBid = 0;
            }

            if(output === null || numericBid > output){
                output = numericBid;
            }
        }
    }

    return output;
};

export default {
    addOpenBid,
    removeOpenBid,
    getAllOpenBids,
    addBid,
    getBidsByVendor,
    getAllBids,
    withdrawBid,
    awardBid,
    getAwardedBids,
    getAnalytics,
    getHighestBidForContract
};
