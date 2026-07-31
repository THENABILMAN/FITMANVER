from datetime import date

from app.workouts.service import get_workout_day_for_date


def test_get_workout_day_for_date_cycles_across_plan_days():
    plan = {
        "days_per_week": 4,
        "days": [
            {"day_number": 1, "day_name": "Upper A"},
            {"day_number": 2, "day_name": "Lower A"},
            {"day_number": 3, "day_name": "Upper B"},
            {"day_number": 4, "day_name": "Lower B"},
        ],
    }

    assert get_workout_day_for_date(plan, date(2026, 7, 20)) == plan["days"][0]
    assert get_workout_day_for_date(plan, date(2026, 7, 21)) == plan["days"][1]
    assert get_workout_day_for_date(plan, date(2026, 7, 22)) == plan["days"][2]
    assert get_workout_day_for_date(plan, date(2026, 7, 23)) == plan["days"][3]
    assert get_workout_day_for_date(plan, date(2026, 7, 24)) == plan["days"][0]
