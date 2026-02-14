import React from "react";
import { useBlockchain } from "../BlockchainContext";
import "./WalletConnect.css";

export const WalletConnect: React.FC = () => {
  const { connected, account, login, logout, error, loading } = useBlockchain();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-connect">
      <div className="status-container">
        {connected ? (
          <div className="connected">
            <div className="status-badge connected">● Connected</div>
            <div className="account-info">
              <span className="label">Account:</span>
              <code>{truncateAddress(account!)}</code>
            </div>
            <button onClick={logout} className="disconnect-btn" disabled={loading}>
              {loading ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        ) : (
          <div className="disconnected">
            <div className="status-badge disconnected">● Not Connected</div>
            <button onClick={login} className="connect-btn" disabled={loading}>
              {loading ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};
