import json

cv_text = """
Eren Yilmaz
Senior Frontend Developer

SUMMARY
Experienced software engineer with 6+ years in web development and React ecosystem.

EDUCATION
- Bachelor of Science in Computer Engineering, Istanbul Technical University, 2018
- Google Professional Certificate - Advanced JavaScript, 2022

EXPERIENCE
TechCorp A.S. - Senior Frontend Developer (2021 - Present)
- Led development of customer-facing React applications
- Implemented responsive UI using TypeScript and Tailwind CSS
- Mentored junior developers

FinansTech Inc. - Frontend Developer (2019 - 2021)
- Developed full-stack applications with Node.js and React
- Implemented REST APIs and GraphQL integrations
- 3 years experience in startups

SKILLS
React, TypeScript, JavaScript, Node.js, PostgreSQL, Docker, AWS, Figma, Git, HTML, CSS, Tailwind CSS, GraphQL, REST APIs, Python, Machine Learning

LANGUAGES
- Turkish (Native)
- English (Advanced)
- German (Intermediate)

CERTIFICATIONS
- AWS Solutions Architect Associate (2022)
- Google Cloud Professional Developer (2021)
"""

# Test heuristic analysis
cv_lower = cv_text.lower()

# Skills extraction
common_skills = ['react', 'typescript', 'javascript', 'node.js', 'postgresql', 'docker', 'aws', 'figma', 'python', 'html', 'css']
skills = [s.title() for s in common_skills if s in cv_lower]

# Languages extraction
languages = []
if 'english' in cv_lower:
    languages.append({"name": "English", "level": "Advanced"})
if 'german' in cv_lower:
    languages.append({"name": "German", "level": "Intermediate"})
if 'turkish' in cv_lower:
    languages.append({"name": "Turkish", "level": "Native"})

# Summary
summary = cv_text[:200].strip()

# Education extraction (mock)
education = [
    {
        "level": "Bachelor of Science",
        "school": "Istanbul Technical University",
        "field": "Computer Engineering",
        "year": "2018"
    }
]

# Experience extraction (mock)
experience = [
    {
        "company": "TechCorp A.S.",
        "position": "Senior Frontend Developer",
        "duration": "2021-Present",
        "description": "Led development of customer-facing React applications"
    },
    {
        "company": "FinansTech Inc.",
        "position": "Frontend Developer",
        "duration": "2019-2021",
        "description": "Developed full-stack applications with Node.js and React"
    }
]

result = {
    "education": education,
    "experience": experience,
    "skills": skills,
    "languages": languages,
    "certifications": [
        {"name": "AWS Solutions Architect Associate", "issuer": "Amazon", "date": "2022"},
        {"name": "Google Cloud Professional Developer", "issuer": "Google", "date": "2021"}
    ],
    "summary": summary
}

print(json.dumps(result, indent=2))
