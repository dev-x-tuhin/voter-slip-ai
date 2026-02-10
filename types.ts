export interface VoterInfo {
  voterId?: string;
  name?: string;
  fatherOrHusbandName?: string;
  age?: string | number;
  gender?: string;
  address?: string;
  pollingStation?: string;
  slNo?: string | number;
  partNo?: string | number;
}

export interface SearchCriteria {
  query?: string;
  voterId?: string;
  name?: string;
  fatherName?: string;
  exactMatchVoterId?: boolean;
  exactMatchName?: boolean;
}

export enum SearchStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  FOUND = 'FOUND',
  NOT_FOUND = 'NOT_FOUND',
  ERROR = 'ERROR'
}