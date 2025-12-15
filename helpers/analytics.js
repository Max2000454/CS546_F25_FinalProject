import { bids, proposals, users } from "../database_setup/mongoCollections.js";

const getAnalytics = async () => {
    const bidsCollection = await bids();
    const proposalsCollection = await proposals();
    const usersCollection = await users();

    const totalUsers = await usersCollection.countDocuments();
    const totalProposals = await proposalsCollection.countDocuments();
    const totalBids = await bidsCollection.countDocuments();

    const openProposals = await proposalsCollection.countDocuments({ status: "open" });
    const awardedProposals = await proposalsCollection.countDocuments({ status: "awarded" });

    const bidStats = await bidsCollection.aggregate([{$group: { _id: null,
        avgBid: { $avg: "$amount" },
        minBid: { $min: "$amount" },
        maxBid: { $max: "$amount" }
    }}]).toArray();

    const averageBid = bidStats[0].avgBid.toFixed(2);
    const minBid = bidStats[0].minBid;
    const maxBid = bidStats[0].maxBid;

    return {
        totalUsers : totalUsers,
        totalProposals : totalProposals,
        totalBids : totalBids,
        averageBid : averageBid,
        minBid : minBid,
        maxBid : maxBid,
        openProposals : openProposals,
        awardedProposals : awardedProposals,
    };
};

export default {
    getAnalytics
};
