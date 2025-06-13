'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { searchService } from '@/service/searchService';
import SearchLayout from '@/layout/SearchLayout/SearchPage';
import SearchContent from '@/components/Search/SearchContent';
import SearchEmptyState from '@/components/Search/SearchEmptyState';

interface SearchData {
  users: any[];
  posts: any[];
  pages: any[];
  friends: any[];
  friendsOfFriends: any[];
  strangers: any[];
}

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const keyword = searchParams.get('keyword') || '';
  
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts' | 'pages'>('all');
  const [searchData, setSearchData] = useState<SearchData>({
    users: [],
    posts: [],
    pages: [],
    friends: [],
    friendsOfFriends: [],
    strangers: []
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userType: 'all',
    dateRange: 'all',
    postAuthor: 'all',
    customDateStart: '',
    customDateEnd: ''
  });

  useEffect(() => {
    if (keyword) {
      fetchSearchData();
    } else {
      setLoading(false);
    }
  }, [keyword]);

  const fetchSearchData = async () => {
    setLoading(true);
    try {
      const data = await searchService.searchAll(keyword);
      
      setSearchData({
        users: data.users || [],
        posts: data.posts || [],
        pages: data.pages || [],
        friends: [],
        friendsOfFriends: [],
        strangers: data.users || [],
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchData({
        users: [],
        posts: [],
        pages: [],
        friends: [],
        friendsOfFriends: [],
        strangers: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (keyword) {
      fetchSearchData();
    }
  }, [filters]);

  const handleTabChange = (tab: 'all' | 'users' | 'posts' | 'pages') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.push(`/search?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (!keyword) {
    return <SearchEmptyState />;
  }

  return (
    <SearchLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      filters={filters}
      onFilterChange={handleFilterChange}
      searchData={searchData}
    >
      <SearchContent
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchData={searchData}
        filters={filters}
        onFilterChange={handleFilterChange}
        keyword={keyword}
        loading={loading}
      />
    </SearchLayout>
  );
};

export default SearchPage;