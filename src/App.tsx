import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { celoAlfajores } from "viem/chains";
import { BlockchainProvider } from "./BlockchainContext";
import { WalletConnect } from "./components/WalletConnect";
import { AddStudent } from "./components/AddStudent";
import { StudentList } from "./components/StudentList";
import "./App.css";

// Custom Celo Sepolia Testnet chain configuration
const celoSepoliaTestnet = {
  id: 11142220,
  name: "Celo Sepolia Testnet",
  network: "celo-sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Celo",
    symbol: "CELO",
  },
  rpcUrls: {
    default: {
      http: ["https://forno.celo-sepolia.celo-testnet.org"],
    },
    public: {
      http: ["https://forno.celo-sepolia.celo-testnet.org"],
    },
  },
  blockExplorers: {
    default: { name: "Celoscan", url: "https://sepolia.celoscan.io" },
  },
  testnet: true,
};

const AppContent: React.FC = () => {
  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <h1>📚 Student Attendance System</h1>
          <p>Blockchain-based attendance tracking using smart contracts</p>
        </div>
        <WalletConnect />
      </header>

      <main className="main-content">
        <div className="section">
          <AddStudent />
        </div>
        <div className="section">
          <StudentList />
        </div>
      </main>

      <footer className="footer">
        <p>
            &copy; {new Date().getFullYear()} Student Attendance System. Built by <a target="_blank" href="https://www.linkedin.com/in/kehinde-fagbenro-0b3711259">Kenny</a>
        </p>
      </footer>
    </div>
  );
};

function App() {
  const appId = import.meta.env.VITE_PRIVY_APP_ID;

  if (!appId) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        <h2>Error: VITE_PRIVY_APP_ID not configured</h2>
        <p>Please add your Privy App ID to the .env file</p>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        supportedChains: [celoSepoliaTestnet],
        defaultChain: celoSepoliaTestnet,
      }}
    >
      <BlockchainProvider>
        <AppContent />
      </BlockchainProvider>
    </PrivyProvider>
  );
}

export default App;
