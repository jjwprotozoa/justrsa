// lib/payment/eft.ts
// EFT bank details read from environment variables. Never hardcode account numbers.

export type EftDetails = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
};

export function getEftDetails(): EftDetails | null {
  const bankName = process.env.EFT_BANK_NAME?.trim();
  const accountName = process.env.EFT_ACCOUNT_NAME?.trim();
  const accountNumber = process.env.EFT_ACCOUNT_NUMBER?.trim();
  const branchCode = process.env.EFT_BRANCH_CODE?.trim();
  const accountType = process.env.EFT_ACCOUNT_TYPE?.trim() ?? "Cheque / Current";

  if (!bankName || !accountName || !accountNumber || !branchCode) {
    return null;
  }

  return { bankName, accountName, accountNumber, branchCode, accountType };
}

export function eftConfigured(): boolean {
  return getEftDetails() !== null;
}
