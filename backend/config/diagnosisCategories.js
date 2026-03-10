export const DIAGNOSIS_CATEGORY = {
    infection: [
        "urinary tract infection",
        "severe bacterial infection",
        "pyelonephritis",
        "interstitial nephritis",
        "infection with hematuria",
        "fungal infection",
        "candiduria"
    ],
    stone: [
        "kidney stone risk",
        "calcium oxalate stone risk",
        "uric acid stone risk",
        "phosphate stone risk",
        "hyperoxaluria",
        "hyperuricosuria"
    ],
    hematuria: [
        "hematuria",
        "glomerular hematuria",
        "non glomerular hematuria"
    ],
    renal: [
        "acute kidney injury",
        "chronic kidney disease",
        "tubular injury"
    ],
    contamination: [
        "sample contamination"
    ],
    normal: [
        "normal urine sediment"
    ]
};

export const getDiagnosisCategories = (diagnoses) => {
    if (!diagnoses || !Array.isArray(diagnoses)) return [];

    const detectedCategories = new Set();

    for (const diag of diagnoses) {
        if (!diag) continue;
        const diagName = typeof diag === 'string' ? diag : diag.name;
        if (!diagName) continue;

        const nameLower = diagName.toLowerCase();

        for (const [category, diseases] of Object.entries(DIAGNOSIS_CATEGORY)) {
            if (diseases.includes(nameLower)) {
                detectedCategories.add(category);
            }
        }
    }

    return Array.from(detectedCategories);
};

export const hasCategory = (diagnoses, category) => {
    const categories = getDiagnosisCategories(diagnoses);
    return categories.includes(category);
};
