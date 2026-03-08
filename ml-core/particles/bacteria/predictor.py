class BacteriaPredictor:
    """Assesses UTI risk based on E.coli detection results"""

    def assess(self, ecoli_present: bool) -> str:
        """Assess risk level based on E.coli presence
        
        Args:
            ecoli_present: Whether E.coli bacteria were detected
            
        Returns:
            Risk assessment string
        """
        return "UTI Positive" if ecoli_present else "UTI Negative"
