# Student Attendance Frontend

A modern React + TypeScript frontend for interacting with the StudentAttendance smart contract deployed on blockchain testnet. Built with **Privy** for seamless wallet authentication.

## 🎯 Features

- **Privy Wallet Authentication**: Secure, passwordless login via Privy
- **Embedded Wallet**: Users get an embedded wallet in Privy for signing transactions
- **Add Students**: Register new students with name and age
- **Track Attendance**: Mark students as present/absent
- **Real-time Updates**: View all student records fetched from blockchain
- **Responsive Design**: Mobile-friendly UI with gradient styling
- **Error Handling**: Clear error messages and feedback

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── AddStudent.tsx          # Form to add new students
│   │   ├── AddStudent.css
│   │   ├── StudentList.tsx         # Display all students
│   │   ├── StudentList.css
│   │   ├── WalletConnect.tsx       # Wallet connection UI
│   │   └── WalletConnect.css
│   ├── App.tsx                     # Main app component
│   ├── App.css
│   ├── BlockchainContext.tsx       # Blockchain interaction logic
│   ├── config.ts                   # Contract ABI & addresses
│   ├── main.tsx                    # React entry point
│   └── vite-env.d.ts
├── index.html                       # HTML entry point
├── vite.config.ts                  # Vite build configuration
├── tsconfig.json                   # TypeScript config
├── tsconfig.node.json
├── package.json
└── README.md
```

## 📋 Prerequisites

- Node.js v16+ and npm
- Privy account and app credentials (get from [Privy Console](https://console.privy.io/))
- Your deployed contract address
- TestNet tokens (Privy will handle wallet creation)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Privy & Contract Details

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Privy credentials and contract address:

```env
VITE_PRIVY_APP_ID=your_privy_app_id_from_console
VITE_PRIVY_SIGNER_ID=your_privy_signer_id
VITE_CONTRACT_ADDRESS=0x...  # Your deployed contract address
```

**Getting Privy Credentials:**
1. Go to [Privy Console](https://console.privy.io/)
2. Create a new project or select an existing one
3. Copy your `App ID` and `Signer ID`
4. Paste them in `.env`

### 3. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 4. Use the Frontend

1. Click "Login with Privy" in the top-right
2. Complete Privy authentication (email, SMS, or social login)
3. Your embedded wallet will be created automatically
4. Make sure you're on the correct network (Celo Sepolia Testnet 11142220)
5. Add students using the form on the left
6. Mark attendance by clicking the toggle buttons

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## 🔗 Blockchain Integration

### Connected Functions

The frontend connects to these smart contract functions:

**Write Functions (require gas):**
- `addStudent(name, age)` - Add a new student
- `updateAttendance(studentId, present)` - Mark attendance

**Read Functions (free):**
- `getAllStudents()` - Fetch all enrolled students
- `getStudent(id)` - Get specific student details
- `getTotalStudents()` - Get student count

### Events Tracked

- `StudentAdded(studentId, name, age)` - When a student is added
- `AttendanceUpdated(studentId, present)` - When attendance changes

## 📦 Key Dependencies

```json
{
  "react": "^18.2.0",               // UI framework
  "react-dom": "^18.2.0",           // React DOM rendering
  "ethers": "^6.9.0",               // Ethereum Web3 library
  "@privy-io/react-auth": "^1.75.0", // Privy authentication
  "@privy-io/wagmi-connector": "^0.10.0", // Wagmi integration
  "wagmi": "^2.5.0",                // Web3 connectors
  "viem": "^2.0.0",                 // Ethereum utilities
  "vite": "^5.0.0",                 // Build tool
  "typescript": "^5.3.0"            // Type safety
}
```

## 🔐 Security

- **No Private Keys Stored**: Privy manages all private keys securely
- **Passwordless Authentication**: Uses biometric, email, or social login
- **Embedded Wallets**: Users get secure embedded wallets via Privy
- **No MetaMask Required**: Works on any browser without extensions
- **Transaction Signing**: All blockchain interactions require user approval
- **.env File**: Never commit `.env` - it contains sensitive credentials

## 🌐 Supported Networks

The app is pre-configured for:

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Core Testnet2 | 1114 | https://rpc.test2.btcs.network |
| Celo Sepolia Testnet | 11142220 | https://forno.celo-sepolia.celo-testnet.org |

Add more networks in `src/config.ts` under `NETWORKS` object.

## 🎨 Styling

- Modern gradient design with purple/blue theme
- Fully responsive (works on mobile, tablet, desktop)
- Smooth transitions and hover effects
- Accessibility-friendly color contrast

## 🐛 Troubleshooting

### Privy App ID Not Found
- Make sure `.env` file exists with `VITE_PRIVY_APP_ID`
- Get a new App ID from [Privy Console](https://console.privy.io/)
- Restart the dev server after updating `.env`

### Privy Login Not Working
- Check your Privy app is properly configured in the console
- Verify the App ID matches your Privy project
- Check browser console for detailed error messages
- Clear cookies and browser cache

### Wrong Network Error
- Privy should default to the correct network (Celo Sepolia Testnet 11142220)
- Check the network settings in Privy console
- Manually switch networks in your Privy wallet settings
- Contact Privy support for network configuration

### Contract Address Invalid
- Update `VITE_CONTRACT_ADDRESS` in `.env`
- Make sure you use the full 42-character address (with 0x prefix)
- Contract must be deployed on Celo Sepolia Testnet (Chain ID 11142220)
- Check the address on [Celo Explorer](https://explorer.celo.org/alfajores)

### Out of Gas
- Privy embedded wallets need testnet balance
- Get Celo testnet tokens from [Celo Faucet](https://faucet.celo.org)
- Check your wallet balance in Privy settings
- Try again after balance updates

### Transactions Failing
- Normal on testnet - some networks are slow
- Check the transaction on [Celo Explorer](https://explorer.celo.org/alfajores)
- Don't submit duplicate transactions
- Ensure you have enough testnet balance for gas

## 📱 Responsive Design

The frontend is optimized for:
- **Desktop**: Full 2-column layout (form + list)
- **Tablet**: Responsive grid layout
- **Mobile**: Single column with sticky form

## 🚀 Production Build

When ready to deploy:

```bash
npm run build
```

Creates optimized production files in `dist/` directory.

Deploy to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## 📚 Component Guide

### BlockchainContext.tsx
Manages all blockchain interactions:
- Wallet connection
- Contract calls
- State management for students
- Error handling

### WalletConnect.tsx
Header component showing:
- Connection status
- Current account address
- Connect/Disconnect buttons

### AddStudent.tsx
Form component with:
- Input validation
- Transaction feedback
- Success/error messages

### StudentList.tsx
Table component displaying:
- All enrolled students
- Attendance status
- Toggle buttons for updating attendance

## 🔗 Useful Resources

- [Ethers.js Docs](https://docs.ethers.org/)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev)
- [MetaMask Docs](https://docs.metamask.io)

## 📝 License

MIT

---


# -Student-Attendance-System
