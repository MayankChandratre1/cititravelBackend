import SabreAPI from '../config/sabre.config.js';
import dotenv from 'dotenv';

dotenv.config();

const sabre = new SabreAPI();

describe('Sabre PNR Creation Tests', () => {
    let token;

    beforeAll(async () => {
        token = await sabre.authenticate();
        expect(token).toBeTruthy();
    });

    describe('Flight PNR Creation', () => {
        test('should create flight PNR successfully', async () => {
            const flightDetails = {
                segments: [{
                    departureDateTime: '2024-06-01T10:00:00',
                    arrivalDateTime: '2024-06-01T12:00:00',
                    flightNumber: '123',
                    bookingClass: 'Y',
                    airlineCode: 'AA',
                    origin: 'JFK',
                    destination: 'LAX'
                }]
            };

            const passengerDetails = {
                passengers: [{
                    firstName: 'John',
                    lastName: 'Doe',
                    type: 'ADT',
                    dob: '1990-01-01',
                    gender: 'M',
                    passportNumber: 'AB123456',
                    nationality: 'US'
                }],
                phone: '1234567890'
            };

            const billingInfo = {
                email: 'test@example.com',
                name: 'John Doe',
                paymentMethod: {
                    card: {
                        brand: 'visa',
                        last4: '4242',
                        exp_month: 12,
                        exp_year: 2024
                    }
                }
            };

            const result = await sabre.createPNR(flightDetails, passengerDetails, billingInfo);
            expect(result.success).toBe(true);
            expect(result.pnr).toBeTruthy();
        });
    });

    describe('Hotel PNR Creation', () => {
        test('should create hotel PNR successfully', async () => {
            try {
                const hotelDetails = {
                    bookingKey: '9a34656e-72ab-4e31-8a48-1e441841af99',
                    hotelCode: 'HTLTEST',
                    checkIn: '2024-08-13',
                    checkOut: '2024-08-15',
                    roomType: 'STD',
                    rateCode: 'RAC'
                };

                const guestDetails = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'test@example.com',
                    phone: '1234567890',
                    address: {
                        street: '123 Test St',
                        city: 'Test City',
                        state: 'TS',
                        zipCode: '12345',
                        country: 'US'
                    }
                };

                const paymentDetails = {
                    card: {
                        brand: 'visa',
                        number: '4111111111111111',
                        expMonth: 12,
                        expYear: '2028', // Changed to string
                        cvc: '123',
                        holderName: 'John Doe'
                    }
                };

                const result = await sabre.createHotelPNR(hotelDetails, guestDetails, paymentDetails);
                console.log('Hotel PNR Response:', JSON.stringify(result, null, 2));
                
                expect(result).toBeDefined();
                expect(result.success).toBe(true);
                expect(result.pnr).toBeTruthy();
                expect(result.response).toBeDefined();
                
            } catch (error) {
                console.error('Hotel PNR Test Error:', {
                    message: error.message,
                    response: error.response?.data,
                    stack: error.stack
                });
                throw error;
            }
        });

        test('should handle hotel booking errors gracefully', async () => {
            const result = await sabre.createHotelPNR(
                { bookingKey: 'invalid' },
                { firstName: 'Test' },
                { card: { brand: 'visa' } }
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('Vehicle PNR Creation', () => {
        test('should create vehicle PNR successfully', async () => {
            const vehicleDetails = {
                pickUpDate: '2024-08-13',
                pickUpTime: '10:00',
                returnDate: '2024-09-13',
                returnTime: '10:00'
            };

            const passengerDetails = {
                passengers: [{
                    nameNumber: '1.1',
                    reference: 'ABC123',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '1234567890',
                    phoneType: 'H',
                    type: 'ADT'
                }]
            };

            const paymentDetails = {
                card: {
                    brand: 'visa',
                    number: '4111111111111111',
                    expMonth: 12,
                    expYear: 2024,
                    cvc: '123'
                }
            };

            const result = await sabre.createVehiclePNR(vehicleDetails, passengerDetails, paymentDetails);
            expect(result.success).toBe(true);
            expect(result.pnr).toBeTruthy();
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid flight details', async () => {
            const result = await sabre.createPNR({}, {}, {});
            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });

        test('should handle invalid hotel details', async () => {
            const result = await sabre.createHotelPNR({}, {}, {});
            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });

        test('should handle invalid vehicle details', async () => {
            const result = await sabre.createVehiclePNR({}, {}, {});
            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });
    });
});
