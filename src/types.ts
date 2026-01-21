export interface CardPartner {
  id: string
  name: string
  link: string
  tags: string[]
  icon: string
  color: string
}

export interface UserCard {
  id: string
  partnerId: string
  name: string
  providerName: string
  tags: string[]
  url?: string
  createdAt: number
  favorite: boolean
  status: 'active' | 'pending' | 'rejected'
}

export interface ActivityItem {
  id: string
  type: "Send" | "Receive" | "Swap" | "Contract"
  asset: string
  amount: string
  status: "Success" | "Pending" | "Failed"
  date: string // ISO string or formatted string
  timestamp: number // For sorting
  hash: string
  from?: string
  to?: string
}
