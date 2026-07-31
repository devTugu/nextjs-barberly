export interface BrandCatalogSyncBranch {
  tenantId: number;
  name: string;
  subdomain: string;
  lastSyncedAt: string | null;
  needsSync: boolean;
}

export interface BrandCatalogSyncStatus {
  brandRootId: number;
  brandName: string;
  catalogUpdatedAt: string | null;
  hasPendingChanges: boolean;
  branches: BrandCatalogSyncBranch[];
}
