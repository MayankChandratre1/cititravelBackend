//PSRCIA
import dotenv from 'dotenv';
import axios from 'axios';
import xml2js from 'xml2js';
import Guest from '../model/Guest.js';
import Itinirary from '../model/Itinirary.js';
import Rental from '../model/Rental.js';
import { sendPassportReminder } from './email.config.mjs';

dotenv.config();

class SabreAPI {
    constructor() {
        // this.baseURL =  'https://api.havail.sabre.com';
        this.baseURL =  'https://api-crt.cert.havail.sabre.com';
        this.credentials = {
            clientId: process.env.SABRE_CLIENT_ID,
            clientSecret: process.env.SABRE_CLIENT_SECRET
        };
        this.token = null;
        this.tokenExpiry = null;
        this.soapEndpoint = 'https://webservices.havail.sabre.com';  // Add SOAP endpoint
    }

    async authenticate() {
        try {
            console.log("Authenticating...");
            const auth_client_id = Buffer.from(`${this.credentials.clientId}`).toString('base64');
            const auth_client_secret = Buffer.from(`${this.credentials.clientSecret}`).toString('base64');
            const auth = Buffer.from(`${auth_client_id}:${auth_client_secret}`).toString('base64')
            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/v2/auth/token`,
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: 'grant_type=client_credentials'
            });
            this.token = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            
            return this.token;
        } catch (error) {
            console.log(error.response.data);
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    async getAuthToken() {
        if (!this.token || Date.now() >= this.tokenExpiry) {
            await this.authenticate();
        }
        return this.token;
    }

    async testToken(){
        const token = await this.getAuthToken();
        try{
            const response = await axios({
                method: 'get',
                url: `${this.baseURL}/v1/lists/supported/shop/themes/THEME-PARK`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }catch(err){
            console.log("Error in testToken: ",err);
        }
    }

    // Flight search
    async searchFlights(params) {
        const token = await this.getAuthToken();
        
        try {

            const data = {
                OTA_AirLowFareSearchRQ: {
                    DirectFlightsOnly: true,
                    AvailableFlightsOnly: true,
                    Target: "Production",
                    OriginDestinationInformation: params.flightsData,
                    POS: {
                        Source: [{
                            PseudoCityCode: "W6AF",
                            RequestorID: {
                                CompanyName: { Code: "TN" },
                                ID: "33695502",
                                Type: "5"
                            }
                        }]
                    },
                    TPA_Extensions: {
                        IntelliSellTransaction: {
                            RequestType: {
                                Name: "50ITINS"
                            }
                        }
                    },
                    TravelPreferences: {
                        TPA_Extensions: {
                            DataSources: {
                                ATPCO: "Enable",
                                LCC: "Enable",
                                NDC: "Enable"
                            },
                            TripType: {
                                Value: params.TripType || "OneWay"
                            }
                        }
                    },
                    TravelerInfoSummary: {
                        AirTravelerAvail: [{
                            PassengerTypeQuantity:params.PassengerTypeQuantity || [{ Code: "ADT", Quantity: 1 }]
                        }],
                        PriceRequestInformation: {
                            CurrencyCode: params.currencyCode || "USD",
                            TPA_Extensions: {
                                Priority: {
                                    Price: { Priority: 1 }
                                },
                                PointOfSaleOverride: { Code: params.flightsData[0].OriginLocation.LocationCode }
                            }
                        },
                        SeatsRequested: [params.PassengerTypeQuantity.reduce((acc, curr) => acc + curr.Quantity, 0)]
                    },
                    Version: "v2"
                }
            }

            

            

            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/v3/offers/shop`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data
            });
            return response.data;
        } catch (error) {
            console.log(error.response?.data || error);
            throw new Error(`Flight search failed: ${error}`);
        }
    }

    //Airlines Data
    async getAirlines(params) {
        const token = await this.getAuthToken();
        try {
            const response = await axios({
                method: 'get',
                url: `${this.baseURL}/v1/lists/utilities/airlines`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params:{
                    airlinecode: params.airlinecode 
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Airlines search failed: ${error.message}`);
        }
    }

    //Get Aircrafts
    async getAircrafts(params) {
        const token = await this.getAuthToken();
        try {
            const response = await axios({
                method: 'get',
                url: `${this.baseURL}/v1/lists/utilities/aircraft/equipment`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params:{
                    aircraftcode: params.aircraftcode 
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Airlines search failed: ${error.message}`);
        }
    }

    //GET GEOCODES
    async getGeocodes(body) {
        const token = await this.getAuthToken();
        try {
            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/v4/geo/geocode`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: body
            });
            const res = {
                Response: response.data.GeoCodeResponse.Results.GeoCodeRS.map(item => ({
                    code: item.Place[0].Id,
                    name: item.Place[0].Name,
                    city: item.Place[0].City,
                    country: item.Place[0].Country,
                    state: item.Place[0].State,
                }))
            }
            return res;
        } catch (error) {
            console.log("Error in getGeocodes: ",error);
            
            throw new Error(`Airlines search failed: ${error.message}`);
        }
    }

    // Hotel search
    async searchHotels(params) {
        const token = await this.getAuthToken();
        try {
            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/v1.0.0/shop/hotels`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    GeoSearchRQ: {
                        GeoRef: {
                            Radius: params.radius || 10,
                            UOM: "MI",
                            RefPoint: {
                                Value: params.location
                            }
                        },
                        TimeSpan: {
                            Start: params.checkIn,
                            End: params.checkOut
                        }
                    }
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Hotel search failed: ${error.message}`);
        }
    }

    // Car rental search
    async searchCars(params) {
        const token = await this.getAuthToken();
        console.log("Token: ",{
            GetVehAvailRQ:{
                POS:{
                    Source:{
                        PseudoCityCode: process.env.SABRE_PCC
                    }
                },
                SearchCriteria: params.SearchCriteria
            }
        });
        
        try {
            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/v2.0.0/get/vehavail`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    GetVehAvailRQ:{
                        POS:{
                            Source:{
                                PseudoCityCode: process.env.SABRE_PCC
                            }
                        },
                        SearchCriteria: params.SearchCriteria,
                        "version": "2.0.0"
                    }
                }
            });
            return response.data;
        } catch (error) {
            console.log("Error in searchCars: ",error.response.data);
            
            throw new Error(`Car search failed: ${error.message}`);
        }
    }

    async searchAirport(params) {
        const token = await this.getAuthToken();
        try {
            const response = await axios({
                method: 'get',
                url: `${this.baseURL}/v2/geo/autocomplete`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    clientId: 'devstudio',
                    category: 'AIR',
                    limit: 10,
                    query: params.query
                }
            });            
            return response.data;
        } catch (error) {
            throw new Error(`Airport search failed: ${error.message}`);
        }
    }

    async revalidateItinerary(params) {
        const token = await this.getAuthToken();

        const OTA_AirLowFareSearchRQ = {
            
                "OriginDestinationInformation": params.OriginDestinationInformation,
                "POS": {
                    "Source": [
                        {
                            "FixedPCC": true,
                            "PseudoCityCode": "W6AF",
                            "RequestorID": {
                                "CompanyName": {
                                    "Code": "TN"
                                },
                                "ID": "1",
                                "Type": "1"
                            }
                        }
                    ]
                },
                "TravelerInfoSummary": {
                    "AirTravelerAvail": [
                        {
                            "PassengerTypeQuantity": params.PassengerTypeQuantity.map(passenger => ({
                                "Code": passenger.Code,
                                "Quantity": passenger.Quantity
                            }))
                        }
                    ]
                },
                "TPA_Extensions": {
                    "IntelliSellTransaction": {
                        "RequestType": {
                            "Name": "200ITINS"
                        }
                    }
                },
                "Version": "V4"
            
        }

        console.dir(OTA_AirLowFareSearchRQ, {depth: null});
        

        try {
            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/v5/shop/flights/revalidate`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data:{
                    OTA_AirLowFareSearchRQ
                }
            });
            return response.data;
        } catch (error) {
            console.log(error.response?.data || error);
            
            throw new Error(`Revalidate itinerary failed: ${error.message}`);
        }
    }

    async createPNR(pnrPayload, passengerDetails, billingInfo, additionalData) {
        try {
            const token = await this.getAuthToken();
            const { email, name, userId } = billingInfo;


            // First create the database record
            const itinerary = new Itinirary({
                user: userId,
                billing: {
                    cardNumber: billingInfo.paymentMethod.card.last4 || billingInfo.paymentMethod.card.number.slice(-4),
                    expiryDate: `${billingInfo.paymentMethod.card.exp_month}/${billingInfo.paymentMethod.card.exp_year}`,
                    cardHolderName: name
                },
                address: {
                    ...billingInfo.address
                },
                passengers: passengerDetails.passengers.map(p => ({
                    ...p,
                    type: p.type || 'ADT'
                })),
                status: 'pending',
                totalAmount: additionalData.fare.totalFare.totalPrice,
                currency: additionalData.fare.totalFare.currency,
                itineraryDetails: additionalData.itinerary,
                fareDetails: {
                    baseFare: additionalData.fare.totalFare.baseFareAmount,
                    taxes: additionalData.fare.totalFare.totalTaxAmount,
                    validatingCarrier: additionalData.fare.validatingCarrierCode
                }
            });

            await itinerary.save();

            // Send passport reminder if international flight
            const isInternational = pnrPayload.CreatePassengerNameRecordRQ.AirBook.OriginDestinationInformation.FlightSegment.some(
                segment => {
                    const origin = segment.OriginLocation.LocationCode;
                    const destination = segment.DestinationLocation.LocationCode;
                    return origin.length === 3 && destination.length === 3; // Basic international check
                }
            );

            if (isInternational) {
                try {
                    await sendPassportReminder(email, name);
                    console.log('Passport reminder email sent successfully');
                } catch (emailError) {
                    console.error('Failed to send passport reminder:', emailError);
                }
            }

            const payload = {
                CreatePassengerNameRecordRQ:{
                    ...pnrPayload.CreatePassengerNameRecordRQ,
                    targetCity: process.env.SABRE_PCC,
                    EndTransaction: {
                        Source: {
                            ReceivedFrom: "CITITRAVEL API"
                        }
                    },
                    PostProcessing: {
                        EndTransaction: {
                            Source: {
                                ReceivedFrom: "SWS TESTING"
                            },
                            Email:{
                                eTicket: {
                                    Ind: true
                                },
                                Invoice:{
                                    Ind: true
                                }
                            }
                        }
                    }
                }
            }


            

            // Create PNR with Sabre
            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/v2.4.0/passenger/records?mode=create`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: pnrPayload
            });

            const pnr = response.data?.CreatePassengerNameRecordRS?.ItineraryRef?.ID;
            console.dir(response.data, {depth: null});
            

            if (pnr) {
                // Update itinerary with PNR
                await Itinirary.findByIdAndUpdate(itinerary._id, {
                    pnr,
                    status: 'confirmed'
                });

                return {
                    success: true,
                    pnr,
                    itineraryId: itinerary._id,
                    response: response.data
                };
            }

            // If PNR creation failed, mark itinerary as failed
            await Itinirary.findByIdAndUpdate(itinerary._id, {
                status: 'failed'
            });

            return {
                success: false,
                error: 'PNR not created successfully',
                itineraryId: itinerary._id
            };

        } catch (error) {
            console.error('PNR Creation Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
                errorCode: error.response?.status
            };
        }
    }

    async getBaggageOptions(flightDetails, passengerDetails = [], pnr) {
        const token = await this.getAuthToken();
        
        const soapEnvelope = this.buildBaggageOffersPayloadRequest(token, flightDetails, passengerDetails, pnr);
        console.log(this.soapEnvelope);

        try {
            const response = await axios.post(this.soapEndpoint, soapEnvelope, {
                headers: {
                    'Content-Type': 'text/xml;charset=UTF-8',
                    'SOAPAction': 'GetAncillaryOffersRQ'
                }
            });
            
            const result = await this.parseXMLResponse(response.data);
            return this.extractBaggageOptions(result);
        } catch (error) {
            console.error('Error getting baggage options:', error);
            throw new Error('Failed to retrieve baggage options from Sabre');
        }
    }
    
    buildBaggageOffersPayloadRequest(token, flightDetails, passengerDetails, pnr) {
        const conversationId = `CONV${Date.now()}@${this.credentials.clientId}`;
        const messageId = `mid:${new Date().toISOString()}@${this.credentials.clientId}`;
        const timestamp = new Date().toISOString();
        
        let passengerElements = '';
        passengerDetails.forEach((passenger, index) => {
            const passengerId = `p${index + 1}`;
            
            let loyaltyAccount = '';
            if (passenger.loyaltyProgram && passenger.loyaltyNumber) {
                const loyaltyId = `l${index + 1}`;
                loyaltyAccount = `
                    <ns14:LoyaltyAccounts>
                        <ns14:LoyaltyAccountWithId id="${loyaltyId}" memberAirline="${passenger.loyaltyProgram}" memberId="${passenger.loyaltyNumber}" ${passenger.loyaltyTier ? `tierTag="${passenger.loyaltyTier}"` : ''}/>
                    </ns14:LoyaltyAccounts>
                `;
            }
            
            passengerElements += `
                <ns9:Passenger id="${passengerId}">
                    ${loyaltyAccount}
                </ns9:Passenger>
            `;
        });
        
        if (passengerElements === '') {
            passengerElements = `<ns9:Passenger id="p1"></ns9:Passenger>`;
        }

        // Return SOAP envelope XML string
        return `<?xml version="1.0" encoding="UTF-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Header>
                <ns15:MessageHeader xmlns:ns15="http://www.ebxml.org/namespaces/messageHeader">
                    <ns15:From>
                        <ns15:PartyId>${this.credentials.clientId}</ns15:PartyId>
                    </ns15:From>
                    <ns15:To>
                        <ns15:PartyId>123123</ns15:PartyId>
                    </ns15:To>
                    <ns15:CPAId>${flightDetails.airline}</ns15:CPAId>
                    <ns15:ConversationId>${conversationId}</ns15:ConversationId>
                    <ns15:Service/>
                    <ns15:Action>GetAncillaryOffersRQ</ns15:Action>
                    <ns15:MessageData>
                        <ns15:MessageId>${messageId}</ns15:MessageId>
                        <ns15:Timestamp>${timestamp}</ns15:Timestamp>
                    </ns15:MessageData>
                </ns15:MessageHeader>
                <ns17:Security xmlns:ns17="http://schemas.xmlsoap.org/ws/2002/12/secext">
                    <ns17:BinarySecurityToken>${token}</ns17:BinarySecurityToken>
                </ns17:Security>
            </soap:Header>
            <soap:Body>
                <ns9:GetAncillaryOffersRQ version="3.1.0" xmlns:ns2="http://www.w3.org/2000/09/xmldsig#" xmlns:ns1="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns4="http://www.w3.org/1999/xlink" xmlns:ns3="http://www.ebxml.org/namespaces/messageHeader" xmlns:ns6="http://schemas.xmlsoap.org/ws/2002/12/secext" xmlns:ns5="urn:schemas-sabre-com:soap-header-debug" xmlns:ns8="http://services.sabre.com/STL_Payload/v02_01" xmlns:ns13="http://services.sabre.com/merch/request/v03" xmlns:ns9="http://services.sabre.com/merch/ancillary/offer/v03" xmlns:ns12="http://services.sabre.com/merch/baggage/v03" xmlns:ns11="http://services.sabre.com/merch/common/v03" xmlns:ns10="http://services.sabre.com/merch/ancillary/v03" xmlns:ns16="http://services.sabre.com/merch/flight/v03" xmlns:ns15="http://services.sabre.com/merch/itinerary/v03" xmlns:ns14="http://services.sabre.com/merch/passenger/v03">
                    <ns9:RequestType>stateless</ns9:RequestType>
                    <ns9:RequestMode>booking</ns9:RequestMode>
                    <ns9:QueryByLocator>
                <ns9:PNR_Locator>${pnr}</ns9:PNR_Locator>
                    ${passengerElements}
                </ns9:GetAncillaryOffersRQ>
            </soap:Body>
        </soap:Envelope>`;
    }
    
    async parseXMLResponse(xmlData) {
        return new Promise((resolve, reject) => {
            xml2js.parseString(xmlData, { explicitArray: false }, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
    
    extractBaggageOptions(xmlResult) {
        try {
            const body = xmlResult['soap:Envelope']['soap:Body'];
            const response = body['ns9:GetAncillaryOffersRS'];
            
            if (response['ns8:ApplicationResults'] && response['ns8:ApplicationResults'].$.status === 'Error') {
                throw new Error(response['ns8:ApplicationResults'].Error.Message || 'Unknown error from Sabre');
            }
            
            const bagOffers = [];
            
            if (response['ns9:AncillaryDefinition'] && response['ns9:AncillaryDefinition']['ns9:AncillaryOffer']) {
                const offers = Array.isArray(response['ns9:AncillaryDefinition']['ns9:AncillaryOffer']) 
                    ? response['ns9:AncillaryDefinition']['ns9:AncillaryOffer'] 
                    : [response['ns9:AncillaryDefinition']['ns9:AncillaryOffer']];
                
                offers.forEach(offer => {
                    if (offer['ns9:AncillaryServiceDefinition'] && 
                        offer['ns9:AncillaryServiceDefinition']['ns10:SubCode'] === 'BG') {
                        
                        const baggageOffer = {
                            id: offer.$.id,
                            name: offer['ns9:AncillaryServiceDefinition']['ns10:Name'],
                            description: offer['ns9:AncillaryServiceDefinition']['ns10:Description'],
                            price: {
                                amount: parseFloat(offer['ns9:AncillaryServiceDefinition']['ns10:CommercialName']['ns10:Price']['ns10:Base'].$.amount),
                                currency: offer['ns9:AncillaryServiceDefinition']['ns10:CommercialName']['ns10:Price']['ns10:Base'].$.currency
                            },
                            weight: this.extractBaggageWeight(offer['ns9:AncillaryServiceDefinition']['ns10:Description'])
                        };
                        
                        bagOffers.push(baggageOffer);
                    }
                });
            }
            
            return {
                baggageOffers: bagOffers,
                rawResponse: response
            };
            
        } catch (error) {
            console.error('Error extracting baggage options:', error);
            return { baggageOffers: [], error: error.message };
        }
    }
    
    extractBaggageWeight(description) {
        const weightMatch = description.match(/(\d+)\s*KG/i);
        return weightMatch ? parseInt(weightMatch[1]) : null;
    }
    
    async addExtraBaggage(flightDetails, passengerId, offerId) {
        throw new Error('Not implemented yet');
    }





    //Hotels
    async searchHotels(params) {
        const token = await this.getAuthToken();
        try {
            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/v5/get/hotelavail`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    GetHotelAvailRQ:{
                        "POS": {
                            "Source": {
                                "PseudoCityCode": process.env.SABRE_PCC
                            }
                        },
                        ...params
                    }
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Hotel search failed: ${error.message}`);
        }
    }

    async getHotelDetails(reqPayload){
        const payload = {
            HotelPriceCheckRQ:{
                ...reqPayload.HotelPriceCheckRQ,
                "POS": {
                    "Source": {
            "PseudoCityCode": process.env.SABRE_PCC
        }
            },
            }
        }
        try{
            const token = await this.getAuthToken()
            const response = await axios.post(`${this.baseURL}/v5/hotel/pricecheck`,payload,{
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })


            return response.data;
        }catch(err){
            console.log("Error in getHotelDetails: ",err);
        }
    }

    async createHotelPNR(hotelDetails, guestDetails, reqPayload) {
        try {
            const token = await this.getAuthToken();

            // Create Guest record first
            const guest = new Guest({
                user: guestDetails.userId,
                bookingKey: hotelDetails.bookingKey,
                hotel: {
                    hotelCode: hotelDetails.hotelCode,
                    checkIn: hotelDetails.checkIn,
                    checkOut: hotelDetails.checkOut,
                    roomType: hotelDetails.roomType,
                    rateCode: hotelDetails.rateCode
                },
                guest: {
                    firstName: guestDetails.firstName,
                    lastName: guestDetails.lastName,
                    email: guestDetails.email,
                    phone: guestDetails.phone,
                    address: guestDetails.address
                },
                status: 'pending'
            });

            await guest.save();

            const payload = {
                CreatePassengerNameRecordRQ: {
                    ...reqPayload,
                    targetCity: process.env.SABRE_PCC,

                }
            };


            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/v2.5.0/passenger/records?mode=create`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: payload
            });
            console.dir(response.data, {depth: null});
            

            const pnr = response.data?.CreatePassengerNameRecordRS?.ItineraryRef?.ID;

            if (pnr) {
                // Update guest record with PNR and status
                await Guest.findByIdAndUpdate(guest._id, {
                    pnr,
                    status: 'confirmed',
                    payment: {
                        amount: 0, // Update with actual amount if available
                        currency: 'USD',
                        status: 'pending'
                    }
                });

                return {
                    success: true,
                    pnr,
                    guestId: guest._id,
                    response: response.data
                };
            }

            // If PNR creation failed, update guest record status
            await Guest.findByIdAndUpdate(guest._id, {
                status: 'failed'
            });

            return {
                success: false,
                error: 'PNR not created successfully',
                guestId: guest._id
            };

        } catch (error) {
            console.error('Hotel PNR Creation Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
                errorCode: error.response?.status
            };
        }
    }

    async createVehiclePNR(vehicleDetails, passengerDetails, paymentDetails) {
        try {
            const token = await this.getAuthToken();

            const payload = {
                CreatePassengerNameRecordRQ: {
                    version: "2.5.0",
                    targetCity: process.env.SABRE_PCC,
                    TravelItineraryAddInfo: {
                        CustomerInfo: {
                            ContactNumbers: {
                                ContactNumber: passengerDetails.passengers.map(passenger => ({
                                    NameNumber: passenger.nameNumber,
                                    Phone: passenger.phone,
                                    PhoneUseType: passenger.phoneType || 'H'
                                }))
                            },
                            PersonName: passengerDetails.passengers.map(passenger => ({
                                NameNumber: passenger.nameNumber,
                                NameReference: passenger.reference,
                                PassengerType: passenger.type || 'ADT',
                                GivenName: passenger.firstName,
                                Surname: passenger.lastName
                            }))
                        }
                    },
                    VehicleBook: {
                        RentalPaymentPrefs: {
                            GuaranteePrepaid: {
                                Type: "CC",
                                PaymentCard: {
                                    CardCode: paymentDetails.card.brand.toUpperCase().substring(0, 2),
                                    CardNumber: paymentDetails.card.number,
                                    ExpiryMonth: paymentDetails.card.expMonth,
                                    ExpiryYear: paymentDetails.card.expYear,
                                    FullCardHolderName: {
                                        LastName: passengerDetails.passengers[0].lastName
                                    }
                                },
                                Text: "GUARANTEE FOR VEHICLE RENTAL"
                            }
                        },
                        VehRentalCore: {
                            PickUpDate: vehicleDetails.pickUpDate,
                            PickUpTime: vehicleDetails.pickUpTime,
                            ReturnDate: vehicleDetails.returnDate,
                            ReturnTime: vehicleDetails.returnTime
                        }
                    },
                    PostProcessing: {
                        EndTransaction: {
                            Source: {
                                ReceivedFrom: "CITITRAVEL API"
                            }
                        },
                        RedisplayReservation: {}
                    }
                }
            };

            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/v2.4.0/passenger/records?mode=create`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: payload
            });

            const pnr = response.data?.CreatePassengerNameRecordRS?.ItineraryRef?.ID;

            if (pnr) {
                // Create Rental record
                const rental = new Rental({
                    user: passengerDetails.userId,
                    pnr,
                    vehicle: {
                        pickUpDate: vehicleDetails.pickUpDate,
                        pickUpTime: vehicleDetails.pickUpTime,
                        returnDate: vehicleDetails.returnDate,
                        returnTime: vehicleDetails.returnTime
                    },
                    driver: {
                        firstName: passengerDetails.passengers[0].firstName,
                        lastName: passengerDetails.passengers[0].lastName,
                        email: passengerDetails.passengers[0].email,
                        phone: passengerDetails.passengers[0].phone,
                        reference: passengerDetails.passengers[0].reference
                    },
                    payment: {
                        amount: vehicleDetails.amount,
                        currency: vehicleDetails.currency || 'USD',
                        status: 'pending'
                    },
                    status: 'confirmed'
                });

                await rental.save();

                return {
                    success: true,
                    pnr,
                    rentalId: rental._id,
                    response: response.data
                };
            }

            return {
                success: false,
                error: 'PNR not created successfully'
            };

        } catch (error) {
            console.error('Vehicle PNR Creation Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
                errorCode: error.response?.status
            };
        }
    }

}

export default SabreAPI;