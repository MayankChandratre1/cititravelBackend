import express from 'express';
import SabreAPI from '../config/sabre.config.js';

const sabre = new SabreAPI();

const router = express.Router()



router.get('/test', async (req, res) => {
    try {
        const flights = await sabre.testToken();
        res.json(flights);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/flights/search', async (req, res) => {
    try {
        const flights = await sabre.searchFlights({
            ...req.body
        });
        res.json(flights);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/auth', async (req, res) => {
    try {
        const token = await sabre.authenticate()
        res.json(token);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/airports', async (req, res) => {
    try {
        const query = req.query.query;
        const result = await sabre.searchAirport({query})
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/airlines', async (req, res) => {
    try {
        const airlines = await sabre.getAirlines(req.query);
        res.json(airlines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.post('/geocodes', async (req, res) => {
    const { codes, type } = req.body;
    const GeoCodeRequest = codes.map(code => (
        {
            GeoCodeRQ: {
                PlaceById: {
                    Id: code,
                    BrowseCategory: {name: type}
                },
                ResultSetConfig: {
                    maxResults: 1
                }
            }
        }
    ));
    try {
        const result = await sabre.getGeocodes({GeoCodeRequest});
        res.json(result);
    } catch (error) {
        
        res.status(500).json({ error: error.message });
    }
})


router.post('/revalidate', async (req, res) => {
    const data = req.body;
    try {
        const result = await sabre.revalidateItinerary(data);
        res.json(result);
    } catch (error) {
        
        res.status(500).json({ error: error.message });
    }
})

router.post('/createpnr', async (req, res) => {
    const data = req.body;
    try {
        const result = await sabre.createPNR(data.flightDetails, data.passengerDetails);
        res.json(result);
    } catch (error) {
        
        res.status(500).json({ error: error.message });
    }
})


router.post('/ancillary', async (req, res) => {
    const data = req.body;
    try {
        const result = await sabre.getBaggageOptions(data.flightDetails, data.passengerDetails);
        res.json(result);
    } catch (error) {
        
        res.status(500).json({ error: error.message });
    }
})



//hotels
router.post('/hotels/search', async (req, res) => {
    try {
        const hotels = await sabre.searchHotels({
            ...req.body
        });
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/cars/search', async (req, res) => {
    try {
        const hotels = await sabre.searchCars({
            ...req.body
        });
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;