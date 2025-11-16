export interface Trip {
  id: string;
  name: string;
  members: string[]; // array of user emails
  ownerId: string;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  addedBy: string; // user email
  dateTime?: string; // NEW: Stored as ISO string
  imageUrl?: string; // Adding this now for the next feature
}

export interface ExpenseContributor {
  email: string;
  // We can add more user info here later if needed, like a name or UID
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  paidBy: ExpenseContributor;
  splitBetween: ExpenseContributor[]; // Who the expense is shared among
  createdAt: string; // ISO String
}

export interface Balance {
  whoOwes: string;
  whoIsOwed: string;
  amount: number;
}