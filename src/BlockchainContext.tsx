import React, { createContext, useState, useCallback, ReactNode } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import { STUDENT_ATTENDANCE_ABI, CONTRACT_ADDRESS, RPC_ENDPOINTS } from "./config";

export interface Student {
  name: string;
  age: number;
  present: boolean;
}

export interface BlockchainContextType {
  connected: boolean;
  account: string | null;
  students: Student[];
  loading: boolean;
  error: string | null;
  status: string | null;
  login: () => Promise<void>;
  logout: () => void;
  addStudent: (name: string, age: number) => Promise<void>;
  updateAttendance: (studentId: number, present: boolean) => Promise<void>;
  fetchStudents: () => Promise<void>;
  rpcStatus?: string;
}

// Helper function to try multiple RPC endpoints
async function getProviderWithFallback(
  rpcUrls: string[],
  chainId: number
): Promise<JsonRpcProvider> {
  const errors: string[] = [];

  for (let i = 0; i < rpcUrls.length; i++) {
    try {
      const rpcUrl = rpcUrls[i];
      console.log(`Trying RPC endpoint ${i + 1}/${rpcUrls.length}: ${rpcUrl}`);
      
      const provider = new JsonRpcProvider(rpcUrl, chainId);
      
      // Test the connection
      const network = await provider.getNetwork();
      console.log(`✓ Connected to RPC: ${rpcUrl}`);
      
      return provider;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push(`${rpcUrls[i]}: ${errorMsg}`);
      console.warn(`✗ RPC endpoint failed: ${errorMsg}`);
    }
  }

  throw new Error(
    `All RPC endpoints failed. Tried:\n${errors.join("\n")}\n\nConsider using a different RPC endpoint or check your internet connection.`
  );
}

export const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

interface BlockchainProviderProps {
  children: ReactNode;
}

export const BlockchainProvider: React.FC<BlockchainProviderProps> = ({ children }) => {
  const { login: privyLogin, logout: privyLogout, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Debug logging to help identify wallet issues
  React.useEffect(() => {
    console.log("BlockchainProvider state:", {
      authenticated,
      ready,
      walletsCount: wallets.length,
      wallets: wallets.map((w) => ({
        type: w.walletClientType,
        address: w.address,
        chainId: (w as any).chainId,
      })),
    });
  }, [authenticated, ready, wallets]);

  // Find the embedded wallet - try multiple detection methods
  const embeddedWallet = React.useMemo(() => {
    // First try to find by walletClientType
    let wallet = wallets.find((w) => w.walletClientType === "privy");
    
    // If not found, get the first wallet (which is usually the embedded one)
    if (!wallet && wallets.length > 0) {
      wallet = wallets[0];
    }
    
    return wallet;
  }, [wallets]);

  const getProvider = useCallback(async () => {
    // First try to use Privy's embedded wallet
    if (embeddedWallet) {
      try {
        console.log("Attempting to use Privy embedded wallet...");
        await embeddedWallet.switchChain(11142220); // Celo Sepolia Testnet (correct deployment)
        const provider = await embeddedWallet.getEthersProvider();
        
        if (!provider) {
          throw new Error("Failed to get provider from embedded wallet");
        }
        
        console.log("✓ Using Privy embedded wallet provider");
        return provider;
      } catch (err) {
        console.warn("Privy wallet failed, falling back to RPC endpoints:", err);
      }
    }

    // Fallback to direct RPC provider if Privy fails
    console.log("Using fallback RPC provider with multiple endpoints...");
    const rpcUrls = RPC_ENDPOINTS.celo_testnet;
    return getProviderWithFallback(rpcUrls, 11142220); // Celo Sepolia Testnet (correct deployment)
  }, [embeddedWallet]);

  const getContract = useCallback(async () => {
    // For write operations, we MUST use the embedded wallet with a signer
    if (!embeddedWallet) {
      throw new Error("Wallet not connected. Please login first.");
    }

    try {
      console.log("Getting signer from embedded wallet...");
      const provider = await embeddedWallet.getEthersProvider();
      if (!provider) {
        throw new Error("Failed to get provider from embedded wallet");
      }

      const signer = await provider.getSigner();
      console.log("Signer obtained:", signer);
      
      return new Contract(CONTRACT_ADDRESS, STUDENT_ATTENDANCE_ABI, signer);
    } catch (err) {
      console.error("Failed to get contract with signer:", err);
      throw new Error(`Contract error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [embeddedWallet]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!authenticated) {
        console.log("Not authenticated, skipping fetch");
        setStudents([]);
        return;
      }

      if (!embeddedWallet) {
        setError("Wallet not available yet. Please try again.");
        console.warn("Wallet not available");
        return;
      }

      console.log("Fetching students from contract...");
      const provider = await getProvider();
      console.log("Provider obtained, creating contract instance");
      const contract = new Contract(CONTRACT_ADDRESS, STUDENT_ATTENDANCE_ABI, provider);
      
      console.log("Calling getAllStudents()...");
      const allStudents = await contract.getAllStudents();
      console.log("getAllStudents() returned:", allStudents);
      
      // Convert to proper Student interface
      const formattedStudents = allStudents.map((student: any) => ({
        name: student.name,
        age: Number(student.age),
        present: Boolean(student.present),
      }));
      
      console.log("Formatted students:", formattedStudents);
      setStudents(formattedStudents);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch students";
      setError(errorMsg);
      console.error("Fetch students error:", err);
      console.error("Error details:", {
        name: err instanceof Error ? err.name : "Unknown",
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [authenticated, embeddedWallet, getProvider]);

  const addStudent = useCallback(
    async (name: string, age: number) => {
      const maxRetries = 3;
      let lastError: Error | null = null;

      try {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            setLoading(true);
            setError(null);

            console.log(`[AddStudent] Attempt ${attempt}/${maxRetries}: Adding ${name} (age ${age})`);
            
            // Get contract with signer from embedded wallet
            const contract = await getContract();
            console.log(`[AddStudent] Contract created, calling addStudent()...`);
            
            // Call contract function
            const tx = await contract.addStudent(name, age);
            console.log(`[AddStudent] Transaction sent: ${tx.hash}`);
            
            setStatus(`Transaction submitted: ${tx.hash}. Waiting for confirmation...`);
            
            // Wait for transaction confirmation
            console.log(`[AddStudent] Waiting for confirmation...`);
            const provider = await getProvider();
            const receipt = await provider.waitForTransaction(tx.hash, 1, 60000);
            
            if (!receipt) {
              throw new Error("Transaction failed or timed out");
            }
            
            console.log(`[AddStudent] ✓ Transaction confirmed. Block: ${receipt.blockNumber}`);
            setError(null);
            setStatus(null);
            
            // Refresh student list
            console.log(`[AddStudent] Fetching updated student list...`);
            await fetchStudents();
            
            console.log(`[AddStudent] ✓ Student added successfully!`);
            return;
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            console.warn(`[AddStudent] Attempt ${attempt} failed:`, lastError.message);

            if (attempt < maxRetries) {
              const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
              console.log(`[AddStudent] Retrying in ${delay}ms...`);
              setStatus(
                `Connection issue. Retrying in ${Math.round(delay / 1000)}s... (${attempt}/${maxRetries})`
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        }

        // All retries failed
        const errorMsg =
          lastError?.message ||
          `Failed to add student after ${maxRetries} attempts`;
        setError(errorMsg);
        console.error(`[AddStudent] ✗ Failed after ${maxRetries} attempts:`, errorMsg);
        throw lastError || new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [getContract, getProvider, fetchStudents]
  );

  const updateAttendance = useCallback(
    async (studentId: number, present: boolean) => {
      const maxRetries = 3;
      let lastError: Error | null = null;

      try {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            setLoading(true);
            setError(null);

            console.log(`Updating attendance (attempt ${attempt}/${maxRetries})...`);
            const provider = await getProvider();
            const contract = await getContract();
            const tx = await contract.updateAttendance(studentId, present);
            
            setStatus(`Transaction submitted: ${tx.hash}. Waiting for confirmation...`);
            // Use provider.waitForTransaction to avoid Privy's incompatible listener
            const receipt = await provider.waitForTransaction(tx.hash, 1, 60000);
            
            if (!receipt) {
              throw new Error("Transaction failed or timed out");
            }
            
            console.log("✓ Attendance updated successfully. Hash:", tx.hash);
            setError(null);
            setStatus(null);
            await fetchStudents();
            return;
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            console.warn(`Attempt ${attempt} failed:`, lastError.message);

            if (attempt < maxRetries) {
              // Wait before retrying (exponential backoff)
              const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
              console.log(`Retrying in ${delay}ms...`);
              setStatus(
                `Connection issue. Retrying in ${Math.round(delay / 1000)}s... (${attempt}/${maxRetries})`
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        }

        // All retries failed
        const errorMsg =
          lastError?.message ||
          `Failed to update attendance after ${maxRetries} attempts`;
        setError(errorMsg);
        throw lastError || new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [getContract, fetchStudents]
  );

  const handleLogin = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await privyLogin();
      
      // Wait for wallet to be initialized (up to 3 seconds)
      let attempts = 0;
      while (attempts < 30) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const wallet = wallets.find((w) => w.walletClientType === "privy" || w.address);
        if (wallet) {
          // Wallet is ready, fetch students
          setTimeout(() => fetchStudents(), 500);
          return;
        }
        attempts++;
      }
      
      setError("Wallet initialization timed out. Please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  }, [privyLogin, fetchStudents, wallets]);

  const handleLogout = useCallback(() => {
    privyLogout();
    setStudents([]);
  }, [privyLogout]);

  // Auto-load students when authenticated and wallet is ready
  React.useEffect(() => {
    if (authenticated && embeddedWallet) {
      console.log("[BlockchainContext] User authenticated with wallet, fetching students...");
      fetchStudents();
    } else if (!authenticated) {
      console.log("[BlockchainContext] User not authenticated, clearing students");
      setStudents([]);
    }
  }, [authenticated, embeddedWallet, fetchStudents]);

  const value: BlockchainContextType = {
    connected: authenticated && !!embeddedWallet,
    account: embeddedWallet?.address || null,
    students,
    loading,
    error,
    status,
    login: handleLogin,
    logout: handleLogout,
    addStudent,
    updateAttendance,
    fetchStudents,
  };

  return (
    <BlockchainContext.Provider value={value}>{children}</BlockchainContext.Provider>
  );
};

export const useBlockchain = (): BlockchainContextType => {
  const context = React.useContext(BlockchainContext);
  if (!context) {
    throw new Error("useBlockchain must be used within BlockchainProvider");
  }
  return context;
};
