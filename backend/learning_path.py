# backend/learning_path.py
"""
Small rule-based learning-path generator.
Returns a structured roadmap (milestones -> tasks -> resources).
This is intentionally offline and deterministic so you can use it in a student/demo setting.
"""

from typing import List, Dict, Any
import math

# Basic curated resources per topic (you can expand later)
RESOURCE_DB = {
    "HTML & CSS": [
        {"title": "MDN: HTML basics", "url": "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics"},
        {"title": "MDN: CSS basics", "url": "https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps"}
    ],
    "JavaScript": [
        {"title": "JavaScript Guide (MDN)", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"},
        {"title": "Eloquent JavaScript (free book)", "url": "https://eloquentjavascript.net/"}
    ],
    "React": [
        {"title": "Official React Tutorial", "url": "https://reactjs.org/tutorial/tutorial.html"},
        {"title": "React Hooks Intro", "url": "https://reactjs.org/docs/hooks-intro.html"}
    ],
    "Data Fundamentals": [
        {"title": "Khan Academy: Statistics & probability", "url": "https://www.khanacademy.org/math/statistics-probability"},
        {"title": "Intro to Pandas (official)", "url": "https://pandas.pydata.org/docs/getting_started/index.html"}
    ],
    "Python Programming": [
        {"title": "Official Python Tutorial", "url": "https://docs.python.org/3/tutorial/"},
        {"title": "Automate the Boring Stuff", "url": "https://automatetheboringstuff.com/"}
    ],
    "Machine Learning Basics": [
        {"title": "Andrew Ng — Machine Learning (Coursera)", "url": "https://www.coursera.org/learn/machine-learning"},
        {"title": "Hands-On ML with Scikit-Learn (book)", "url": "https://github.com/ageron/handson-ml2"}
    ],
    "Cloud Basics": [
        {"title": "Google Cloud free learning", "url": "https://cloud.google.com/training"},
        {"title": "AWS free training", "url": "https://aws.amazon.com/training/"}
    ],
    "DevOps & CI/CD": [
        {"title": "Introduction to CI/CD", "url": "https://www.redhat.com/en/topics/devops/what-is-ci-cd"},
        {"title": "GitHub Actions docs", "url": "https://docs.github.com/en/actions"}
    ],
    "Projects": [
        {"title": "Build a portfolio", "url": "https://www.freecodecamp.org/news/how-to-build-a-developer-portfolio/"}
    ],
    "Communication & Interview Skills": [
        {"title": "Common interview tips", "url": "https://www.coursera.org/articles/interview-tips"},
        {"title": "Presentation skills (article)", "url": "https://www.skillsyouneed.com/present/presentation-skills.html"}
    ],
}


# Topic templates per high level goal
GOAL_TEMPLATES = {
    "frontend": [
        "HTML & CSS",
        "JavaScript",
        "React",
        "Projects",
        "Communication & Interview Skills"
    ],
    "data_science": [
        "Python Programming",
        "Data Fundamentals",
        "Machine Learning Basics",
        "Projects",
        "Communication & Interview Skills"
    ],
    "machine_learning": [
        "Python Programming",
        "Data Fundamentals",
        "Machine Learning Basics",
        "Projects",
        "Communication & Interview Skills"
    ],
    "cloud_engineer": [
        "Python Programming",
        "Cloud Basics",
        "DevOps & CI/CD",
        "Projects",
        "Communication & Interview Skills"
    ],
    "devops": [
        "Linux basics",
        "DevOps & CI/CD",
        "Cloud Basics",
        "Projects",
        "Communication & Interview Skills"
    ],
}


def _normalize_goal(goal: str) -> str:
    g = (goal or "").strip().lower()
    if "front" in g:
        return "frontend"
    if "data" in g:
        return "data_science"
    if "ml" in g or "machine" in g:
        return "machine_learning"
    if "cloud" in g:
        return "cloud_engineer"
    if "devops" in g:
        return "devops"
    return "frontend"


def generate_roadmap(goal: str, current_skills: List[str], hours_per_week: float = 5.0, weeks: int = 8) -> Dict[str, Any]:
    """
    Build a roadmap:
      - goal: free text goal (mapped to one of templates)
      - current_skills: list of skill names user already has
      - hours_per_week: available study hours per week
      - weeks: desired roadmap total length in weeks
    """
    goal_key = _normalize_goal(goal)
    template_topics = GOAL_TEMPLATES.get(goal_key, GOAL_TEMPLATES["frontend"])

    # Remove topics user already knows (very naive string match)
    known = set([s.strip().lower() for s in (current_skills or []) if s])
    filtered_topics = []
    for t in template_topics:
        if t.lower() in known or any(k in t.lower() for k in known):
            continue
        filtered_topics.append(t)

    # If user knows everything, still provide projects + review
    if not filtered_topics:
        filtered_topics = ["Projects", "Communication & Interview Skills"]

    # Allocate weeks to each topic roughly proportional
    topic_count = len(filtered_topics)
    base_weeks_per_topic = max(1, weeks // topic_count)
    remainder = weeks - base_weeks_per_topic * topic_count

    milestones = []
    week_cursor = 1
    for i, topic in enumerate(filtered_topics):
        weeks_for_topic = base_weeks_per_topic + (1 if i < remainder else 0)
        # create a small list of tasks
        tasks = [
            f"Learn the basics of {topic}",
            f"Complete 2-3 practical exercises on {topic}",
            "Take a short quiz / self-check"
        ]
        if topic == "Projects":
            tasks = [
                "Plan a small project (1-2 week scope)",
                "Build the project and deploy (or create a portfolio page)",
                "Document and add project to portfolio"
            ]
        resources = RESOURCE_DB.get(topic, [{"title": "General resources", "url": "https://www.google.com/search?q=" + topic.replace(" ", "+")}])
        milestone = {
            "title": topic,
            "start_week": week_cursor,
            "duration_weeks": weeks_for_topic,
            "end_week": week_cursor + weeks_for_topic - 1,
            "estimated_hours_per_week": round(hours_per_week, 1),
            "tasks": tasks,
            "resources": resources
        }
        milestones.append(milestone)
        week_cursor += weeks_for_topic

    # High-level meta
    roadmap = {
        "goal": goal,
        "generated_for": {"hours_per_week": hours_per_week, "total_weeks": weeks, "current_skills": current_skills},
        "milestones": milestones,
        "advice": [
            "Keep a weekly log of progress and a simple project to apply what you learn.",
            "If you have less than 4 hours/week, reduce the weeks per topic and extend total duration.",
            "Combine short readings with hands-on exercises for best retention."
        ]
    }
    return roadmap
