QUESTIONS = [
    {
        "id": 1,
        "type": "select",
        "question": "Age",
        "options": ["Under 18", "18–30", "31–45", "46–60", "Above 60"]
    },
    {
        "id": 2,
        "type": "select",
        "question": "Biological sex",
        "options": ["Male", "Female"]
    },
    {
        "id": 3,
        "type": "yes_no",
        "question": "Do you have pain, burning, or discomfort while urinating?"
    },
    {
        "id": 4,
        "type": "yes_no",
        "question": "Have you noticed visible blood in your urine recently?"
    },
    {
        "id": 5,
        "type": "yes_no",
        "question": "Do you have lower back or flank pain?"
    },
    {
        "id": 6,
        "type": "select",
        "question": "Have you had a urinary tract infection in the past 6 months?",
        "options": ["Yes", "No", "Not sure"]
    },
    {
        "id": 7,
        "type": "multi_select",
        "question": "Do you have any long-term medical conditions?",
        "options": ["Diabetes", "High blood pressure", "Kidney disease", "None"]
    },
    {
        "id": 8,
        "type": "yes_no",
        "question": "Do you smoke or have a history of smoking?"
    },
    {
        "id": 9,
        "type": "select",
        "question": "Is there a family history of kidney disease or urinary tract cancer?",
        "options": ["Yes", "No", "Not sure"]
    },
    {
        "id": 10,
        "type": "yes_no",
        "question": "Are you currently menstruating or within 3 days of menstruation?",
        "condition": {
            "field": "Biological sex",
            "value": "Female"
        }
    }
]
