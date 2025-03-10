import express from 'express';
import { AdminLogin, AdminRegister } from '../controllers/admin-controller.js';
import admin_auth from '../middlewares/admin-middleware.js';
import genericRoutes from './mongoose-generic-routes.js';
import BestOffer from '../model/BestOffer.js';
import PopularDestination from '../model/PopularDestination.js';
import Banner from '../model/Banner.js';
import FeaturedProperty from '../model/FeaturedProperty.js';
const router = express.Router()

//all public routes go here
router.post('/auth/login', AdminLogin);
router.post('/auth/register', AdminRegister);
router.use("/db", genericRoutes)


router.use(admin_auth);
router.get('/init-db', async (req, res) => {
    try{
        const item = {
            title: "Init"
        }

        await BestOffer.create(item);
        await BestOffer.deleteMany({title:"Init"});
        await PopularDestination.create(item);
        await PopularDestination.deleteMany({title:"Init"});
        await FeaturedProperty.create(item);
        await FeaturedProperty.deleteMany({title:"Init"});
        await Banner.create(item);
        await Banner.deleteMany({title:"Init"});

    }catch(err){
        res.status(500).json({error:err.message});
    }
})
//all protected routes go here

export default router;