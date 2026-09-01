// lib/payment/types.ts
// Shared shapes for the pre-order checkout.

import type { Size } from "../products";
import type { EftDetails } from "./eft";

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
      status: "eft";
      orderId: string;
      reference: string;
      total: number;
      eft: EftDetails;
    }
  | {
      status: "redirect";
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

export type { EftDetails };
