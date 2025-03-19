import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

class AmexAPI {
    constructor() {
        this.baseURL = process.env.AMEX_API_URL;
        this.credentials = {
            apiKey: process.env.AMEX_API_KEY,
            clientId: process.env.AMEX_CLIENT_ID,
            clientSecret: process.env.AMEX_CLIENT_SECRET
        };
        this.token = null;
        this.tokenExpiry = null;
    }

    async authenticate() {
        try {
            const auth = Buffer.from(`${this.credentials.clientId}:${this.credentials.clientSecret}`).toString('base64');
            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/auth/token`,
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
            console.error('AMEX Authentication Error:', error.response?.data || error);
            throw new Error('Authentication failed');
        }
    }

    async getAuthToken() {
        if (!this.token || Date.now() >= this.tokenExpiry) {
            await this.authenticate();
        }
        return this.token;
    }

    async searchHotels(params) {
        const token = await this.getAuthToken();
        try {
            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/v1/travel/hotels/search`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'x-api-key': this.credentials.apiKey
                },
                data: {
                    location: params.location,
                    checkIn: params.checkIn,
                    checkOut: params.checkOut,
                    rooms: params.rooms || 1,
                    adults: params.adults || 1,
                    children: params.children || 0,
                    currency: params.currency || 'USD'
                }
            });
            return response.data;
        } catch (error) {
            console.error('AMEX Hotel Search Error:', error.response?.data || error);
            throw new Error('Hotel search failed');
        }
    }

    async getHotelDetails(hotelId) {
        const token = await this.getAuthToken();
        try {
            const response = await axios({
                method: 'get',
                url: `${this.baseURL}/v1/travel/hotels/${hotelId}`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'x-api-key': this.credentials.apiKey
                }
            });
            return response.data;
        } catch (error) {
            console.error('AMEX Hotel Details Error:', error.response?.data || error);
            throw new Error('Failed to fetch hotel details');
        }
    }

    async bookHotel(bookingDetails) {
        const token = await this.getAuthToken();
        try {
            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/v1/travel/hotels/book`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'x-api-key': this.credentials.apiKey
                },
                data: {
                    hotelId: bookingDetails.hotelId,
                    roomId: bookingDetails.roomId,
                    checkIn: bookingDetails.checkIn,
                    checkOut: bookingDetails.checkOut,
                    guests: bookingDetails.guests,
                    payment: bookingDetails.payment
                }
            });
            return response.data;
        } catch (error) {
            console.error('AMEX Hotel Booking Error:', error.response?.data || error);
            throw new Error('Hotel booking failed');
        }
    }

    async getBookingDetails(bookingId) {
        const token = await this.getAuthToken();
        try {
            const response = await axios({
                method: 'get',
                url: `${this.baseURL}/v1/travel/bookings/${bookingId}`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'x-api-key': this.credentials.apiKey
                }
            });
            return response.data;
        } catch (error) {
            console.error('AMEX Booking Details Error:', error.response?.data || error);
            throw new Error('Failed to fetch booking details');
        }
    }
}

export default AmexAPI;
