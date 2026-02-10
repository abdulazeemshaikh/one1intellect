import React from 'react';

export interface SearchResultItem {
  id: string;
  title: string;
  category: string;
  createdDate: string;
  summary: string;
  fullContent?: string;
}

export type SearchResults = SearchResultItem[];

export interface CategoryCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  className?: string;
}