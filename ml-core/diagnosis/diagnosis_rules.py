DIAGNOSIS_RULES = [
    {
        "name": "Hematuria",
        "levels": {
            "High": [{"feature": "rbc_total", "op": ">", "value": 20}],
            "Moderate": [{"feature": "rbc_total", "op": ">", "value": 5}],
            "Low": [{"feature": "rbc_total", "op": ">", "value": 3}]
        }
    },
    {
        "name": "Glomerular Hematuria",
        "levels": {
            "High": [
                {"feature": "rbc_total", "op": ">", "value": 20},
                {"feature": "dysmorphic_rbc_percentage", "op": ">", "value":20}
            ],
            "Moderate": [
                {"feature": "rbc_total", "op": ">", "value": 10},
                {"feature": "dysmorphic_rbc_percentage", "op": ">", "value": 10}
            ],
            "Low": [
                {"feature": "rbc_total", "op": ">", "value": 5},
                {"feature": "dysmorphic_rbc_percentage", "op": ">", "value": 5}
            ]
        }
    },
    {
        "name": "Non Glomerular Hematuria",
        "levels": {
            "High": [
                {"feature": "rbc_total", "op": ">", "value": 25},
                {"feature": "isomorphic_rbc_percentage", "op": ">", "value": 60}
            ],
            "Moderate": [
                {"feature": "rbc_total", "op": ">", "value": 10},
                {"feature": "isomorphic_rbc_percentage", "op": ">", "value": 40}
            ],
            "Low": [
                {"feature": "rbc_total", "op": ">", "value": 4},
                {"feature": "isomorphic_rbc_percentage", "op": ">", "value": 20}
            ]
        }
    },
    {
        "name": "Urinary Tract Infection",
        "levels": {
            "High": [
                {"feature": "wbc_total", "op": ">", "value": 10},
                {"feature": "bacteria_total", "op": ">", "value": 10}
            ],
            "Moderate": [
                {"feature": "wbc_total", "op": ">", "value": 5},
                {"feature": "bacteria_total", "op": ">", "value": 5}
            ],
            "Low": [
                {"feature": "wbc_total", "op": ">", "value": 1},
                {"feature": "bacteria_total", "op": ">", "value": 1}
            ]
        }
    },
    {
        "name": "Severe Bacterial Infection",
        "levels": {
            "High": [
                {"feature": "wbc_total", "op": ">", "value": 20},
                {"feature": "bacteria_total", "op": ">", "value": 20}
            ],
            "Moderate": [
                {"feature": "wbc_total", "op": ">", "value": 10},
                {"feature": "bacteria_total", "op": ">", "value": 10}
            ],
            "Low": [
                {"feature": "wbc_total", "op": ">", "value": 5},
                {"feature": "bacteria_total", "op": ">", "value": 5}
            ]
        }
    },
    {
        "name": "Pyelonephritis",
        "levels": {
            "High": [
                {"feature": "cast_wbc", "op": ">=", "value": 2}
            ],
            "Moderate": [
                {"feature": "cast_wbc", "op": ">=", "value": 1}
            ],
            "Low": [
                {"feature": "cast_wbc", "op": ">=", "value": 1}
            ]
        }
    },
    {
        "name": "Interstitial Nephritis",
        "levels": {
            "High": [
                {"feature": "wbc_total", "op": ">", "value": 20},
                {"feature": "cast_wbc", "op": ">=", "value": 2},
                {"feature": "bacteria_total", "op": "<", "value": 10}
            ],
            "Moderate": [
                {"feature": "wbc_total", "op": ">", "value": 10},
                {"feature": "cast_wbc", "op": ">=", "value": 1},
                {"feature": "bacteria_total", "op": "<", "value": 10}
            ],
            "Low": [
                {"feature": "wbc_total", "op": ">", "value": 5},
                {"feature": "cast_wbc", "op": ">=", "value": 1},
                {"feature": "bacteria_total", "op": "<", "value": 5}
            ]
        }
    },
    {
        "name": "Acute Kidney Injury",
        "levels": {
            "High": [{"feature": "cast_granular", "op": ">=", "value": 5}],
            "Moderate": [{"feature": "cast_granular", "op": ">=", "value": 3}],
            "Low": [{"feature": "cast_granular", "op": ">=", "value": 2}]
        }
    },
    {
        "name": "Chronic Kidney Disease",
        "levels": {
            "High": [
                {"feature": "cast_waxy", "op": ">=", "value": 2},
                {"feature": "cast_granular", "op": ">=", "value": 2}
            ],
            "Moderate": [
                {"feature": "cast_waxy", "op": ">=", "value": 1},
                {"feature": "cast_granular", "op": ">=", "value": 1}
            ],
            "Low": [
                {"feature": "cast_waxy", "op": ">=", "value": 1}
            ]
        }
    },
    {
        "name": "Tubular Injury",
        "levels": {
            "High": [
                {"feature": "cast_granular", "op": ">=", "value": 5},
                {"feature": "cast_waxy", "op": "==", "value": 0}
            ],
            "Moderate": [
                {"feature": "cast_granular", "op": ">=", "value": 2},
                {"feature": "cast_waxy", "op": "==", "value": 0}
            ],
            "Low": [
                {"feature": "cast_granular", "op": ">=", "value": 1},
                {"feature": "cast_waxy", "op": "==", "value": 0}
            ]
        }
    },
    {
        "name": "Kidney Stone Risk",
        "levels": {
            "High": [
                {"feature": "crystals_total", "op": ">", "value": 15},
                {"feature": "rbc_total", "op": ">", "value": 10}
            ],
            "Moderate": [
                {"feature": "crystals_total", "op": ">", "value": 5},
                {"feature": "rbc_total", "op": ">", "value": 5}
            ],
            "Low": [
                {"feature": "crystals_total", "op": ">", "value": 2},
                {"feature": "rbc_total", "op": ">", "value": 2}
            ]
        }
    },
    {
        "name": "Calcium Oxalate Stone Risk",
        "levels": {
            "High": [{"feature": "crystal_calcium_oxalate", "op": ">", "value": 15}],
            "Moderate": [{"feature": "crystal_calcium_oxalate", "op": ">", "value": 8}],
            "Low": [{"feature": "crystal_calcium_oxalate", "op": ">", "value": 3}]
        }
    },
    {
        "name": "Uric Acid Stone Risk",
        "levels": {
            "High": [{"feature": "crystal_uric_acid", "op": ">", "value": 15}],
            "Moderate": [{"feature": "crystal_uric_acid", "op": ">", "value": 8}],
            "Low": [{"feature": "crystal_uric_acid", "op": ">", "value": 2}]
        }
    },
    {
        "name": "Phosphate Stone Risk",
        "levels": {
            "High": [{"feature": "crystal_phosphate", "op": ">", "value": 15}],
            "Moderate": [{"feature": "crystal_phosphate", "op": ">", "value": 8}],
            "Low": [{"feature": "crystal_phosphate", "op": ">", "value": 2}]
        }
    },
    {
        "name": "Hyperoxaluria",
        "levels": {
            "High": [{"feature": "crystal_calcium_oxalate", "op": ">", "value": 40}],
            "Moderate": [{"feature": "crystal_calcium_oxalate", "op": ">", "value": 30}],
            "Low": [{"feature": "crystal_calcium_oxalate", "op": ">", "value": 20}]
        }
    },
    {
        "name": "Hyperuricosuria",
        "levels": {
            "High": [{"feature": "crystal_uric_acid", "op": ">", "value": 40}],
            "Moderate": [{"feature": "crystal_uric_acid", "op": ">", "value": 30}],
            "Low": [{"feature": "crystal_uric_acid", "op": ">", "value": 20}]
        }
    },
    {
        "name": "Infection with Hematuria",
        "levels": {
            "High": [
                {"feature": "wbc_total", "op": ">", "value": 20},
                {"feature": "bacteria_total", "op": ">", "value": 20},
                {"feature": "rbc_total", "op": ">", "value": 20}
            ],
            "Moderate": [
                {"feature": "wbc_total", "op": ">", "value": 10},
                {"feature": "bacteria_total", "op": ">", "value": 10},
                {"feature": "rbc_total", "op": ">", "value": 10}
            ],
            "Low": [
                {"feature": "wbc_total", "op": ">", "value": 5},
                {"feature": "bacteria_total", "op": ">", "value": 5},
                {"feature": "rbc_total", "op": ">", "value": 5}
            ]
        }
    },
    {
        "name": "Fungal Infection",
        "levels": {
            "High": [
                {"feature": "yeast_total", "op": ">", "value": 15},
                {"feature": "wbc_total", "op": ">", "value": 10}
            ],
            "Moderate": [
                {"feature": "yeast_total", "op": ">", "value": 5},
                {"feature": "wbc_total", "op": ">", "value": 5}
            ],
            "Low": [
                {"feature": "yeast_total", "op": ">", "value": 2},
                {"feature": "wbc_total", "op": ">", "value": 2}
            ]
        }
    },
    {
        "name": "Candiduria",
        "levels": {
            "High": [{"feature": "yeast_total", "op": ">", "value": 20}],
            "Moderate": [{"feature": "yeast_total", "op": ">", "value": 10}],
            "Low": [{"feature": "yeast_total", "op": ">", "value": 5}]
        }
    },
    {
        "name": "Sample Contamination",
        "levels": {
            "High": [
                {"feature": "bacteria_total", "op": ">", "value": 20},
                {"feature": "wbc_total", "op": "<", "value": 5},
                {"feature": "casts_total", "op": "==", "value": 0}
            ],
            "Moderate": [
                {"feature": "bacteria_total", "op": ">", "value": 10},
                {"feature": "wbc_total", "op": "<", "value": 5},
                {"feature": "casts_total", "op": "==", "value": 0}
            ],
            "Low": [
                {"feature": "bacteria_total", "op": ">", "value": 5},
                {"feature": "wbc_total", "op": "<", "value": 2},
                {"feature": "casts_total", "op": "==", "value": 0}
            ]
        }
    },
    {
        "name": "Normal Urine Sediment",
        "levels": {
            "High": [
                {"feature": "rbc_total", "op": "<=", "value": 3},
                {"feature": "wbc_total", "op": "<=", "value": 5},
                {"feature": "bacteria_total", "op": "==", "value": 0},
                {"feature": "yeast_total", "op": "==", "value": 0},
                {"feature": "casts_total", "op": "<=", "value": 0},
                {"feature": "crystals_total", "op": "<", "value": 5}
            ]
        }
    }
]
