// lib/payment/types.ts
// Shared shapes for the pre-order checkout. Kept free of any provider specifics
// so swapping payment gateways never touches the UI.

import type { Size } from "../products";

export type Customer = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
};

export type PreorderLine = {
  productId: string;
  name: string;
  size: Size;
  quantity: number;
  /** Unit price in rand. */
  unitPrice: number;
};

export type PreorderRequest = {
  customer: Customer;
  lines: PreorderLine[];
  /** Order total in rand. */
  total: number;
  currency: "ZAR";
};

export type PreorderResult =
  | {
      status: "redirect";
      /** Hosted payment page supplied by the provider. */
      url: string;
    }
  | {
      status: "unavailable";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };
