export interface Country {
    name: string;
    code: string;
    phoneCode: string;
    currency: string;
    states: string[];
}

export const COUNTRIES: Country[] = [
    {
        name: 'India',
        code: 'IN',
        phoneCode: '+91',
        currency: 'INR',
        states: [
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
            'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
            'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
            'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
            'Delhi', 'Chandigarh', 'Ladakh', 'Jammu and Kashmir', 'Puducherry'
        ]
    },
    {
        name: 'United States',
        code: 'US',
        phoneCode: '+1',
        currency: 'USD',
        states: [
            'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 
            'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 
            'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 
            'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 
            'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 
            'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 
            'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 
            'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
            'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 
            'West Virginia', 'Wisconsin', 'Wyoming'
        ]
    },
    {
        name: 'United Kingdom',
        code: 'GB',
        phoneCode: '+44',
        currency: 'GBP',
        states: ['England', 'Scotland', 'Wales', 'Northern Ireland']
    },
    {
        name: 'United Arab Emirates',
        code: 'AE',
        phoneCode: '+971',
        currency: 'AED',
        states: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah']
    },
    {
        name: 'Australia',
        code: 'AU',
        phoneCode: '+61',
        currency: 'AUD',
        states: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania']
    },
    {
        name: 'Canada',
        code: 'CA',
        phoneCode: '+1',
        currency: 'CAD',
        states: ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick']
    }
];
