const accessibilityReports = [
    {
        id: 1,
        placeName: "Amman City Hall",
        score: 92,
        scoreLabel: "Excellent Accessibility",

        summary: [
            "Accessible entrance and entrance ramp were detected.",
            "The main pathway appears wide and free of obstacles.",
            "Accessible parking markings were clearly detected.",
            "Elevator access is available near the main entrance."
        ],

        facilities: [
            {
                name: "Accessible Entrance",
                confidence: "High Confidence"
            },
            {
                name: "Entrance Ramp",
                confidence: "High Confidence"
            },
            {
                name: "Wide Pathway",
                confidence: "High Confidence"
            },
            {
                name: "Accessible Parking",
                confidence: "High Confidence"
            },
            {
                name: "Elevator",
                confidence: "Medium Confidence"
            },
            {
                name: "Accessible Restroom",
                confidence: "Medium Confidence"
            }
        ],

        issues: [
            "A small obstacle may narrow part of the side entrance.",
            "Ramp handrail visibility is limited in one photo.",
            "Restroom turning space could not be fully verified."
        ],

        suggestions: [
            "Keep the entrance route free from temporary obstacles.",
            "Add a clearer side photo of the entrance ramp.",
            "Provide restroom dimensions for stronger verification."
        ]
    },

    {
        id: 2,
        placeName: "Al Noor Medical Center",
        score: 88,
        scoreLabel: "Very Good Accessibility",

        summary: [
            "A level accessible entrance was detected.",
            "The reception area appears spacious.",
            "An elevator is available for upper floors.",
            "Accessible parking is available near the entrance."
        ],

        facilities: [
            {
                name: "Accessible Entrance",
                confidence: "High Confidence"
            },
            {
                name: "Elevator",
                confidence: "High Confidence"
            },
            {
                name: "Wide Reception",
                confidence: "High Confidence"
            },
            {
                name: "Accessible Parking",
                confidence: "Medium Confidence"
            }
        ],

        issues: [
            "Some waiting-area pathways may become crowded.",
            "Accessible restroom information is incomplete."
        ],

        suggestions: [
            "Keep a clear route through the waiting area.",
            "Upload additional accessible restroom photos."
        ]
    },

    {
        id: 3,
        placeName: "Community Hub",
        score: 86,
        scoreLabel: "Very Good Accessibility",

        summary: [
            "The primary entrance is step-free.",
            "Wide internal pathways were detected.",
            "Staff assistance is available.",
            "The entrance has visible directional signs."
        ],

        facilities: [
            {
                name: "Step-Free Entrance",
                confidence: "High Confidence"
            },
            {
                name: "Wide Pathway",
                confidence: "High Confidence"
            },
            {
                name: "Staff Assistance",
                confidence: "Verified"
            },
            {
                name: "Directional Signs",
                confidence: "Medium Confidence"
            }
        ],

        issues: [
            "Accessible parking was not clearly visible.",
            "One internal door may require assistance."
        ],

        suggestions: [
            "Add accessible parking signs near the entrance.",
            "Consider installing an automatic internal door."
        ]
    },

    {
        id: 4,
        placeName: "Jordan National Bank",
        score: 90,
        scoreLabel: "Excellent Accessibility",

        summary: [
            "An accessible entrance ramp was detected.",
            "Accessible parking is available near the entrance.",
            "The main entrance appears wide and step-free.",
            "An elevator is available inside the building."
        ],

        facilities: [
            {
                name: "Entrance Ramp",
                confidence: "High Confidence"
            },
            {
                name: "Accessible Parking",
                confidence: "High Confidence"
            },
            {
                name: "Wide Entrance",
                confidence: "High Confidence"
            },
            {
                name: "Elevator",
                confidence: "High Confidence"
            },
            {
                name: "Staff Assistance",
                confidence: "Verified"
            },
            {
                name: "Accessible Service Desk",
                confidence: "Medium Confidence"
            }
        ],

        issues: [
            "The accessible parking sign may be difficult to see.",
            "One pathway may become crowded during busy hours.",
            "Accessible restroom information is incomplete."
        ],

        suggestions: [
            "Install a larger accessible parking sign.",
            "Keep the internal accessible pathway clear.",
            "Upload additional accessible restroom photos."
        ]
    },

    {
        id: 5,
        placeName: "Public Library",
        score: 84,
        scoreLabel: "Good Accessibility",

        summary: [
            "A step-free entrance route was detected.",
            "The main reading area has wide pathways.",
            "An accessible restroom is available.",
            "The ground floor is accessible for wheelchair users."
        ],

        facilities: [
            {
                name: "Step-Free Entrance",
                confidence: "High Confidence"
            },
            {
                name: "Wide Pathways",
                confidence: "High Confidence"
            },
            {
                name: "Accessible Restroom",
                confidence: "Medium Confidence"
            },
            {
                name: "Accessible Reading Area",
                confidence: "High Confidence"
            },
            {
                name: "Staff Assistance",
                confidence: "Verified"
            }
        ],

        issues: [
            "Some bookshelves may have narrow spaces.",
            "The upper floor elevator could not be fully verified.",
            "Accessible parking information is not clearly visible."
        ],

        suggestions: [
            "Increase the space between selected bookshelves.",
            "Upload clear photos of the elevator.",
            "Add accessible parking signs near the entrance."
        ]
    },

    {
        id: 6,
        placeName: "Government Service Center",
        score: 89,
        scoreLabel: "Very Good Accessibility",

        summary: [
            "An accessible ramp is available at the entrance.",
            "Accessible parking spaces were detected.",
            "Staff assistance is available at the reception desk.",
            "The service area has wide internal pathways."
        ],

        facilities: [
            {
                name: "Entrance Ramp",
                confidence: "High Confidence"
            },
            {
                name: "Accessible Parking",
                confidence: "High Confidence"
            },
            {
                name: "Staff Assistance",
                confidence: "Verified"
            },
            {
                name: "Wide Pathways",
                confidence: "High Confidence"
            },
            {
                name: "Priority Service Desk",
                confidence: "Verified"
            },
            {
                name: "Accessible Restroom",
                confidence: "Medium Confidence"
            }
        ],

        issues: [
            "The ramp handrail needs clearer visibility.",
            "The waiting area may become crowded.",
            "One internal sign may be difficult to read."
        ],

        suggestions: [
            "Improve the entrance ramp handrail markings.",
            "Keep an accessible pathway through the waiting area.",
            "Install larger and clearer directional signs."
        ]
    }
];