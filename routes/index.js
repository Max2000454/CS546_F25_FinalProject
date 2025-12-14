import publicRoutes from "./publicRoutes.js";
import vendorRoutes from "./vendorRoutes.js";
import adminRoutes from "./adminRoutes.js";

const routesSetupMethod = (app) => {
    app.use('/', publicRoutes);
    app.use('/', vendorRoutes);
    app.use('/', adminRoutes);
}

export default routesSetupMethod;