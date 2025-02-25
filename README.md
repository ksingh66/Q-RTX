# Quantum Circuit Simulator

A visual quantum circuit builder and GPU-accelerated simulator that leverages NVIDIA's cuQuantum and Qiskit to provide fast and accurate quantum circuit simulations.

## Overview

This application provides an intuitive drag-and-drop interface for building quantum circuits and simulating them using your local NVIDIA GPU. With support for up to 25 qubits, this simulator bridges the gap between theoretical quantum computing concepts and practical implementation.

![Quantum Circuit Simulator Interface](placeholder-for-screenshot.png)

## Key Features

- Interactive drag-and-drop quantum circuit builder
- GPU-accelerated quantum simulations using NVIDIA cuQuantum
- Support for basic quantum gates (H, X, Y, Z, CNOT, SWAP)
- Advanced gate support planned for future releases
- Real-time circuit analysis and resource usage statistics
- Simulation of up to 25 qubits (GPU-dependent)
- Built on Qiskit and FastAPI for reliable quantum simulations

## Requirements

- NVIDIA GPU with CUDA support
- CUDA Toolkit 12.1 or compatible version
- Docker with NVIDIA Container Toolkit
- Node.js 18 or higher and npm

## Setup Instructions

This application requires two components to run:

1. A Docker-based backend (for GPU acceleration)
2. A locally run React frontend

### Backend Setup with Docker

The backend requires Docker with NVIDIA GPU support to enable the quantum simulations to run on your GPU.

1. Make sure you have Docker and the NVIDIA Container Toolkit installed:

   ```bash
   # Check Docker installation
   docker --version

   # Check NVIDIA Docker support
   nvidia-smi
   ```

2. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/quantum-circuit-simulator.git
   cd quantum-circuit-simulator
   ```

3. Build the Docker container for the backend (first time only):

   ```bash
   cd backend
   docker build -t quantum-simulator-backend .
   ```

4. Run the backend container with GPU access:

   ```bash
   docker run --gpus all -p 8000:8000 quantum-simulator-backend
   ```

   The backend will now be running at `http://localhost:8000`

### Frontend Setup

The frontend is a React application that runs directly on your local machine.

1. Open a new terminal window and navigate to the frontend directory:

   ```bash
   cd ../frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. The frontend will be available at `http://localhost:5173`

## Using the Quantum Circuit Simulator

### Building Your First Circuit

1. **Set the number of qubits**: Use the "+" and "-" buttons to select the number of qubits (up to 25) for your circuit, then click "Confirm".

2. **Add gates to your circuit**: Drag gates from the "Basic Gates" section onto the circuit grid. Place them on the appropriate qubit and time step.

3. **Working with multi-qubit gates**: For gates like CNOT, first click the gate in the gate palette, then click on the control qubit first, followed by the target qubit.

4. **Clear the circuit**: Use the "Clear" button to reset your circuit if needed.

### Running Simulations

1. Click the "Run Simulation" button to execute the quantum circuit on your GPU.

2. The simulation results will display the measurement outcomes as a histogram, showing the probability distribution of possible states.

3. For complex circuits, the simulation might take longer depending on your GPU capabilities.

### Analyzing Circuit Properties

The "Resource Usage" panel provides real-time analysis of your circuit:

- **Gate Count**: Total number of quantum gates in your circuit
- **Circuit Depth**: The longest path through your quantum circuit
- **Circuit Width**: Number of qubits in use
- **Two-Qubit Gate Count**: Number of entangling operations
- **Estimated Complexity**: Qualitative assessment of circuit complexity

## Understanding Quantum Gates

### Basic Gates

- **H (Hadamard)**: Creates superposition by putting a qubit in an equal combination of 0 and 1
- **X (NOT gate)**: Flips a qubit from 0 to 1 or 1 to 0
- **Y**: Applies a Y-axis rotation on the Bloch sphere
- **Z**: Applies a phase flip
- **CNOT**: Conditional NOT gate that flips the target qubit if the control qubit is 1
- **SWAP**: Exchanges the state of two qubits

### Advanced Gates (Coming Soon)

- **T**: A phase rotation gate
- **S**: Another phase rotation gate
- **Rx, Ry, Rz**: Rotation gates around the x, y, and z axes

## Troubleshooting

### Common Issues

1. **"CUDA not available" error**: Ensure your NVIDIA drivers are up to date and that CUDA is properly installed.

2. **Docker GPU access issues**: Make sure the NVIDIA Container Toolkit is properly installed and that Docker has access to your GPU.

   ```bash
   # Check if NVIDIA Docker works properly
   docker run --gpus all nvidia/cuda:12.1.0-base-ubuntu22.04 nvidia-smi
   ```

3. **Connection refused between frontend and backend**: Make sure both services are running and that there are no firewall rules blocking the connection.

4. **Performance issues with large circuits**: Simulating circuits with many qubits requires significant GPU memory. Try reducing the circuit size or using a GPU with more memory.

### Checking NVIDIA Docker Setup

If you're having issues with GPU access in Docker, follow these steps:

1. Install the NVIDIA Container Toolkit:

   ```bash
   distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
   curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
   curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
   sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
   sudo systemctl restart docker
   ```

2. Verify your setup:
   ```bash
   docker run --gpus all nvidia/cuda:12.1.0-base-ubuntu22.04 nvidia-smi
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The Qiskit team for their excellent quantum computing framework
- NVIDIA for cuQuantum and GPU acceleration capabilities
- All contributors who help improve this project
