# app.py
# Placeholder for Flask backend entry point

from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import requests
import os
import json
import random

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# In-memory data stores
users = {}
sessions = {}

USERS_FILE = os.path.join(os.path.dirname(__file__), '../data/users.json')

def load_users():
    global users
    try:
        with open(USERS_FILE, 'r') as f:
            users = json.load(f)
    except Exception:
        users = {}

def save_users():
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f)

# Load users at startup
load_users()

# Fixed list of all 29 Indian states
states = [
    {
        "name": "Andhra Pradesh",
        "cities": [
            {
                "name": "Visakhapatnam",
                "image_url": "",
                "locations": [
                    {
                        "name": "MVP Colony",
                        "image_url": "",
                        "apartments": [
                            {"name": "Sai Residency", "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop", "rent": 18000, "description": "Spacious 2BHK with sea view, close to schools and markets."},
                            {"name": "Green Meadows", "image_url": "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400&h=300&fit=crop", "rent": 16000, "description": "Modern 1BHK, gated community, 24x7 security."},
                            {"name": "Blue Bay Apartments", "image_url": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&h=300&fit=crop", "rent": 20000, "description": "3BHK with balcony, gym and swimming pool access."},
                            {"name": "Sunshine Towers", "image_url": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop", "rent": 17500, "description": "2BHK, park-facing, near shopping complex."}
                        ],
                        "reviews": []
                    },
                    {
                        "name": "Dwaraka Nagar",
                        "image_url": "",
                        "apartments": [
                            {"name": "Dwaraka Heights", "image_url": "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400&h=300&fit=crop", "rent": 15000, "description": "1BHK, close to railway station and bus stop."},
                            {"name": "Royal Residency", "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop", "rent": 22000, "description": "Luxury 3BHK, fully furnished, with parking."},
                            {"name": "Sea View Apartments", "image_url": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&h=300&fit=crop", "rent": 18500, "description": "2BHK, sea-facing, modern amenities."},
                            {"name": "Urban Nest", "image_url": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop", "rent": 17000, "description": "1BHK, ideal for working professionals."}
                        ],
                        "reviews": []
                    },
                    {
                        "name": "Gajuwaka",
                        "image_url": "",
                        "apartments": [
                            {"name": "Gajuwaka Towers", "image_url": "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400&h=300&fit=crop", "rent": 14000, "description": "Affordable 2BHK, near industrial area."},
                            {"name": "Lotus Residency", "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop", "rent": 15500, "description": "1BHK, family-friendly, playground available."},
                            {"name": "Palm Grove", "image_url": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&h=300&fit=crop", "rent": 17000, "description": "2BHK, close to market and schools."},
                            {"name": "Hill View Apartments", "image_url": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop", "rent": 16500, "description": "2BHK, scenic view, peaceful locality."}
                        ],
                        "reviews": []
                    },
                    {
                        "name": "Seethammadhara",
                        "image_url": "",
                        "apartments": [
                            {"name": "Seetha Residency", "image_url": "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400&h=300&fit=crop", "rent": 16000, "description": "1BHK, near hospital and shopping mall."},
                            {"name": "Green Park", "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop", "rent": 18000, "description": "2BHK, garden-facing, kids play area."},
                            {"name": "Oceanic Apartments", "image_url": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&h=300&fit=crop", "rent": 21000, "description": "3BHK, sea view, premium amenities."},
                            {"name": "Sunrise Towers", "image_url": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop", "rent": 17500, "description": "2BHK, well-ventilated, near park."}
                        ],
                        "reviews": []
                    },
                    {
                        "name": "Madhurawada",
                        "image_url": "",
                        "apartments": [
                            {"name": "Madhura Enclave", "image_url": "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400&h=300&fit=crop", "rent": 15000, "description": "1BHK, close to IT park, ideal for techies."},
                            {"name": "Hilltop Residency", "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop", "rent": 17000, "description": "2BHK, hill view, peaceful environment."},
                            {"name": "Palm Springs", "image_url": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&h=300&fit=crop", "rent": 16500, "description": "2BHK, modern interiors, near highway."},
                            {"name": "Urban Greens", "image_url": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop", "rent": 18000, "description": "2BHK, eco-friendly society, jogging track."}
                        ],
                        "reviews": []
                    }
                ]
            },
            {"name": "Vijayawada", "image_url": "", "locations": []},
            {"name": "Guntur", "image_url": "", "locations": []},
            {"name": "Nellore", "image_url": "", "locations": []},
            {"name": "Kurnool", "image_url": "", "locations": []},
            {"name": "Rajahmundry", "image_url": "", "locations": []},
            {"name": "Kakinada", "image_url": "", "locations": []},
            {"name": "Tirupati", "image_url": "", "locations": []},
            {"name": "Anantapur", "image_url": "", "locations": []},
            {"name": "Kadapa", "image_url": "", "locations": []},
            {"name": "Eluru", "image_url": "", "locations": []},
            {"name": "Ongole", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Arunachal Pradesh",
        "cities": [
            {"name": "Itanagar", "image_url": "", "locations": []},
            {"name": "Naharlagun", "image_url": "", "locations": []},
            {"name": "Pasighat", "image_url": "", "locations": []},
            {"name": "Tezu", "image_url": "", "locations": []},
            {"name": "Ziro", "image_url": "", "locations": []},
            {"name": "Bomdila", "image_url": "", "locations": []},
            {"name": "Along", "image_url": "", "locations": []},
            {"name": "Roing", "image_url": "", "locations": []},
            {"name": "Changlang", "image_url": "", "locations": []},
            {"name": "Khonsa", "image_url": "", "locations": []},
            {"name": "Deomali", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Assam",
        "cities": [
            {"name": "Guwahati", "image_url": "", "locations": []},
            {"name": "Silchar", "image_url": "", "locations": []},
            {"name": "Dibrugarh", "image_url": "", "locations": []},
            {"name": "Jorhat", "image_url": "", "locations": []},
            {"name": "Nagaon", "image_url": "", "locations": []},
            {"name": "Tinsukia", "image_url": "", "locations": []},
            {"name": "Tezpur", "image_url": "", "locations": []},
            {"name": "Bongaigaon", "image_url": "", "locations": []},
            {"name": "Goalpara", "image_url": "", "locations": []},
            {"name": "Barpeta", "image_url": "", "locations": []},
            {"name": "Sivasagar", "image_url": "", "locations": []},
            {"name": "Karimganj", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Bihar",
        "cities": [
            {"name": "Patna", "image_url": "", "locations": []},
            {"name": "Gaya", "image_url": "", "locations": []},
            {"name": "Bhagalpur", "image_url": "", "locations": []},
            {"name": "Muzaffarpur", "image_url": "", "locations": []},
            {"name": "Purnia", "image_url": "", "locations": []},
            {"name": "Darbhanga", "image_url": "", "locations": []},
            {"name": "Bihar Sharif", "image_url": "", "locations": []},
            {"name": "Arrah", "image_url": "", "locations": []},
            {"name": "Begusarai", "image_url": "", "locations": []},
            {"name": "Katihar", "image_url": "", "locations": []},
            {"name": "Munger", "image_url": "", "locations": []},
            {"name": "Chapra", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Chhattisgarh",
        "cities": [
            {"name": "Raipur", "image_url": "", "locations": []},
            {"name": "Bhilai", "image_url": "", "locations": []},
            {"name": "Durg", "image_url": "", "locations": []},
            {"name": "Bilaspur", "image_url": "", "locations": []},
            {"name": "Korba", "image_url": "", "locations": []},
            {"name": "Jagdalpur", "image_url": "", "locations": []},
            {"name": "Raigarh", "image_url": "", "locations": []},
            {"name": "Ambikapur", "image_url": "", "locations": []},
            {"name": "Rajnandgaon", "image_url": "", "locations": []},
            {"name": "Dhamtari", "image_url": "", "locations": []},
            {"name": "Mahasamund", "image_url": "", "locations": []},
            {"name": "Janjgir", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Goa",
        "cities": [
            {"name": "Panaji", "image_url": "", "locations": []},
            {"name": "Margao", "image_url": "", "locations": []},
            {"name": "Vasco da Gama", "image_url": "", "locations": []},
            {"name": "Mapusa", "image_url": "", "locations": []},
            {"name": "Ponda", "image_url": "", "locations": []},
            {"name": "Bicholim", "image_url": "", "locations": []},
            {"name": "Valpoi", "image_url": "", "locations": []},
            {"name": "Sanquelim", "image_url": "", "locations": []},
            {"name": "Curchorem", "image_url": "", "locations": []},
            {"name": "Sanguem", "image_url": "", "locations": []},
            {"name": "Canacona", "image_url": "", "locations": []},
            {"name": "Pernem", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Gujarat",
        "cities": [
            {"name": "Ahmedabad", "image_url": "", "locations": []},
            {"name": "Surat", "image_url": "", "locations": []},
            {"name": "Vadodara", "image_url": "", "locations": []},
            {"name": "Rajkot", "image_url": "", "locations": []},
            {"name": "Bhavnagar", "image_url": "", "locations": []},
            {"name": "Jamnagar", "image_url": "", "locations": []},
            {"name": "Gandhinagar", "image_url": "", "locations": []},
            {"name": "Anand", "image_url": "", "locations": []},
            {"name": "Bharuch", "image_url": "", "locations": []},
            {"name": "Junagadh", "image_url": "", "locations": []},
            {"name": "Navsari", "image_url": "", "locations": []},
            {"name": "Porbandar", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Haryana",
        "cities": [
            {"name": "Gurgaon", "image_url": "", "locations": []},
            {"name": "Faridabad", "image_url": "", "locations": []},
            {"name": "Panipat", "image_url": "", "locations": []},
            {"name": "Yamunanagar", "image_url": "", "locations": []},
            {"name": "Rohtak", "image_url": "", "locations": []},
            {"name": "Hisar", "image_url": "", "locations": []},
            {"name": "Karnal", "image_url": "", "locations": []},
            {"name": "Sonipat", "image_url": "", "locations": []},
            {"name": "Ambala", "image_url": "", "locations": []},
            {"name": "Bhiwani", "image_url": "", "locations": []},
            {"name": "Sirsa", "image_url": "", "locations": []},
            {"name": "Jind", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Himachal Pradesh",
        "cities": [
            {"name": "Shimla", "image_url": "", "locations": []},
            {"name": "Mandi", "image_url": "", "locations": []},
            {"name": "Solan", "image_url": "", "locations": []},
            {"name": "Kullu", "image_url": "", "locations": []},
            {"name": "Dharamshala", "image_url": "", "locations": []},
            {"name": "Bilaspur", "image_url": "", "locations": []},
            {"name": "Una", "image_url": "", "locations": []},
            {"name": "Hamirpur", "image_url": "", "locations": []},
            {"name": "Chamba", "image_url": "", "locations": []},
            {"name": "Kangra", "image_url": "", "locations": []},
            {"name": "Palampur", "image_url": "", "locations": []},
            {"name": "Manali", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Jharkhand",
        "cities": [
            {"name": "Ranchi", "image_url": "", "locations": []},
            {"name": "Jamshedpur", "image_url": "", "locations": []},
            {"name": "Dhanbad", "image_url": "", "locations": []},
            {"name": "Bokaro", "image_url": "", "locations": []},
            {"name": "Deoghar", "image_url": "", "locations": []},
            {"name": "Hazaribagh", "image_url": "", "locations": []},
            {"name": "Giridih", "image_url": "", "locations": []},
            {"name": "Dumka", "image_url": "", "locations": []},
            {"name": "Phusro", "image_url": "", "locations": []},
            {"name": "Adityapur", "image_url": "", "locations": []},
            {"name": "Chatra", "image_url": "", "locations": []},
            {"name": "Gumla", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Karnataka",
        "cities": [
            {"name": "Bangalore", "image_url": "", "locations": []},
            {"name": "Mysore", "image_url": "", "locations": []},
            {"name": "Hubli", "image_url": "", "locations": []},
            {"name": "Mangalore", "image_url": "", "locations": []},
            {"name": "Belgaum", "image_url": "", "locations": []},
            {"name": "Gulbarga", "image_url": "", "locations": []},
            {"name": "Davangere", "image_url": "", "locations": []},
            {"name": "Bellary", "image_url": "", "locations": []},
            {"name": "Bijapur", "image_url": "", "locations": []},
            {"name": "Shimoga", "image_url": "", "locations": []},
            {"name": "Tumkur", "image_url": "", "locations": []},
            {"name": "Raichur", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Kerala",
        "cities": [
            {"name": "Kochi", "image_url": "", "locations": []},
            {"name": "Thiruvananthapuram", "image_url": "", "locations": []},
            {"name": "Kozhikode", "image_url": "", "locations": []},
            {"name": "Thrissur", "image_url": "", "locations": []},
            {"name": "Kollam", "image_url": "", "locations": []},
            {"name": "Alappuzha", "image_url": "", "locations": []},
            {"name": "Palakkad", "image_url": "", "locations": []},
            {"name": "Kannur", "image_url": "", "locations": []},
            {"name": "Kottayam", "image_url": "", "locations": []},
            {"name": "Pathanamthitta", "image_url": "", "locations": []},
            {"name": "Idukki", "image_url": "", "locations": []},
            {"name": "Wayanad", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Madhya Pradesh",
        "cities": [
            {"name": "Bhopal", "image_url": "", "locations": []},
            {"name": "Indore", "image_url": "", "locations": []},
            {"name": "Jabalpur", "image_url": "", "locations": []},
            {"name": "Gwalior", "image_url": "", "locations": []},
            {"name": "Ujjain", "image_url": "", "locations": []},
            {"name": "Sagar", "image_url": "", "locations": []},
            {"name": "Dewas", "image_url": "", "locations": []},
            {"name": "Satna", "image_url": "", "locations": []},
            {"name": "Ratlam", "image_url": "", "locations": []},
            {"name": "Rewa", "image_url": "", "locations": []},
            {"name": "Murwara", "image_url": "", "locations": []},
            {"name": "Singrauli", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Maharashtra",
        "cities": [
            {
                "name": "Mumbai",
                "image_url": "",
                "locations": [
                    {
                        "name": "Bandra", 
                        "image_url": "",
                        "reviews": [
                            {
                                "id": 1,
                                "user": "traveler123",
                                "text": "Amazing neighborhood! Great cafes and restaurants. The Bandra Bandstand is perfect for evening walks.",
                                "likes_by": ["user1", "user2"],
                                "dislikes_by": []
                            },
                            {
                                "id": 2,
                                "user": "foodie_here",
                                "text": "Best food scene in Mumbai! So many trendy restaurants and street food options.",
                                "likes_by": ["user3"],
                                "dislikes_by": []
                            }
                        ],
                        "apartments": [
                            {"name": "Oberoi Springs", "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop"},
                            {"name": "DLH Enclave", "image_url": "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400&h=300&fit=crop"},
                            {"name": "Sahara Star PG", "image_url": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&h=300&fit=crop"},
                            {"name": "Sunshine Hostel", "image_url": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop"}
                        ]
                    },
                    {
                        "name": "Andheri", 
                        "image_url": "",
                        "reviews": [
                            {
                                "id": 3,
                                "user": "business_pro",
                                "text": "Great for business travelers. Many corporate offices and good connectivity.",
                                "likes_by": ["user4"],
                                "dislikes_by": []
                            }
                        ]
                    }
                ]
            },
            {"name": "Pune", "image_url": "", "locations": []},
            {"name": "Nagpur", "image_url": "", "locations": []},
            {"name": "Thane", "image_url": "", "locations": []},
            {"name": "Nashik", "image_url": "", "locations": []},
            {"name": "Aurangabad", "image_url": "", "locations": []},
            {"name": "Solapur", "image_url": "", "locations": []},
            {"name": "Kolhapur", "image_url": "", "locations": []},
            {"name": "Amravati", "image_url": "", "locations": []},
            {"name": "Nanded", "image_url": "", "locations": []},
            {"name": "Sangli", "image_url": "", "locations": []},
            {"name": "Jalgaon", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Manipur",
        "cities": [
            {"name": "Imphal", "image_url": "", "locations": []},
            {"name": "Thoubal", "image_url": "", "locations": []},
            {"name": "Bishnupur", "image_url": "", "locations": []},
            {"name": "Churachandpur", "image_url": "", "locations": []},
            {"name": "Senapati", "image_url": "", "locations": []},
            {"name": "Tamenglong", "image_url": "", "locations": []},
            {"name": "Chandel", "image_url": "", "locations": []},
            {"name": "Ukhrul", "image_url": "", "locations": []},
            {"name": "Kangpokpi", "image_url": "", "locations": []},
            {"name": "Jiribam", "image_url": "", "locations": []},
            {"name": "Kakching", "image_url": "", "locations": []},
            {"name": "Kamjong", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Meghalaya",
        "cities": [
            {"name": "Shillong", "image_url": "", "locations": []},
            {"name": "Tura", "image_url": "", "locations": []},
            {"name": "Jowai", "image_url": "", "locations": []},
            {"name": "Nongstoin", "image_url": "", "locations": []},
            {"name": "Williamnagar", "image_url": "", "locations": []},
            {"name": "Nongpoh", "image_url": "", "locations": []},
            {"name": "Baghmara", "image_url": "", "locations": []},
            {"name": "Resubelpara", "image_url": "", "locations": []},
            {"name": "Mairang", "image_url": "", "locations": []},
            {"name": "Ampati", "image_url": "", "locations": []},
            {"name": "Mawkyrwat", "image_url": "", "locations": []},
            {"name": "Khliehriat", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Mizoram",
        "cities": [
            {"name": "Aizawl", "image_url": "", "locations": []},
            {"name": "Lunglei", "image_url": "", "locations": []},
            {"name": "Saiha", "image_url": "", "locations": []},
            {"name": "Champhai", "image_url": "", "locations": []},
            {"name": "Kolasib", "image_url": "", "locations": []},
            {"name": "Serchhip", "image_url": "", "locations": []},
            {"name": "Lawngtlai", "image_url": "", "locations": []},
            {"name": "Mamit", "image_url": "", "locations": []},
            {"name": "Saitual", "image_url": "", "locations": []},
            {"name": "Khawzawl", "image_url": "", "locations": []},
            {"name": "Hnahthial", "image_url": "", "locations": []},
            {"name": "Siaha", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Nagaland",
        "cities": [
            {"name": "Kohima", "image_url": "", "locations": []},
            {"name": "Dimapur", "image_url": "", "locations": []},
            {"name": "Mokokchung", "image_url": "", "locations": []},
            {"name": "Tuensang", "image_url": "", "locations": []},
            {"name": "Wokha", "image_url": "", "locations": []},
            {"name": "Zunheboto", "image_url": "", "locations": []},
            {"name": "Phek", "image_url": "", "locations": []},
            {"name": "Mon", "image_url": "", "locations": []},
            {"name": "Longleng", "image_url": "", "locations": []},
            {"name": "Kiphire", "image_url": "", "locations": []},
            {"name": "Peren", "image_url": "", "locations": []},
            {"name": "Noklak", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Odisha",
        "cities": [
            {"name": "Bhubaneswar", "image_url": "", "locations": []},
            {"name": "Cuttack", "image_url": "", "locations": []},
            {"name": "Rourkela", "image_url": "", "locations": []},
            {"name": "Brahmapur", "image_url": "", "locations": []},
            {"name": "Sambalpur", "image_url": "", "locations": []},
            {"name": "Puri", "image_url": "", "locations": []},
            {"name": "Baleshwar", "image_url": "", "locations": []},
            {"name": "Baripada", "image_url": "", "locations": []},
            {"name": "Bhadrak", "image_url": "", "locations": []},
            {"name": "Balangir", "image_url": "", "locations": []},
            {"name": "Jharsuguda", "image_url": "", "locations": []},
            {"name": "Bargarh", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Punjab",
        "cities": [
            {"name": "Ludhiana", "image_url": "", "locations": []},
            {"name": "Amritsar", "image_url": "", "locations": []},
            {"name": "Jalandhar", "image_url": "", "locations": []},
            {"name": "Patiala", "image_url": "", "locations": []},
            {"name": "Bathinda", "image_url": "", "locations": []},
            {"name": "Pathankot", "image_url": "", "locations": []},
            {"name": "Hoshiarpur", "image_url": "", "locations": []},
            {"name": "Moga", "image_url": "", "locations": []},
            {"name": "Firozpur", "image_url": "", "locations": []},
            {"name": "Sangrur", "image_url": "", "locations": []},
            {"name": "Faridkot", "image_url": "", "locations": []},
            {"name": "Gurdaspur", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Rajasthan",
        "cities": [
            {"name": "Jaipur", "image_url": "", "locations": []},
            {"name": "Jodhpur", "image_url": "", "locations": []},
            {"name": "Kota", "image_url": "", "locations": []},
            {"name": "Bikaner", "image_url": "", "locations": []},
            {"name": "Ajmer", "image_url": "", "locations": []},
            {"name": "Udaipur", "image_url": "", "locations": []},
            {"name": "Bhilwara", "image_url": "", "locations": []},
            {"name": "Alwar", "image_url": "", "locations": []},
            {"name": "Sikar", "image_url": "", "locations": []},
            {"name": "Sri Ganganagar", "image_url": "", "locations": []},
            {"name": "Pali", "image_url": "", "locations": []},
            {"name": "Tonk", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Sikkim",
        "cities": [
            {"name": "Gangtok", "image_url": "", "locations": []},
            {"name": "Namchi", "image_url": "", "locations": []},
            {"name": "Gyalshing", "image_url": "", "locations": []},
            {"name": "Mangan", "image_url": "", "locations": []},
            {"name": "Ravongla", "image_url": "", "locations": []},
            {"name": "Jorethang", "image_url": "", "locations": []},
            {"name": "Rangpo", "image_url": "", "locations": []},
            {"name": "Singtam", "image_url": "", "locations": []},
            {"name": "Pakyong", "image_url": "", "locations": []},
            {"name": "Soreng", "image_url": "", "locations": []},
            {"name": "Lachen", "image_url": "", "locations": []},
            {"name": "Lachung", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Tamil Nadu",
        "cities": [
            {"name": "Chennai", "image_url": "", "locations": []},
            {"name": "Coimbatore", "image_url": "", "locations": []},
            {"name": "Madurai", "image_url": "", "locations": []},
            {"name": "Salem", "image_url": "", "locations": []},
            {"name": "Tiruchirappalli", "image_url": "", "locations": []},
            {"name": "Vellore", "image_url": "", "locations": []},
            {"name": "Erode", "image_url": "", "locations": []},
            {"name": "Tiruppur", "image_url": "", "locations": []},
            {"name": "Thoothukkudi", "image_url": "", "locations": []},
            {"name": "Dindigul", "image_url": "", "locations": []},
            {"name": "Thanjavur", "image_url": "", "locations": []},
            {"name": "Ranipet", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Telangana",
        "cities": [
            {"name": "Hyderabad", "image_url": "", "locations": []},
            {"name": "Warangal", "image_url": "", "locations": []},
            {"name": "Nizamabad", "image_url": "", "locations": []},
            {"name": "Karimnagar", "image_url": "", "locations": []},
            {"name": "Ramagundam", "image_url": "", "locations": []},
            {"name": "Khammam", "image_url": "", "locations": []},
            {"name": "Mahbubnagar", "image_url": "", "locations": []},
            {"name": "Nalgonda", "image_url": "", "locations": []},
            {"name": "Adilabad", "image_url": "", "locations": []},
            {"name": "Siddipet", "image_url": "", "locations": []},
            {"name": "Suryapet", "image_url": "", "locations": []},
            {"name": "Jagtial", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Tripura",
        "cities": [
            {"name": "Agartala", "image_url": "", "locations": []},
            {"name": "Udaipur", "image_url": "", "locations": []},
            {"name": "Dharmanagar", "image_url": "", "locations": []},
            {"name": "Kailasahar", "image_url": "", "locations": []},
            {"name": "Belonia", "image_url": "", "locations": []},
            {"name": "Khowai", "image_url": "", "locations": []},
            {"name": "Ambassa", "image_url": "", "locations": []},
            {"name": "Sabroom", "image_url": "", "locations": []},
            {"name": "Kamalpur", "image_url": "", "locations": []},
            {"name": "Teliamura", "image_url": "", "locations": []},
            {"name": "Amarpur", "image_url": "", "locations": []},
            {"name": "Kumarghat", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Uttar Pradesh",
        "cities": [
            {"name": "Lucknow", "image_url": "", "locations": []},
            {"name": "Kanpur", "image_url": "", "locations": []},
            {"name": "Ghaziabad", "image_url": "", "locations": []},
            {"name": "Agra", "image_url": "", "locations": []},
            {"name": "Varanasi", "image_url": "", "locations": []},
            {"name": "Meerut", "image_url": "", "locations": []},
            {"name": "Allahabad", "image_url": "", "locations": []},
            {"name": "Bareilly", "image_url": "", "locations": []},
            {"name": "Aligarh", "image_url": "", "locations": []},
            {"name": "Moradabad", "image_url": "", "locations": []},
            {"name": "Saharanpur", "image_url": "", "locations": []},
            {"name": "Gorakhpur", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "Uttarakhand",
        "cities": [
            {"name": "Dehradun", "image_url": "", "locations": []},
            {"name": "Haridwar", "image_url": "", "locations": []},
            {"name": "Roorkee", "image_url": "", "locations": []},
            {"name": "Haldwani", "image_url": "", "locations": []},
            {"name": "Rudrapur", "image_url": "", "locations": []},
            {"name": "Kashipur", "image_url": "", "locations": []},
            {"name": "Rishikesh", "image_url": "", "locations": []},
            {"name": "Kotdwar", "image_url": "", "locations": []},
            {"name": "Ramnagar", "image_url": "", "locations": []},
            {"name": "Pithoragarh", "image_url": "", "locations": []},
            {"name": "Manglaur", "image_url": "", "locations": []},
            {"name": "Nainital", "image_url": "", "locations": []}
        ]
    },
    {
        "name": "West Bengal",
        "cities": [
            {"name": "Kolkata", "image_url": "", "locations": []},
            {"name": "Howrah", "image_url": "", "locations": []},
            {"name": "Durgapur", "image_url": "", "locations": []},
            {"name": "Asansol", "image_url": "", "locations": []},
            {"name": "Siliguri", "image_url": "", "locations": []},
            {"name": "Bardhaman", "image_url": "", "locations": []},
            {"name": "Malda", "image_url": "", "locations": []},
            {"name": "Baharampur", "image_url": "", "locations": []},
            {"name": "Habra", "image_url": "", "locations": []},
            {"name": "Kharagpur", "image_url": "", "locations": []},
            {"name": "Shantipur", "image_url": "", "locations": []},
            {"name": "Dankuni", "image_url": "", "locations": []}
        ]
    }
]

# Moderator credentials
MODERATOR_USERNAME = "MODERATOR1"
MODERATOR_PASSWORD = "12345678"

# Helper function to check if user is moderator
def is_moderator(username):
    return username == MODERATOR_USERNAME

# Helper function to fetch image from internet
def fetch_image_url(query):
    try:
        # Dictionary of city-specific image URLs for major Indian cities
        city_images = {
            # Major metropolitan cities
            "mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "bangalore": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "chennai": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "kolkata": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "hyderabad": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "pune": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "ahmedabad": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "jaipur": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "lucknow": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "kanpur": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "nagpur": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "indore": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "thane": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "bhopal": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "visakhapatnam": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "patna": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "vadodara": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "ghaziabad": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "ludhiana": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "agra": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "nashik": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "ranchi": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "faridabad": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "aurangabad": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "rourkela": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "durgapur": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "amritsar": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "allahabad": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "howrah": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "coimbatore": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "jabalpur": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "gwalior": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "vijayawada": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "jodhpur": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "madurai": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "raipur": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "kota": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "guwahati": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "chandigarh": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "mysore": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "bhubaneswar": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "salem": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "gurgaon": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "aligarh": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "guntur": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "bareilly": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "varanasi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "moradabad": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "srinagar": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "dhanbad": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "amravati": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "kolhapur": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "ajmer": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "gulbarga": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "jamnagar": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "udaipur": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "bhilai": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "sangli": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "jalgaon": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "bikaner": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "warangal": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "cuttack": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "bhilwara": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "firozpur": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "kochi": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "bhavnagar": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "dehradun": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "durg": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "asansol": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "nanded": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "bilaspur": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "shimla": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "gorakhpur": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "siliguri": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "tiruchirappalli": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "bharuch": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "pondicherry": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "thiruvananthapuram": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "panaji": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
            "imphal": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "shillong": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "aizawl": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "kohima": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "gangtok": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
            "agartala": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "itanagar": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "dispur": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop",
            "gandhinagar": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop"
        }
        
        # Return city-specific image if available, otherwise return a default image
        query_lower = query.lower()
        for city_name, image_url in city_images.items():
            if city_name in query_lower:
                return image_url
        
        # If no specific match found, return a default image
        return "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop"
    except:
        return "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop"

# User registration
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    if username in users:
        return jsonify({'error': 'Username already exists'}), 400
    users[username] = {'password': password}
    save_users()
    return jsonify({'message': 'User registered successfully'})

# User login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    # Check for moderator login
    if username == MODERATOR_USERNAME and password == MODERATOR_PASSWORD:
        token = str(uuid.uuid4())
        sessions[token] = username
        return jsonify({'token': token, 'username': username, 'role': 'moderator'})
    
    # Reload users from file in case of external changes
    load_users()
    # Check for regular user login
    if username not in users or users[username]['password'] != password:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    token = str(uuid.uuid4())
    sessions[token] = username
    return jsonify({'token': token, 'username': username, 'role': 'user'})

# Get all cities
@app.route('/states', methods=['GET'])
def get_states():
    """Get all states with their cities, locations and reviews"""
    return jsonify(states)

# Get locations for a city in a state
@app.route('/states/<state_name>/cities/<city_name>/locations', methods=['GET'])
def get_locations(state_name, city_name):
    state = next((s for s in states if s['name'].lower() == state_name.lower()), None)
    if not state:
        return jsonify({'error': 'State not found'}), 404
    city = next((c for c in state['cities'] if c['name'].lower() == city_name.lower()), None)
    if not city:
        return jsonify({'error': 'City not found'}), 404
    return jsonify([{'name': l['name']} for l in city['locations']])

# Get reviews for a location
@app.route('/states/<state_name>/cities/<city_name>/locations/<location_name>/reviews', methods=['GET'])
def get_reviews(state_name, city_name, location_name):
    state = next((s for s in states if s['name'].lower() == state_name.lower()), None)
    if not state:
        return jsonify({'error': 'State not found'}), 404
    city = next((c for c in state['cities'] if c['name'].lower() == city_name.lower()), None)
    if not city:
        return jsonify({'error': 'City not found'}), 404
    location = next((l for l in city['locations'] if l['name'].lower() == location_name.lower()), None)
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    # Only return user-submitted reviews
    return jsonify([
        {k: v for k, v in r.items() if k != 'likes_by' and k != 'dislikes_by'} | {
            'likes': len(r.get('likes_by', [])),
            'dislikes': len(r.get('dislikes_by', []))
        }
        for r in location['reviews']
    ])

# Add a review to a location
@app.route('/states/<state_name>/cities/<city_name>/locations/<location_name>/reviews', methods=['POST'])
def add_review(state_name, city_name, location_name):
    data = request.json
    user = data.get('user')
    text = data.get('text')
    if not user or not text:
        return jsonify({'error': 'User and text required'}), 400
    state = next((s for s in states if s['name'].lower() == state_name.lower()), None)
    if not state:
        return jsonify({'error': 'State not found'}), 404
    city = next((c for c in state['cities'] if c['name'].lower() == city_name.lower()), None)
    if not city:
        return jsonify({'error': 'City not found'}), 404
    location = next((l for l in city['locations'] if l['name'].lower() == location_name.lower()), None)
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    new_id = max([r['id'] for r in location['reviews']] + [0]) + 1
    review = {'id': new_id, 'user': user, 'text': text, 'likes_by': [], 'dislikes_by': []}
    location['reviews'].insert(0, review)
    return jsonify({'id': new_id, 'user': user, 'text': text, 'likes': 0, 'dislikes': 0}), 201

# Like a review (user can only like or dislike, not both)
@app.route('/states/<state_name>/cities/<city_name>/locations/<location_name>/reviews/<int:review_id>/like', methods=['POST'])
def like_review(state_name, city_name, location_name, review_id):
    data = request.json
    user = data.get('user')
    if not user:
        return jsonify({'error': 'User required'}), 400
    state = next((s for s in states if s['name'].lower() == state_name.lower()), None)
    if not state:
        return jsonify({'error': 'State not found'}), 404
    city = next((c for c in state['cities'] if c['name'].lower() == city_name.lower()), None)
    if not city:
        return jsonify({'error': 'City not found'}), 404
    location = next((l for l in city['locations'] if l['name'].lower() == location_name.lower()), None)
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    review = next((r for r in location['reviews'] if r['id'] == review_id), None)
    if not review:
        return jsonify({'error': 'Review not found'}), 404
    if user in review.get('dislikes_by', []):
        review['dislikes_by'].remove(user)
    if user not in review.get('likes_by', []):
        review['likes_by'].append(user)
    return jsonify({'likes': len(review['likes_by']), 'dislikes': len(review['dislikes_by'])})

# Dislike a review (user can only like or dislike, not both)
@app.route('/states/<state_name>/cities/<city_name>/locations/<location_name>/reviews/<int:review_id>/dislike', methods=['POST'])
def dislike_review(state_name, city_name, location_name, review_id):
    data = request.json
    user = data.get('user')
    if not user:
        return jsonify({'error': 'User required'}), 400
    state = next((s for s in states if s['name'].lower() == state_name.lower()), None)
    if not state:
        return jsonify({'error': 'State not found'}), 404
    city = next((c for c in state['cities'] if c['name'].lower() == city_name.lower()), None)
    if not city:
        return jsonify({'error': 'City not found'}), 404
    location = next((l for l in city['locations'] if l['name'].lower() == location_name.lower()), None)
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    review = next((r for r in location['reviews'] if r['id'] == review_id), None)
    if not review:
        return jsonify({'error': 'Review not found'}), 404
    if user in review.get('likes_by', []):
        review['likes_by'].remove(user)
    if user not in review.get('dislikes_by', []):
        review['dislikes_by'].append(user)
    return jsonify({'likes': len(review['likes_by']), 'dislikes': len(review['dislikes_by'])})

# ===== MODERATOR ENDPOINTS =====

# Add a new city to a state (moderator only)
@app.route('/admin/states/<state_name>/cities', methods=['POST'])
def add_city(state_name):
    data = request.json
    username = data.get('username')
    city_name = data.get('name')
    image_url = data.get('image_url', '')
    
    if not username or not is_moderator(username):
        return jsonify({'error': 'Unauthorized - Moderator access required'}), 403
    
    if not city_name:
        return jsonify({'error': 'City name required'}), 400
    
    state = next((s for s in states if s['name'].lower() == state_name.lower()), None)
    if not state:
        return jsonify({'error': 'State not found'}), 404
    
    # Check if city already exists in this state
    if any(c['name'].lower() == city_name.lower() for c in state['cities']):
        return jsonify({'error': 'City already exists in this state'}), 400
    
    new_city = {'name': city_name, 'image_url': image_url, 'locations': []}
    state['cities'].append(new_city)
    return jsonify({'message': 'City added successfully', 'city': new_city}), 201

# Edit a city (moderator only)
@app.route('/admin/states/<state_name>/cities/<city_name>', methods=['PUT'])
def edit_city(state_name, city_name):
    data = request.json
    username = data.get('username')
    new_name = data.get('name')
    image_url = data.get('image_url', '')
    
    if not username or not is_moderator(username):
        return jsonify({'error': 'Unauthorized - Moderator access required'}), 403
    
    if not new_name:
        return jsonify({'error': 'New city name required'}), 400
    
    state = next((s for s in states if s['name'].lower() == state_name.lower()), None)
    if not state:
        return jsonify({'error': 'State not found'}), 404
    
    city = next((c for c in state['cities'] if c['name'].lower() == city_name.lower()), None)
    if not city:
        return jsonify({'error': 'City not found'}), 404
    
    # Check if new name already exists in this state
    if any(c['name'].lower() == new_name.lower() and c['name'].lower() != city_name.lower() for c in state['cities']):
        return jsonify({'error': 'City name already exists in this state'}), 400
    
    city['name'] = new_name
    if image_url:
        city['image_url'] = image_url
    return jsonify({'message': 'City updated successfully', 'city': city})

# Delete a city (moderator only)
@app.route('/admin/states/<state_name>/cities/<city_name>', methods=['DELETE'])
def delete_city(state_name, city_name):
    data = request.json
    username = data.get('username')
    
    if not username or not is_moderator(username):
        return jsonify({'error': 'Unauthorized - Moderator access required'}), 403
    
    state = next((s for s in states if s['name'].lower() == state_name.lower()), None)
    if not state:
        return jsonify({'error': 'State not found'}), 404
    
    city = next((c for c in state['cities'] if c['name'].lower() == city_name.lower()), None)
    if not city:
        return jsonify({'error': 'City not found'}), 404
    
    state['cities'].remove(city)
    return jsonify({'message': 'City deleted successfully'})

# Add a location to a city (moderator only)
@app.route('/admin/states/<state_name>/cities/<city_name>/locations', methods=['POST'])
def add_location(state_name, city_name):
    data = request.json
    username = data.get('username')
    location_name = data.get('name')
    image_url = data.get('image_url', '')
    
    if not username or not is_moderator(username):
        return jsonify({'error': 'Unauthorized - Moderator access required'}), 403
    
    if not location_name:
        return jsonify({'error': 'Location name required'}), 400
    
    state = next((s for s in states if s['name'].lower() == state_name.lower()), None)
    if not state:
        return jsonify({'error': 'State not found'}), 404
    
    city = next((c for c in state['cities'] if c['name'].lower() == city_name.lower()), None)
    if not city:
        return jsonify({'error': 'City not found'}), 404
    
    # Check if location already exists
    if any(l['name'].lower() == location_name.lower() for l in city['locations']):
        return jsonify({'error': 'Location already exists'}), 400
    
    new_location = {'name': location_name, 'image_url': image_url, 'reviews': [], 'apartments': []}
    city['locations'].append(new_location)
    return jsonify({'message': 'Location added successfully', 'location': new_location}), 201

# Edit a location (moderator only)
@app.route('/admin/states/<state_name>/cities/<city_name>/locations/<location_name>', methods=['PUT'])
def edit_location(state_name, city_name, location_name):
    data = request.json
    username = data.get('username')
    new_name = data.get('name')
    image_url = data.get('image_url', '')
    
    if not username or not is_moderator(username):
        return jsonify({'error': 'Unauthorized - Moderator access required'}), 403
    
    if not new_name:
        return jsonify({'error': 'New location name required'}), 400
    
    state = next((s for s in states if s['name'].lower() == state_name.lower()), None)
    if not state:
        return jsonify({'error': 'State not found'}), 404
    
    city = next((c for c in state['cities'] if c['name'].lower() == city_name.lower()), None)
    if not city:
        return jsonify({'error': 'City not found'}), 404
    
    location = next((l for l in city['locations'] if l['name'].lower() == location_name.lower()), None)
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    
    # Check if new name already exists
    if any(l['name'].lower() == new_name.lower() and l['name'].lower() != location_name.lower() for l in city['locations']):
        return jsonify({'error': 'Location name already exists'}), 400
    
    location['name'] = new_name
    if image_url:
        location['image_url'] = image_url
    return jsonify({'message': 'Location updated successfully', 'location': location})

# Delete a location (moderator only)
@app.route('/admin/states/<state_name>/cities/<city_name>/locations/<location_name>', methods=['DELETE'])
def delete_location(state_name, city_name, location_name):
    data = request.json
    username = data.get('username')
    
    if not username or not is_moderator(username):
        return jsonify({'error': 'Unauthorized - Moderator access required'}), 403
    
    state = next((s for s in states if s['name'].lower() == state_name.lower()), None)
    if not state:
        return jsonify({'error': 'State not found'}), 404
    
    city = next((c for c in state['cities'] if c['name'].lower() == city_name.lower()), None)
    if not city:
        return jsonify({'error': 'City not found'}), 404
    
    location = next((l for l in city['locations'] if l['name'].lower() == location_name.lower()), None)
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    
    city['locations'].remove(location)
    return jsonify({'message': 'Location deleted successfully'})

# Edit a review (moderator only)
@app.route('/admin/states/<state_name>/cities/<city_name>/locations/<location_name>/reviews/<int:review_id>', methods=['PUT'])
def edit_review(state_name, city_name, location_name, review_id):
    data = request.json
    username = data.get('username')
    new_text = data.get('text')
    
    if not username or not is_moderator(username):
        return jsonify({'error': 'Unauthorized - Moderator access required'}), 403
    
    if not new_text:
        return jsonify({'error': 'Review text required'}), 400
    
    state = next((s for s in states if s['name'].lower() == state_name.lower()), None)
    if not state:
        return jsonify({'error': 'State not found'}), 404
    
    city = next((c for c in state['cities'] if c['name'].lower() == city_name.lower()), None)
    if not city:
        return jsonify({'error': 'City not found'}), 404
    
    location = next((l for l in city['locations'] if l['name'].lower() == location_name.lower()), None)
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    
    review = next((r for r in location['reviews'] if r['id'] == review_id), None)
    if not review:
        return jsonify({'error': 'Review not found'}), 404
    
    review['text'] = new_text
    return jsonify({'message': 'Review updated successfully', 'review': review})

# Delete a review (moderator only)
@app.route('/admin/states/<state_name>/cities/<city_name>/locations/<location_name>/reviews/<int:review_id>', methods=['DELETE'])
def delete_review(state_name, city_name, location_name, review_id):
    data = request.json
    username = data.get('username')
    
    if not username or not is_moderator(username):
        return jsonify({'error': 'Unauthorized - Moderator access required'}), 403
    
    state = next((s for s in states if s['name'].lower() == state_name.lower()), None)
    if not state:
        return jsonify({'error': 'State not found'}), 404
    
    city = next((c for c in state['cities'] if c['name'].lower() == city_name.lower()), None)
    if not city:
        return jsonify({'error': 'City not found'}), 404
    
    location = next((l for l in city['locations'] if l['name'].lower() == location_name.lower()), None)
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    
    review = next((r for r in location['reviews'] if r['id'] == review_id), None)
    if not review:
        return jsonify({'error': 'Review not found'}), 404
    
    location['reviews'].remove(review)
    return jsonify({'message': 'Review deleted successfully'})

# Moderator endpoints for apartments under a locality
@app.route('/admin/states/<state_name>/cities/<city_name>/locations/<location_name>/apartments', methods=['POST'])
def add_apartment(state_name, city_name, location_name):
    data = request.json
    username = data.get('username')
    apartment_name = data.get('name')
    image_url = data.get('image_url', '')
    if not username or not is_moderator(username):
        return jsonify({'error': 'Unauthorized - Moderator access required'}), 403
    if not apartment_name:
        return jsonify({'error': 'Apartment name required'}), 400
    state = next((s for s in states if s['name'].lower() == state_name.lower()), None)
    if not state:
        return jsonify({'error': 'State not found'}), 404
    city = next((c for c in state['cities'] if c['name'].lower() == city_name.lower()), None)
    if not city:
        return jsonify({'error': 'City not found'}), 404
    location = next((l for l in city['locations'] if l['name'].lower() == location_name.lower()), None)
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    if 'apartments' not in location:
        location['apartments'] = []
    if any(a['name'].lower() == apartment_name.lower() for a in location['apartments']):
        return jsonify({'error': 'Apartment already exists'}), 400
    new_apartment = {'name': apartment_name, 'image_url': image_url}
    location['apartments'].append(new_apartment)
    return jsonify({'message': 'Apartment added successfully', 'apartment': new_apartment}), 201

@app.route('/admin/states/<state_name>/cities/<city_name>/locations/<location_name>/apartments/<apartment_name>', methods=['PUT'])
def edit_apartment(state_name, city_name, location_name, apartment_name):
    data = request.json
    username = data.get('username')
    new_name = data.get('name')
    image_url = data.get('image_url', '')
    if not username or not is_moderator(username):
        return jsonify({'error': 'Unauthorized - Moderator access required'}), 403
    if not new_name:
        return jsonify({'error': 'New apartment name required'}), 400
    state = next((s for s in states if s['name'].lower() == state_name.lower()), None)
    if not state:
        return jsonify({'error': 'State not found'}), 404
    city = next((c for c in state['cities'] if c['name'].lower() == city_name.lower()), None)
    if not city:
        return jsonify({'error': 'City not found'}), 404
    location = next((l for l in city['locations'] if l['name'].lower() == location_name.lower()), None)
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    apartment = next((a for a in location.get('apartments', []) if a['name'].lower() == apartment_name.lower()), None)
    if not apartment:
        return jsonify({'error': 'Apartment not found'}), 404
    if any(a['name'].lower() == new_name.lower() and a['name'].lower() != apartment_name.lower() for a in location['apartments']):
        return jsonify({'error': 'Apartment name already exists'}), 400
    apartment['name'] = new_name
    if image_url:
        apartment['image_url'] = image_url
    return jsonify({'message': 'Apartment updated successfully', 'apartment': apartment})

@app.route('/admin/states/<state_name>/cities/<city_name>/locations/<location_name>/apartments/<apartment_name>', methods=['DELETE'])
def delete_apartment(state_name, city_name, location_name, apartment_name):
    data = request.json
    username = data.get('username')
    if not username or not is_moderator(username):
        return jsonify({'error': 'Unauthorized - Moderator access required'}), 403
    state = next((s for s in states if s['name'].lower() == state_name.lower()), None)
    if not state:
        return jsonify({'error': 'State not found'}), 404
    city = next((c for c in state['cities'] if c['name'].lower() == city_name.lower()), None)
    if not city:
        return jsonify({'error': 'City not found'}), 404
    location = next((l for l in city['locations'] if l['name'].lower() == location_name.lower()), None)
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    apartment = next((a for a in location.get('apartments', []) if a['name'].lower() == apartment_name.lower()), None)
    if not apartment:
        return jsonify({'error': 'Apartment not found'}), 404
    location['apartments'].remove(apartment)
    return jsonify({'message': 'Apartment deleted successfully'})

# Get image for a city or location
@app.route('/api/fetch-image/<query>', methods=['GET'])
def get_image(query):
    image_url = fetch_image_url(query)
    if image_url:
        return jsonify({'image_url': image_url})
    else:
        return jsonify({'error': 'No image found'}), 404

# Get all data for moderator dashboard
@app.route('/admin/dashboard', methods=['GET'])
def get_dashboard_data():
    return jsonify({
        'states': states,
        'total_states': len(states),
        'total_cities': sum(len(s['cities']) for s in states),
        'total_locations': sum(len(c['locations']) for s in states for c in s['cities']),
        'total_reviews': sum(len(l['reviews']) for s in states for c in s['cities'] for l in c['locations'])
    })

# Helper lists for locality and apartment name generation
LOCALITY_NAMES = [
    "Green Park", "Sunshine Colony", "Lake View", "Hilltop", "Central Avenue", "Silver Oaks", "Royal Enclave", "Urban Heights", "Palm Grove", "Garden City", "Riverfront", "Maple Residency"
]
APARTMENT_NAMES = [
    "Sai Residency", "Green Meadows", "Blue Bay Apartments", "Sunshine Towers", "Royal Residency", "Urban Nest", "Palm Springs", "Hill View Apartments", "Lotus Residency", "Oceanic Apartments", "Sunrise Towers", "Madhura Enclave"
]
PARKS_LANDMARKS = [
    "Central Park", "City Garden", "Sunset Lake", "Hilltop Viewpoint", "Silver Mall", "Royal Plaza", "Urban Sports Complex", "Palm Shopping Center", "Riverfront Walk", "Maple Library"
]
APARTMENT_IMAGES = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop"
]

# Function to generate localities and apartments for a city, with detailed descriptions
def generate_localities_and_apartments(city_name):
    localities = []
    used_localities = set()
    for _ in range(random.randint(5, 6)):
        # Pick a unique locality name
        while True:
            loc_name = random.choice(LOCALITY_NAMES)
            if loc_name not in used_localities:
                used_localities.add(loc_name)
                break
        apartments = []
        used_apartments = set()
        for _ in range(4):
            # Pick a unique apartment name
            while True:
                apt_name = random.choice(APARTMENT_NAMES)
                if apt_name not in used_apartments:
                    used_apartments.add(apt_name)
                    break
            park_landmark = random.choice(PARKS_LANDMARKS)
            market_distance = round(random.uniform(0.5, 2.5), 1)
            station_distance = round(random.uniform(1.0, 6.0), 1)
            description = (
                f"Located in {loc_name}, {city_name}. Overlooks {park_landmark}. "
                f"Close to main market ({market_distance} km) and railway station ({station_distance} km). "
                f"Spacious, well-ventilated, and ideal for families or professionals."
            )
            apartments.append({
                "name": apt_name,
                "image_url": random.choice(APARTMENT_IMAGES),
                "rent": random.randint(12000, 25000),
                "description": description
            })
        localities.append({
            "name": loc_name,
            "image_url": "",
            "apartments": apartments,
            "reviews": []
        })
    return localities

# Update all cities in all states with generated localities and apartments (with detailed descriptions)
for state in states:
    for city in state["cities"]:
        city["locations"] = generate_localities_and_apartments(city["name"])

# Function to update rent and description for all apartments in all localities
def update_apartment_rent_and_description():
    for state in states:
        for city in state["cities"]:
            city_name = city["name"]
            for locality in city.get("locations", []):
                loc_name = locality["name"]
                for apartment in locality.get("apartments", []):
                    # Add or update rent
                    if "rent" not in apartment:
                        apartment["rent"] = random.randint(12000, 25000)
                    # Add or update description
                    park_landmark = random.choice(PARKS_LANDMARKS)
                    market_distance = round(random.uniform(0.5, 2.5), 1)
                    station_distance = round(random.uniform(1.0, 6.0), 1)
                    apartment["description"] = (
                        f"Located in {loc_name}, {city_name}. Overlooks {park_landmark}. "
                        f"Close to main market ({market_distance} km) and railway station ({station_distance} km). "
                        f"Spacious, well-ventilated, and ideal for families or professionals."
                    )

# Call the update function after all data is loaded/generated
update_apartment_rent_and_description()

REVIEW_USERNAMES = [
    "Ayushi", "Vanshika", "Rahul", "Priya", "Aarav", "Ananya", "Rohan", "Sneha", "Karan", "Simran", "Amit", "Neha", "Siddharth", "Isha", "Aditya", "Pooja", "Ritika", "Manish", "Divya", "Nikhil", "Shreya", "Aakash", "Megha", "Saurabh", "Tanvi", "Arjun", "Swati", "Rajat", "Ishita", "Deepak", "Kavya", "Yash", "Aditi", "Sanya", "Harsh", "Riya", "Sahil", "Nisha", "Abhishek", "Pallavi", "Gaurav", "Tanya", "Rakesh", "Bhavna", "Vivek", "Payal", "Sandeep", "Juhi", "Raj", "Mitali", "Aman", "Preeti", "Kunal", "Shalini", "Varun", "Komal", "Ravi", "Sheetal", "Mayank", "Priti"
]
REVIEW_TEXTS_GOOD = [
    "Amazing neighborhood! Great cafes and restaurants.",
    "Very safe and family-friendly area.",
    "Loved the parks and green spaces nearby.",
    "Excellent connectivity and public transport.",
    "Peaceful and clean locality.",
    "Markets and shops are very close.",
    "Neighbors are friendly and helpful.",
    "Lots of amenities and things to do."
]
REVIEW_TEXTS_BAD = [
    "Too noisy at night, hard to sleep.",
    "Parking is a big problem here.",
    "Area feels a bit unsafe after dark.",
    "Too much traffic during rush hour.",
    "Not enough green spaces.",
    "Water supply issues sometimes.",
    "Expensive rent for what you get.",
    "Garbage collection is irregular."
]
REVIEW_TEXTS_NEUTRAL = [
    "Decent place, but nothing special.",
    "Average experience overall.",
    "Good for students, but not for families.",
    "Shops are okay, but could be better.",
    "Mixed crowd, can be lively or quiet."
]

def add_reviews_to_localities():
    for state in states:
        for city in state["cities"]:
            for locality in city.get("locations", []):
                reviews = locality.get("reviews", [])
                used_names = set(r.get("user") for r in reviews)
                available_names = [n for n in REVIEW_USERNAMES if n not in used_names]
                # Only add if less than 5 reviews
                while len(reviews) < 5 or (len(reviews) < 10 and random.random() < 0.5):
                    if not available_names:
                        available_names = REVIEW_USERNAMES.copy()
                    user = available_names.pop(random.randrange(len(available_names)))
                    used_names.add(user)
                    # Pick review type
                    review_type = random.choices(
                        [REVIEW_TEXTS_GOOD, REVIEW_TEXTS_BAD, REVIEW_TEXTS_NEUTRAL],
                        weights=[0.5, 0.3, 0.2], k=1
                    )[0]
                    text = random.choice(review_type)
                    # Likes/dislikes
                    possible_likers = [u for u in REVIEW_USERNAMES if u != user]
                    likes_by = random.sample(possible_likers, random.randint(0, 3))
                    dislikes_by = random.sample([u for u in possible_likers if u not in likes_by], random.randint(0, 2))
                    # Unique review id
                    review_ids = [r.get("id", 0) for r in reviews]
                    new_id = max(review_ids + [0]) + 1
                    review = {
                        "id": new_id,
                        "user": user,
                        "text": text,
                        "likes_by": likes_by,
                        "dislikes_by": dislikes_by
                    }
                    reviews.append(review)
                locality["reviews"] = reviews

add_reviews_to_localities()

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5050)