from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import time

# Import Qiskit libraries
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GateOperation(BaseModel):
    qubit: int
    gate: str
    controlQubit: Optional[int] = None
    controlColumn: Optional[int] = None

class ColumnOperation(BaseModel):
    column: int
    gates: List[GateOperation]

class CircuitRequest(BaseModel):
    num_qubits: int
    operations: List[ColumnOperation]

class QubitTimeline(BaseModel):
    gates: List[Dict[str, Any]]  # List of gates in order of application

class CircuitAnalysis(BaseModel):
    total_gates: int
    gates_per_qubit: Dict[int, int]
    gate_types_used: Dict[str, int]
    circuit_width: int
    circuit_depth: int
    two_qubit_gate_count: int
    estimated_complexity: str
    connectivity: List[Dict[str, int]]
    # New fields for detailed analysis
    qubit_timelines: Dict[int, QubitTimeline]  # Operations per qubit
    circuit_matrix: List[List[Dict[str, Any]]]  # 2D representation of circuit
    operation_sequence: List[Dict[str, Any]]    # Sequential operations

class SimulationResult(BaseModel):
    measurement_counts: Dict[str, int]
    total_shots: int
    execution_time: float
    top_results: List[Dict[str, Any]]
    success: bool
    error_message: Optional[str] = None

@app.post("/analyze-circuit")
async def analyze_circuit(circuit: CircuitRequest):
    try:
        # Initialize data structures
        total_gates = 0
        gates_per_qubit = {}
        gate_types = {}
        two_qubit_gates = 0
        connectivity = []
        qubit_timelines = {}
        operation_sequence = []
        
        # Initialize empty circuit matrix with empty dictionaries instead of None
        max_column = max([op.column for op in circuit.operations], default=0) + 1
        circuit_matrix = []
        for i in range(circuit.num_qubits):
            circuit_matrix.append([{"gate": None, "role": None} for _ in range(max_column)])
            qubit_timelines[i] = QubitTimeline(gates=[])
        
        # Analyze each column
        for col in circuit.operations:
            column_ops = []
            
            for gate in col.gates:
                # Count total gates
                total_gates += 1
                
                # Count gates per qubit
                gates_per_qubit[gate.qubit] = gates_per_qubit.get(gate.qubit, 0) + 1
                
                # Create gate operation record
                gate_info = {
                    "column": col.column,
                    "gate_type": gate.gate,
                    "qubit": gate.qubit
                }
                
                # Special handling for CNOT gates
                if gate.gate == "CNOT":
                    two_qubit_gates += 1
                    if gate.controlQubit is not None:
                        gates_per_qubit[gate.controlQubit] = gates_per_qubit.get(gate.controlQubit, 0) + 1
                        
                        # Add connectivity info
                        connectivity.append({
                            "control": gate.controlQubit,
                            "target": gate.qubit,
                            "column": col.column
                        })
                        
                        # Add control qubit info to gate record
                        gate_info["control_qubit"] = gate.controlQubit
                        
                        # Update circuit matrix for control qubit
                        circuit_matrix[gate.controlQubit][col.column] = {
                            "role": "control",
                            "gate": "CNOT",
                            "connected_to": gate.qubit
                        }
                        
                        # Add to control qubit's timeline
                        qubit_timelines[gate.controlQubit].gates.append({
                            "column": col.column,
                            "role": "control",
                            "gate": "CNOT",
                            "connected_to": gate.qubit
                        })
                
                # Update circuit matrix for target qubit
                circuit_matrix[gate.qubit][col.column] = {
                    "role": "target" if gate.gate == "CNOT" else "single",
                    "gate": gate.gate,
                    "connected_to": gate.controlQubit if gate.gate == "CNOT" else None
                }
                
                # Add to target qubit's timeline
                qubit_timelines[gate.qubit].gates.append({
                    "column": col.column,
                    "role": "target" if gate.gate == "CNOT" else "single",
                    "gate": gate.gate,
                    "connected_to": gate.controlQubit if gate.gate == "CNOT" else None
                })
                
                # Count gate types
                gate_types[gate.gate] = gate_types.get(gate.gate, 0) + 1
                
                # Add to column operations
                column_ops.append(gate_info)
            
            # Add column to operation sequence
            operation_sequence.append({
                "column": col.column,
                "operations": column_ops
            })

        # Calculate circuit depth
        circuit_depth = len(circuit.operations)

        # Calculate complexity
        if total_gates == 0:
            complexity = "trivial"
        elif total_gates < 5 and two_qubit_gates == 0:
            complexity = "simple"
        elif total_gates < 10 and two_qubit_gates < 2:
            complexity = "moderate"
        else:
            complexity = "complex"

        # Print detailed analysis for debugging
        print("\n=== Circuit Analysis ===")
        print(f"Total gates: {total_gates}")
        print(f"Two-qubit gates: {two_qubit_gates}")
        print(f"Gate types: {gate_types}")
        print(f"Connectivity: {connectivity}")
        print("\nOperation Sequence:")
        for col in operation_sequence:
            print(f"Column {col['column']}:")
            for op in col['operations']:
                if "control_qubit" in op:
                    print(f"  CNOT: Control Q{op['control_qubit']} → Target Q{op['qubit']}")
                else:
                    print(f"  {op['gate_type']} on Q{op['qubit']}")
        print("=====================\n")

        return CircuitAnalysis(
            total_gates=total_gates,
            gates_per_qubit=gates_per_qubit,
            gate_types_used=gate_types,
            circuit_width=circuit.num_qubits,
            circuit_depth=circuit_depth,
            two_qubit_gate_count=two_qubit_gates,
            estimated_complexity=complexity,
            connectivity=connectivity,
            qubit_timelines=qubit_timelines,
            circuit_matrix=circuit_matrix,
            operation_sequence=operation_sequence
        )
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulate-circuit")
async def simulate_circuit(circuit: CircuitRequest):
    try:
        start_time = time.time()
        
        # Create a quantum circuit with the specified number of qubits
        qc = QuantumCircuit(circuit.num_qubits, circuit.num_qubits)
        
        # Sort operations by column to ensure correct order
        sorted_ops = sorted(circuit.operations, key=lambda op: op.column)
        
        # Apply gates to the circuit
        for column_op in sorted_ops:
            for gate_op in column_op.gates:
                gate_type = gate_op.gate
                target_qubit = gate_op.qubit
                
                # Apply the appropriate gate
                if gate_type == "H":
                    qc.h(target_qubit)
                elif gate_type == "X":
                    qc.x(target_qubit)
                elif gate_type == "Y":
                    qc.y(target_qubit)
                elif gate_type == "Z":
                    qc.z(target_qubit)
                elif gate_type == "S":
                    qc.s(target_qubit)
                elif gate_type == "T":
                    qc.t(target_qubit)
                elif gate_type == "CNOT" and gate_op.controlQubit is not None:
                    qc.cx(gate_op.controlQubit, target_qubit)
                elif gate_type == "SWAP" and gate_op.controlQubit is not None:
                    qc.swap(gate_op.controlQubit, target_qubit)
                # Add other gates as needed
        
        # Add measurement to all qubits
        qc.measure_all()
        
        # Set up the GPU simulator
        backend = AerSimulator(method='statevector')
        backend.set_options(device='GPU', cuStateVec_enable=True, batched_shots_gpu = True)
        
        # Print circuit information
        print("\n=== Circuit for Simulation ===")
        print(qc)
        print("===========================\n")
        
        # Run the simulation
        shots = 1024  # Number of simulation shots
        job = backend.run(qc, shots=shots)
        result = job.result()
        counts = result.get_counts()
        
        # Calculate execution time
        execution_time = time.time() - start_time
        
        # Process results
        top_results = []
        for bitstring, count in sorted(counts.items(), key=lambda x: x[1], reverse=True)[:10]:
            probability = count / shots
            top_results.append({
                "bitstring": bitstring,
                "count": count, 
                "probability": probability
            })
        
        print(f"Simulation completed in {execution_time:.2f} seconds")
        print(f"Top results: {top_results}")
        
        return SimulationResult(
            measurement_counts=counts,
            total_shots=shots,
            execution_time=execution_time,
            top_results=top_results,
            success=True
        )
        
    except Exception as e:
        print(f"Simulation error: {str(e)}")
        return SimulationResult(
            measurement_counts={},
            total_shots=0,
            execution_time=0,
            top_results=[],
            success=False,
            error_message=str(e)
        )


@app.get("/test")
async def test_endpoint():
    return {
        "message": "Backend is connected!",
        "status": "success"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}