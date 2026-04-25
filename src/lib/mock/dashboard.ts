// Dữ liệu giả lập cho Phase 1 — toàn bộ dashboard hoạt động bằng mock
// cho tới Phase 2, lúc đó thay bằng Supabase query.

export type InProgressProject = {
  id: string;
  name: string;
  chain: string;
  progress: number; // 0-100
};

export type CompletedProject = {
  id: string;
  name: string;
  chain: string;
  completedOn: string; // dd/MM/yyyy đã format sẵn
};

export type MockWallet = {
  id: string;
  index: number;
  name: string;
  address: string;        // đầy đủ, UI tự rút gọn
  chain: string;
  balanceUsd: number;
  twitter: string | null;
  discord: string | null;
  email: string | null;
  notes: string | null;
  avatarColor: string;    // hex cho ô initials
  initial: string;        // 1 chữ cái
};

export const mockKpis = {
  inProgress: {
    value: 5,
    hint: "2 so với tuần trước",
    sparkline: [2, 3, 2, 4, 3, 5, 4, 5, 5, 5, 5]
  },
  completed: {
    value: 12,
    hint: "3 so với tuần trước",
    sparkline: [6, 7, 8, 8, 9, 10, 10, 11, 12, 12, 12]
  },
  wallets: {
    value: 38,
    hint: "Trên 8 blockchain",
    sparkline: [20, 24, 27, 30, 32, 34, 35, 36, 37, 38, 38]
  },
  totalUsd: {
    value: "$12,450.64",
    hint: "8.5% so với tuần trước",
    sparkline: [8200, 8600, 9100, 9500, 10100, 10800, 11200, 11700, 12100, 12300, 12450]
  }
};

export const mockInProgress: InProgressProject[] = [
  { id: "p1", name: "Monad Airdrop",     chain: "monad",       progress: 75 },
  { id: "p2", name: "Berachain Points",  chain: "berachain",   progress: 60 },
  { id: "p3", name: "Solana Testnet",    chain: "solana",      progress: 40 },
  { id: "p4", name: "EigenLayer Restake",chain: "ethereum",    progress: 30 },
  { id: "p5", name: "LayerZero ZRO",     chain: "multi-chain", progress: 20 }
];

export const mockCompleted: CompletedProject[] = [
  { id: "c1", name: "StarkNet Airdrop",  chain: "starknet",    completedOn: "08/05/2024" },
  { id: "c2", name: "Jupiter Airdrop",   chain: "solana",      completedOn: "02/05/2024" },
  { id: "c3", name: "ZetaChain Testnet", chain: "zetachain",   completedOn: "28/04/2024" },
  { id: "c4", name: "Manta Pacific",     chain: "manta",       completedOn: "20/04/2024" },
  { id: "c5", name: "Galxe Campaign",    chain: "multi-chain", completedOn: "15/04/2024" }
];

export const mockWallets: MockWallet[] = [
  {
    id: "w1", index: 1, name: "Main Wallet", initial: "M",
    address: "0x3aF200000000000000000000000000000000008d4B",
    chain: "ethereum", balanceUsd: 5231.42,
    twitter: "@chidung_web3", discord: "chi_dung#1234", email: "chi.dung@mail.com",
    notes: "Ví chính - lưu tài sản", avatarColor: "#A78BFA"
  },
  {
    id: "w2", index: 2, name: "Farm Wallet #01", initial: "F",
    address: "0x7bC900000000000000000000000000000000a1E2",
    chain: "monad", balanceUsd: 1248.75,
    twitter: "@airdrop_dung01", discord: "farm01#5678", email: "farm01@mail.com",
    notes: "Farm airdrop Monad", avatarColor: "#FB923C"
  },
  {
    id: "w3", index: 3, name: "Berachain Wallet", initial: "B",
    address: "0x9d8E00000000000000000000000000000000f3A7",
    chain: "berachain", balanceUsd: 2870.10,
    twitter: "@berachain_dung", discord: "bera_dung#2222", email: "bera@mail.com",
    notes: "Wave 2", avatarColor: "#38BDF8"
  },
  {
    id: "w4", index: 4, name: "Solana Wallet", initial: "S",
    address: "8xYdJ000000000000000000000000000000000m9kL",
    chain: "solana", balanceUsd: 3100.37,
    twitter: "@solana_dung", discord: "sol_dung#3434", email: "sol.dung@mail.com",
    notes: "Ví chính Solana", avatarColor: "#22C55E"
  },
  {
    id: "w5", index: 5, name: "Testnet Wallet", initial: "T",
    address: "0x1b7A0000000000000000000000000000000000c9D1",
    chain: "arbitrum", balanceUsd: 45.22,
    twitter: "@testnet_dung", discord: "test_dung#8888", email: "testnet@mail.com",
    notes: "Testnet các chain", avatarColor: "#F472B6"
  }
];

export const mockPaginationTotal = 38;
