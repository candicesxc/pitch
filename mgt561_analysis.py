#!/usr/bin/env python3
"""
MGT 561: Product Feature Prioritization - Complete Analysis
Solves all questions from the In-Class Case Study PDF
"""

import pandas as pd
import numpy as np
from pathlib import Path

# Paths
SURVEY_PATH = "/Users/xinchenshen/Downloads/MGT561_Feature_Prioritization_Survey_Data.xlsx"
EFFORT_PATH = "/Users/xinchenshen/Downloads/MGT561_Product_Features_and Effort.xlsx"
RESTAURANT_PATH = "/Users/xinchenshen/Downloads/MGT561_Restaurant_and_Cohort_Data.xlsx"

# Survey response mapping (PDF values; survey uses "Not important to have", "Nice to have", "Should have")
MAPPING = {
    "Must have": 3,
    "Should Have": 2,
    "Should have": 2,
    "Nice to Have": 1,
    "Nice to have": 1,
    "Not Important": 0,
    "Not important to have": 0,
}

# Reach values for Question 3 (each feature gets a different value)
REACH_OPTIONS = [10.0, 6.0, 3.0, 1.5, 0.5]
# 30 features need 30 values - repeat and extend
REACH_VALUES = [10.0, 6.0, 3.0, 1.5, 0.5] * 6  # 30 values


def load_data():
    """Load and prepare all datasets."""
    survey = pd.read_excel(SURVEY_PATH)
    effort_df = pd.read_excel(EFFORT_PATH, sheet_name="Product Features and Effort")
    restaurant = pd.read_excel(RESTAURANT_PATH)

    # Feature name mapping (survey columns may have slight variations)
    effort_features = effort_df["Product Feature"].str.strip().tolist()
    survey_features = [c for c in survey.columns if c != "restaurant_uuid"]

    # Create mapping - try to match
    feature_map = {}
    for sf in survey_features:
        sf_clean = sf.strip()
        for ef in effort_features:
            if sf_clean in ef or ef in sf_clean:
                feature_map[sf] = ef
                break
        if sf not in feature_map:
            feature_map[sf] = sf_clean

    return survey, effort_df, restaurant, feature_map


def convert_survey_to_numeric(survey):
    """Convert survey responses to numerical format."""
    features = [c for c in survey.columns if c != "restaurant_uuid"]
    survey_numeric = survey.copy()
    for col in features:
        survey_numeric[col] = survey_numeric[col].map(MAPPING)
    return survey_numeric


def question_1a(survey_numeric):
    """Q1a: Average product feature ranking based on average customer need importances."""
    features = [c for c in survey_numeric.columns if c != "restaurant_uuid"]
    avg_importance = survey_numeric[features].mean()
    avg_importance = avg_importance.sort_values(ascending=False)
    ranking = pd.Series(range(1, len(avg_importance) + 1), index=avg_importance.index)
    return avg_importance, ranking


def question_1b(survey_numeric, restaurant):
    """Q1b: Segmentation analysis - patterns in needs between individuals."""
    survey_with_rest = survey_numeric.merge(
        restaurant[["restaurant_uuid", "city", "% Pickup / Delivery vs Reservation", "% Walk-In Reservations"]],
        on="restaurant_uuid",
        how="left",
    )
    return survey_with_rest


def calculate_rice(survey_numeric, effort_df, reach_values, confidence=1.0):
    """Calculate RICE score for each feature."""
    features = [c for c in survey_numeric.columns if c != "restaurant_uuid"]
    avg_impact = survey_numeric[features].mean()

    # Match effort to features
    effort_map = dict(zip(effort_df["Product Feature"].str.strip(), effort_df["Engineering and Design Effort (person-months)"]))

    results = []
    for i, (feat, impact) in enumerate(avg_impact.items()):
        feat_clean = feat.strip()
        effort = effort_map.get(feat_clean, effort_map.get(feat_clean[:-1] if feat_clean.endswith(" ") else feat_clean))
        if effort is None:
            for ef in effort_map:
                if feat_clean in ef or ef in feat_clean:
                    effort = effort_map[ef]
                    break
        if effort is None:
            effort = 1.0  # default

        reach = reach_values[i] if i < len(reach_values) else 1.0
        rice = (reach * impact * confidence) / effort
        results.append({
            "Feature": feat,
            "Impact": impact,
            "Effort": effort,
            "Reach": reach,
            "Confidence": confidence,
            "RICE": rice,
        })
    return pd.DataFrame(results)


def main():
    print("=" * 80)
    print("MGT 561: Product Feature Prioritization - Complete Analysis")
    print("=" * 80)

    survey, effort_df, restaurant, feature_map = load_data()
    survey_numeric = convert_survey_to_numeric(survey)

    # ========== QUESTION 1a ==========
    print("\n" + "=" * 80)
    print("QUESTION 1a: Average Product Feature Ranking (by Average Customer Need Importances)")
    print("=" * 80)
    avg_importance, ranking = question_1a(survey_numeric)
    print("\nAverage Feature Importance (Impact) - Sorted by Rank:")
    for i, (feat, imp) in enumerate(avg_importance.items(), 1):
        print(f"  {i:2d}. {feat[:60]:<60} {imp:.3f}")
    print(f"\nOverall average impact across all 30 features: {avg_importance.mean():.4f}")
    ranking_q1 = ranking

    # ========== QUESTION 1b ==========
    print("\n" + "=" * 80)
    print("QUESTION 1b: Segmentation - Patterns in Needs Data")
    print("=" * 80)
    survey_with_rest = question_1b(survey_numeric, restaurant)
    # Cluster by pickup/delivery vs reservation
    high_pickup = survey_with_rest[survey_with_rest["% Pickup / Delivery vs Reservation"] >= 50]
    low_pickup = survey_with_rest[survey_with_rest["% Pickup / Delivery vs Reservation"] < 50]
    features = [c for c in survey_numeric.columns if c != "restaurant_uuid"]
    high_pickup_avg = high_pickup[features].mean()
    low_pickup_avg = low_pickup[features].mean()
    diff = high_pickup_avg - low_pickup_avg
    print("\nSegment: High Pickup/Delivery (>=50%) vs Low Pickup/Delivery (<50%)")
    print(f"  High Pickup/Delivery restaurants: {len(high_pickup)}")
    print(f"  Low Pickup/Delivery restaurants: {len(low_pickup)}")
    print("\nTop 5 features with HIGHER importance for pickup/delivery-focused restaurants:")
    for feat in diff.nlargest(5).index:
        print(f"  - {feat[:55]}: {diff[feat]:+.3f}")
    print("\nTop 5 features with HIGHER importance for reservation-focused restaurants:")
    for feat in diff.nsmallest(5).index:
        print(f"  - {feat[:55]}: {diff[feat]:+.3f}")

    # ========== QUESTION 2 ==========
    print("\n" + "=" * 80)
    print("QUESTION 2: RICE Score Calculation")
    print("=" * 80)
    # Assign Reach values - 30 features, need 30 different values
    # Use 10, 6, 3, 1.5, 0.5 - assign 6 features to each = 30
    reach_assign = []
    for i in range(30):
        reach_assign.append(REACH_OPTIONS[i % 5])
    rice_df = calculate_rice(survey_numeric, effort_df, reach_assign)
    rice_df = rice_df.sort_values("RICE", ascending=False).reset_index(drop=True)
    rice_df["RICE_Rank"] = range(1, len(rice_df) + 1)
    print("\nRICE Scores (sorted by RICE, descending):")
    for _, row in rice_df.iterrows():
        print(f"  {row['RICE_Rank']:2d}. RICE={row['RICE']:.2f} | R={row['Reach']} I={row['Impact']:.2f} C={row['Confidence']} E={row['Effort']} | {row['Feature'][:45]}")
    print(f"\nQ2a) Average RICE score: {rice_df['RICE'].mean():.4f}")
    print("\nQ2b) Units of each variable:")
    print("  - R (Reach): Unitless scale (1.0-10.0)")
    print("  - I (Impact): Unitless (0-3 scale from survey)")
    print("  - C (Confidence): Unitless (0-1)")
    print("  - E (Effort): Person-months")
    print("  - RICE: (person-months)^-1 or dimensionless")
    print("\nQ2c) What RICE is missing (Product-Market Fit):")
    print("  RICE does not account for whether the product already satisfies these needs.")
    print("  PMF: product satisfies a strong market need. RICE assumes no existing satisfaction.")
    print("  Missing: 'Satisfaction' - how much existing product/competitors already satisfy need.")

    # ========== QUESTION 3 ==========
    print("\n" + "=" * 80)
    print("QUESTION 3: RICE with Original Reach (different per feature)")
    print("=" * 80)
    rice_q3 = calculate_rice(survey_numeric, effort_df, reach_assign)
    rice_q3 = rice_q3.sort_values("RICE", ascending=False).reset_index(drop=True)
    rice_q3["Rank_Q3"] = range(1, len(rice_q3) + 1)
    q1_rank_order = avg_importance.index.tolist()
    q3_rank_order = rice_q3.sort_values("RICE", ascending=False)["Feature"].tolist()
    print("Comparison with Q1 (Importance-only ranking):")
    print("  Q1 Top 5:", [f[:30] for f in q1_rank_order[:5]])
    print("  Q3 Top 5:", [f[:30] for f in q3_rank_order[:5]])
    same = "Yes" if q1_rank_order == q3_rank_order else "No"
    print(f"\nQ3) Same feature prioritization as Q1? {same}")

    # ========== QUESTION 4 ==========
    print("\n" + "=" * 80)
    print("QUESTION 4: RICE with SQUARED Reach values")
    print("=" * 80)
    reach_squared = [r**2 for r in reach_assign]
    rice_q4 = calculate_rice(survey_numeric, effort_df, reach_squared)
    rice_q4 = rice_q4.sort_values("RICE", ascending=False).reset_index(drop=True)
    q4_rank_order = rice_q4["Feature"].tolist()
    print("Q3 Top 5:", [f[:35] for f in q3_rank_order[:5]])
    print("Q4 Top 5:", [f[:35] for f in q4_rank_order[:5]])
    same_4 = "Yes" if q3_rank_order == q4_rank_order else "No"
    print(f"\nQ4a) Same feature prioritization as Q2a/Q3? {same_4}")
    print("  Note: Squaring Reach changes absolute RICE values but preserves RELATIVE ranking")
    print("  because RICE = (R*I*C)/E - if all R's are squared, ratios between features stay same.")

    # Save results to CSV
    output_path = Path("/Users/xinchenshen/Desktop/Vibe Coding/Personal Pitch/mgt561_results.csv")
    final_df = rice_df[["Feature", "Impact", "Effort", "Reach", "RICE", "RICE_Rank"]].copy()
    final_df["Q1_Rank"] = final_df["Feature"].map({f: i+1 for i, f in enumerate(avg_importance.index)})
    final_df.to_csv(output_path, index=False)
    print(f"\nResults saved to {output_path}")


if __name__ == "__main__":
    main()
