import json
import difflib
import sys
from typing import Dict, Any

def load_trace(trace_path: str) -> Dict[str, Any]:
    """Load and validate the trace log."""
    with open(trace_path, 'r') as f:
        data = json.load(f)
    print(f"Loaded trace: {data.get('session_id')}")
    return data

def mock_reproduce_agent(prompt: str, variables: Dict[str, Any]) -> str:
    """
    MOCK FUNCTION: In a real scenario, this would call the actual LLM API 
    with the same parameters.
    For this example, we just return a simulated string.
    """
    print(f"Reproducing with prompt template: {prompt[:30]}...")
    print(f"Variables: {variables.keys()}")
    
    # Simulating a slightly different but semantically similar output
    return "This UI element has poor contrast and needs to be darker."

def calculate_similarity(original_cot: str, new_cot: str) -> float:
    """Calculate text similarity ratio (0.0 to 1.0)."""
    return difflib.SequenceMatcher(None, original_cot, new_cot).ratio()

def audit_trace(trace_path: str):
    trace = load_trace(trace_path)
    
    # 1. Extract Details
    original_cot = " ".join(trace.get('cot_trace', []))
    prompt_template = trace['prompt_input']['template']
    variables = trace['prompt_input']['variables']
    
    # 2. Reproduce
    # In production, this calls the actual Agent/LLM
    new_cot = mock_reproduce_agent(prompt_template, variables)
    
    # 3. Compare
    score = calculate_similarity(original_cot, new_cot)
    threshold = 0.8
    
    print("\n--- Audit Results ---")
    print(f"Original COT: {original_cot[:50]}...")
    print(f"New COT:      {new_cot[:50]}...")
    print(f"Similarity Score: {score:.2f}")
    
    if score >= threshold:
        print("Verdict: ✅ PASS (Reproducible)")
    else:
        print("Verdict: ⚠️ FAIL (Significant Deviation)")

if __name__ == "__main__":
    # Example Usage: python audit_example.py logs/example_trace.json
    if len(sys.argv) > 1:
        audit_trace(sys.argv[1])
    else:
        print("Usage: python audit_example.py <path_to_trace.json>")
