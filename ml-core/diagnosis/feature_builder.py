class FeatureBuilder:
    def build_features(self, particle_results):
        features = {
            "rbc_total": 0,
            "rbc_dysmorphic": 0,
            "rbc_isomorphic": 0,
            "dysmorphic_rbc_percentage": 0.0,
            "isomorphic_rbc_percentage": 0.0,
            
            "wbc_total": 0,
            "bacteria_total": 0,
            "yeast_total": 0,
            
            "casts_total": 0,
            "cast_hyaline": 0,
            "cast_granular": 0,
            "cast_wbc": 0,
            "cast_rbc": 0,
            "cast_waxy": 0,
            
            "crystals_total": 0,
            "crystal_caox_dihydrate": 0,
            "crystal_caox_monohydrate": 0,
            "crystal_calcium_oxalate": 0,
            "crystal_uric_acid": 0,
            "crystal_phosphate": 0,
        }

        if "rbc" in particle_results:
            rbc_data = particle_results["rbc"]
            features["rbc_total"] = rbc_data.get("total_count", 0)
            subs = rbc_data.get("subtype_summary", {})
            features["rbc_dysmorphic"] = subs.get("dysmorphic", 0)
            features["rbc_isomorphic"] = subs.get("isomorphic", 0)
            
            if features["rbc_total"] > 0:
                features["dysmorphic_rbc_percentage"] = (features["rbc_dysmorphic"] / features["rbc_total"]) * 100
                features["isomorphic_rbc_percentage"] = (features["rbc_isomorphic"] / features["rbc_total"]) * 100

        if "wbc" in particle_results:
            features["wbc_total"] = particle_results["wbc"].get("total_count", 0)

        if "bacteria" in particle_results:
            features["bacteria_total"] = particle_results["bacteria"].get("total_count", 0)

        if "yeast" in particle_results:
            features["yeast_total"] = particle_results["yeast"].get("total_count", 0)

        if "casts" in particle_results:
            casts_data = particle_results["casts"]
            features["casts_total"] = casts_data.get("total_count", 0)
            subs = casts_data.get("subtype_summary", {})
            features["cast_hyaline"] = subs.get("hyaline", 0)
            features["cast_granular"] = subs.get("granular", 0)
            features["cast_wbc"] = subs.get("wbc", 0)
            features["cast_rbc"] = subs.get("rbc", 0)
            features["cast_waxy"] = subs.get("waxy", 0)

        if "crystals" in particle_results:
            cryst_data = particle_results["crystals"]
            features["crystals_total"] = cryst_data.get("total_count", 0)
            subs = cryst_data.get("subtype_summary", {})
            features["crystal_caox_dihydrate"] = subs.get("CaOx_Dihydrate", 0)
            features["crystal_caox_monohydrate"] = subs.get("CaOx_Monohydrate", 0)
            features["crystal_uric_acid"] = subs.get("Uric_Acid", 0)
            features["crystal_phosphate"] = subs.get("Phosphate", 0)
            features["crystal_calcium_oxalate"] = features["crystal_caox_dihydrate"] + features["crystal_caox_monohydrate"]

        return features
