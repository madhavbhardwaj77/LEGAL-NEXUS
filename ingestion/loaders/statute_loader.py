"""
Statute and Legal Source Loader
Loads official Indian legal JSON datasets and acts
"""

import json
import os
from typing import List, Dict, Any

class StatuteLoader:
    def __init__(self, data_dir: str = None):
        if data_dir is None:
            self.data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        else:
            self.data_dir = data_dir

    def load_all_domains(self) -> List[Dict[str, Any]]:
        """Load all legal domain files from the data directory"""
        domains = []
        if not os.path.exists(self.data_dir):
            return domains

        for filename in sorted(os.listdir(self.data_dir)):
            if filename.endswith(".json"):
                filepath = os.path.join(self.data_dir, filename)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        domains.append(data)
                except Exception as e:
                    print(f"Error loading {filepath}: {e}")
        return domains

    def load_domain(self, domain_filename: str) -> Dict[str, Any]:
        """Load a specific domain file by filename"""
        filepath = os.path.join(self.data_dir, domain_filename)
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
