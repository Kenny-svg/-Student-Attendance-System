export const STUDENT_ATTENDANCE_ABI = [
  {
    type: "event",
    name: "StudentAdded",
    inputs: [
      { name: "studentId", type: "uint256", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "age", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AttendanceUpdated",
    inputs: [
      { name: "studentId", type: "uint256", indexed: true },
      { name: "present", type: "bool", indexed: false },
    ],
  },
  {
    type: "function",
    name: "addStudent",
    inputs: [
      { name: "_name", type: "string" },
      { name: "_age", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateAttendance",
    inputs: [
      { name: "_studentId", type: "uint256" },
      { name: "_present", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getStudent",
    inputs: [{ name: "_studentId", type: "uint256" }],
    outputs: [
      {
        components: [
          { name: "name", type: "string" },
          { name: "age", type: "uint256" },
          { name: "present", type: "bool" },
        ],
        type: "tuple",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTotalStudents",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAllStudents",
    inputs: [],
    outputs: [
      {
        components: [
          { name: "name", type: "string" },
          { name: "age", type: "uint256" },
          { name: "present", type: "bool" },
        ],
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "students",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "age", type: "uint256" },
      { name: "present", type: "bool" },
    ],
    stateMutability: "view",
  },
];

// **IMPORTANT**: Replace with your deployed contract address
// You can set this in .env file as VITE_CONTRACT_ADDRESS
export const CONTRACT_ADDRESS = 
  import.meta.env.VITE_CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890";

// Multiple RPC endpoints for fallback support (if one fails, try the next)
export const RPC_ENDPOINTS = {
  celo_testnet: [
    // Primary endpoint - Celo Sepolia Testnet
    "https://forno.celo-sepolia.celo-testnet.org",
    // Alternative Sepolia endpoint
    "https://celo-sepolia.blockpi.network/v1/rpc/public",
  ],
  core_testnet2: [
    "https://rpc.test2.btcs.network",
  ],
};

// Supported networks
export const NETWORKS = {
  celo_testnet: {
    chainId: 11142220, // Celo Sepolia Testnet (the correct chain ID from deployment)
    name: "Celo Sepolia Testnet",
    rpcUrls: RPC_ENDPOINTS.celo_testnet,
    rpcUrl: RPC_ENDPOINTS.celo_testnet[0], // Primary for display
    explorerUrl: "https://sepolia.celoscan.io",
    symbol: "CELO",
  },
  core_testnet2: {
    chainId: 1114,
    name: "Core Blockchain TestNet2",
    rpcUrls: RPC_ENDPOINTS.core_testnet2,
    rpcUrl: RPC_ENDPOINTS.core_testnet2[0],
    explorerUrl: "https://scan.test2.btcs.network",
    symbol: "tCORE2",
  },
};

// Default network (Celo Testnet - where contract was deployed)
export const DEFAULT_NETWORK = NETWORKS.celo_testnet;
