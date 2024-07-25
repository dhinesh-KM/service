const DOCHUB_PHONE_CODE = 
    {'Argentina' :'+54', 'Australia' :'+61', 'Austria' :'+43', 'Belgium' :'+32', 'Bosnia' :'+387', 'Brazil' :'+55', 'Bulgaria' :'+359',
    'Canada' :'+1', 'Chile' :'+56', 'China' :'+86', 'Croatia' :'+385', 'Czech Republic' :'+420', 'Denmark' :'+45', 'Estonia' :'+372',
    'Finland' :'+358', 'France' :'+33', 'Herzegovina' :'+387', 'Iceland' :'+354', 'India' :'+91', 'Indonesia' :'+62', 'Israel' :'+972', 'Italy' :'+39',
    'Latvia' :'+371', 'Lithuania' :'+370', 'Macedonia' :'+389', 'Malaysia' :'+60', 'Mexico' :'+52', 'Moldova' :'+373', 'Montenegro' :'+382',
    'Netherlands' :'+31', 'New Zealand' :'+64', 'Norway' :'+47', 'Poland' :'+48', 'Portugal' :'+351', 'Romania' :'+40',
    'Serbia' :'+381', 'Singapore' :'+65', 'Slovakia' :'+421', 'Slovenia' :'+386', 'South Africa' :'+27', 'South Korea' :'+82',
    'Spain' :'+34', 'Sweden' :'+46', 'Switzerland' :'+41', 'Turkey' :'+90', 'Ukraine' :'+380', 'United Kingdom' :'+44', 'USA' :'+1'};
    
const ETHINICTY =  [
        {   "id": 1,  "title": "American Indian",   "tagName": "American Indian"},
        {   "id": 2,  "title": "Asian",   "tagName": "Asian" },
        {   "id": 3,  "title": "Hispanic or Latino",  "tagName": "Hispanic or Latino"},
        {   "id": 4,  "title": "Native Hawaiian or Other Pacific Islander",  "tagName": "Native Hawaiian or Other Pacific Islander"},
        {   "id": 5,  "title": "White",  "tagName": "White" }
    ]

const BLOOD_GROUPS = [
        {   "id": 1,   "title": "A+ve",   "tagName": "A+ve"   },
        {   "id": 2,   "title": "A-ve",   "tagName": "A-ve"   },
        {   "id": 3,   "title": "AB+ve",   "tagName": "AB+ve"   },
        {   "id": 4,   "title": "AB-ve",   "tagName": "AB-ve"   },
        {   "id": 5,   "title": "B+ve",   "tagName": "B+ve"   },
        {   "id": 6,   "title": "B-ve",   "tagName": "B-ve"   },
        {   "id": 7,   "title": "O+ve",   "tagName": "O+ve"   },
        {   "id": 8,   "title": "O-ve",   "tagName": "O-ve"   }
    ];
    

function get_country_phone_code(country)
{
    const str = country.charAt(0).toUpperCase()+country.slice(1)
    return DOCHUB_PHONE_CODE[str]
}





//console.log(get_country_phone_code('india'))
//console.log(get_ethinicity())


module.exports = {get_country_phone_code, ETHINICTY, BLOOD_GROUPS}

