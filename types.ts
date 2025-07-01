
export enum Custodian {
  Unassigned = 'UNASSIGNED',
  Connar = 'CONNAR',
  Emma = 'EMMA',
}

export interface DayData {
  custodian: Custodian;
  notes?: string;
}

export interface CustodyData {
  [key: string]: DayData;
}

export interface CustodyTotals {
  [Custodian.Connar]: number;
  [Custodian.Emma]: number;
  [Custodian.Unassigned]: number;
}

export interface User {
  username: string;
  pin: string; // This is a securely hashed password.
}