import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Kedai } from '@/types/kedai';
import { toast } from 'sonner';

export interface Bookmark {
  id: string;
  user_id: string;
  kedai_name: string;
  kedai_address: string | null;
  kedai_rating: number | null;
  kedai_price_level: string | null;
  kedai_image: string | null;
  kedai_place_id: string | null;
  kedai_lat: number | null;
  kedai_lon: number | null;
  created_at: string;
}

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    } else {
      setBookmarks([]);
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBookmark = async (kedai: Kedai, image: string | null) => {
    if (!user) {
      toast.error('Please login to save bookmarks');
      return false;
    }

    try {
      const bookmarkData = {
        user_id: user.id,
        kedai_name: kedai.name,
        kedai_address: kedai.area || null,
        kedai_rating: kedai.rating || null,
        kedai_price_level: kedai.price_level || null,
        kedai_image: image || null,
        kedai_place_id: kedai.id || null,
        kedai_lat: kedai.lat || null,
        kedai_lon: kedai.lon || null,
      };

      console.log('Adding bookmark:', bookmarkData);

      const { data, error } = await supabase
        .from('bookmarks')
        .insert(bookmarkData)
        .select();

      if (error) {
        console.error('Bookmark insert error:', error);
        if (error.code === '23505') {
          toast.info('Already saved!');
          return false;
        }
        if (error.code === '42501') {
          toast.error('Permission denied. Please check your account.');
          return false;
        }
        throw error;
      }

      console.log('Bookmark added successfully:', data);
      toast.success('Saved to bookmarks! 🔖');
      await fetchBookmarks();
      return true;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save bookmark: ${errorMessage}`);
      return false;
    }
  };

  const removeBookmark = async (kedaiPlaceId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('kedai_place_id', kedaiPlaceId);

      if (error) throw error;

      toast.success('Removed from bookmarks');
      await fetchBookmarks();
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Failed to remove bookmark');
      return false;
    }
  };

  const isBookmarked = (kedaiPlaceId: string) => {
    return bookmarks.some(b => b.kedai_place_id === kedaiPlaceId);
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    fetchBookmarks,
  };
}
