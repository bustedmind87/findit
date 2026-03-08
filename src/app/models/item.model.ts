export interface Item {
  id?: number;
  title: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  location?: string;
  dateFound?: string;
  dateLost?: string;
  type?: 'FOUND' | 'LOST';
  status?: 'PENDING' | 'APPROVED' | 'CLAIMED' | 'RETURNED' | 'REJECTED';
  priorityFlags?: string;
  photos?: string[];
  reporterContact?: string;
  createdAt?: string;
  claimedById?: number;
  claimedByName?: string;
  claimedAt?: string;
  syncStatus?: 'SYNCED' | 'LOCAL_PENDING_SYNC';
}
