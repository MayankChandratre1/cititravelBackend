import express from 'express';
import SabreAPI from '../config/sabre.config.js';
import auth from '../middlewares/auth-middleware.js';

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

router.post('/createpnr', auth, async (req, res) => {
    const { pnrPayload, formData, fare, itinerary, searchParams } = req.body;
    console.log('Create PNR Request:', req.user);
    
    try {
        // Extract billing info and add userId from auth middleware
        const billingInfo = {
            userId: req.user?.id, // Assuming you have auth middleware
            email: formData.address.email,
            name: formData.billing.cardHolderName,
            address: formData.address,
            paymentMethod: {
                card: {
                    brand: 'visa', // Assuming visa for now, can be dynamic
                    number: formData.billing.cardNumber,
                    exp_month: parseInt(formData.billing.expiryDate.split('/')[0]),
                    exp_year: '20' + formData.billing.expiryDate.split('/')[1],
                    cvc: formData.billing.cvv
                }
            }
        };

        // Add fare details and amount to be saved in DB
        const flightDetails = {
            ...pnrPayload.CreatePassengerNameRecordRQ.AirBook,
            amount: fare.totalFare.totalPrice,
            currency: fare.totalFare.currency
        };

        const result = await sabre.createPNR(
            pnrPayload,
            {
                passengers: formData.passengers,
                phone: formData.address.phone
            },
            billingInfo,
            {
                fare,
                itinerary,
                searchParams
            }
        );

        res.json(result);
    } catch (error) {
        console.error('PNR Creation Error:', error);
        res.status(500).json({ error: error.message });
    }
})

router.post('/updatepnr',auth, async (req, res) => {
    const data = req.body;
    
    try {
        const result = await sabre.updatePNR(data);
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

router.post('/hotels/details', async (req, res) => {
    try {
        const hotel = await sabre.getHotelDetails(req.body);
        res.json({
            success: true,
            hotel
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.post('/hotels/createpnr', auth, async (req, res) => {
    const { CreatePassengerNameRecordRQ, formData, searchParams } = req.body;
    try {
        // Extract guest and payment details from the main payload
        const guestDetails = {
            userId: req.user?.id,
            firstName: CreatePassengerNameRecordRQ.TravelItineraryAddInfo.CustomerInfo.PersonName[0].GivenName,
            lastName: CreatePassengerNameRecordRQ.TravelItineraryAddInfo.CustomerInfo.PersonName[0].Surname,
            email: CreatePassengerNameRecordRQ.TravelItineraryAddInfo.CustomerInfo.Email[0].Address,
            phone: CreatePassengerNameRecordRQ.TravelItineraryAddInfo.CustomerInfo.ContactNumbers.ContactNumber[0].Phone,
            address: {
                street: CreatePassengerNameRecordRQ.TravelItineraryAddInfo.AgencyInfo.Address.StreetNmbr,
                city: CreatePassengerNameRecordRQ.TravelItineraryAddInfo.AgencyInfo.Address.CityName,
                state: CreatePassengerNameRecordRQ.TravelItineraryAddInfo.AgencyInfo.Address.StateCountyProv.StateCode,
                country: CreatePassengerNameRecordRQ.TravelItineraryAddInfo.AgencyInfo.Address.CountryCode,
                zipCode: CreatePassengerNameRecordRQ.TravelItineraryAddInfo.AgencyInfo.Address.PostalCode
            }
        };

        const result = await sabre.createHotelPNR(
            { bookingKey: searchParams?.bookingKey || '' },
            guestDetails,
            CreatePassengerNameRecordRQ
        );

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Hotel PNR Creation Error:', error);
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

router.post('/cars/createpnr', async (req, res) => {
    const { vehicleDetails, passengerDetails, paymentDetails } = req.body;
    try {
        const result = await sabre.createVehiclePNR(vehicleDetails, passengerDetails, paymentDetails);
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;