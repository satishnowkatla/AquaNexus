import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Modal, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../utils/supabase';
import { API_URL } from '../utils/constants';
import { theme } from '../utils/theme';
import { MODULE_COLOR_MAP } from '../utils/moduleConfig';
import { fetchLiveAlerts, getFeedPrices } from '../utils/liveData';

const MODULE_COLOR = MODULE_COLOR_MAP.aquaconnect;
const COOP_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

function classifySpecies(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('shrimp') || n.includes('vannamei') || n.includes('whiteleg')) return 'shrimp';
  if (n.includes('prawn') || n.includes('tiger') && n.includes('prawn')) return 'prawn';
  if (n.includes('crab') || n.includes('lobster') || n.includes('mussel') || n.includes('oyster')) return 'crab';
  const fw = ['rohu', 'catla', 'mrigal', 'tilapia', 'roopchand', 'carp', 'murrel', 'magur',
    'pangas', 'featherback', 'snakehead', 'gourami', 'trout', 'mahseer', 'barb', 'anabas', 'channa'];
  if (fw.some(k => n.includes(k))) return 'freshwater_fish';
  const mw = ['mackerel', 'sardine', 'anchovy', 'pomfret', 'tuna', 'seer', 'king fish',
    'kingfish', 'barracuda', 'shark', 'grouper', 'snapper', 'trevally', 'hilsa',
    'milkfish', 'croaker', 'threadfin', 'seabass', 'sea bass'];
  if (mw.some(k => n.includes(k))) return 'marine_fish';
  if (n.includes('fish') || n.includes('mathi') || n.includes('nethili')) return 'marine_fish';
  return 'other';
}

const POST_ICONS: Record<string, string> = { question: '❓', tip: '💡', alert: '⚠️', general: '💬' };
const POST_COLORS: Record<string, string> = { question: theme.colors.blue, tip: theme.colors.green, alert: theme.colors.red, general: theme.colors.textLight };
const TREND_ICONS: Record<string, string> = { up: '↑', down: '↓', stable: '→' };
const TREND_COLORS: Record<string, string> = { up: theme.colors.green, down: theme.colors.red, stable: theme.colors.amber };

type Post = {
  id: string; content: string; post_type: string;
  likes_count: number; comments_count: number;
  created_at: string; user_id: string;
  users?: { full_name: string };
  community_comments?: { id: string; content: string; created_at: string; users?: { full_name: string } }[];
};
type Comment = {
  id: string; post_id: string; user_id: string; content: string; created_at: string;
  users?: { full_name: string };
};
type MarketPrice = {
  id: string; species: string; variety: string;
  price_per_kg: number; min_price?: number; max_price?: number;
  market_name: string;
  district: string; price_date: string; trend: string;
  data_source?: string; unit?: string; species_type?: string;
};
type Member = {
  id: string; full_name: string; phone: string;
  role: string; created_at: string;
  profiles?: { district?: string; village?: string; pincode?: string; primary_species?: string; total_pond_area?: number; years_experience?: number }[];
  ponds?: { id: string; name: string; area_acres: number; species: string; stocking_density?: number; stocking_date?: string; expected_harvest_date?: string; status?: string }[];
};
type Alert = {
  id: string; title: string; message: string;
  alert_type: string; priority: string; created_at: string;
  district?: string; source?: string; action?: string;
};
type FeedIngredient = {
  id: string; name: string; name_te: string; category: string;
  price_per_kg: number; trend: string; change_percent: number;
  price_date: string; source: string;
};

export default function AquaConnectScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'feed' | 'market' | 'members' | 'alerts'>('feed');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostType, setNewPostType] = useState<string>('general');
  const [posting, setPosting] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedSpeciesType, setSelectedSpeciesType] = useState<string>('all');
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [marketList, setMarketList] = useState<Array<{ id: number; name: string; district: string }>>([]);
  const [selectedFarmerDistrict, setSelectedFarmerDistrict] = useState<string>('all');
  const [expandedFarmer, setExpandedFarmer] = useState<string | null>(null);
  const [feedPrices, setFeedPrices] = useState<FeedIngredient[]>([]);
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [alertDistrict, setAlertDistrict] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch community data from Supabase + weather directly
      const [postsRes, membersRes, alertsRes, weatherRes] = await Promise.all([
        supabase.from('community_posts').select('*, users(full_name), community_comments(id, content, created_at, users(full_name))').eq('cooperative_id', COOP_ID).order('created_at', { ascending: false }).limit(30),
        supabase.from('users').select('id, full_name, phone, role, created_at, profiles(district, village, pincode, primary_species, total_pond_area, years_experience), ponds(id, name, area_acres, species, stocking_density, stocking_date, expected_harvest_date, status)').order('created_at', { ascending: false }),
        supabase.from('cooperative_alerts').select('*').eq('cooperative_id', COOP_ID).order('created_at', { ascending: false }).limit(20),
        fetch('https://api.open-meteo.com/v1/forecast?latitude=16.5062&longitude=80.6480&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Asia%2FKolkata&forecast_days=7').then(r => r.json()).catch(() => null),
      ]);
      if (postsRes.data) setPosts(postsRes.data);
      if (membersRes.data) setMembers(membersRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (weatherRes) setWeather(weatherRes);

      // Try live NFDB data from backend (longer timeout — backend fetches 8 markets in parallel)
      let gotLivePrices = false;
      try {
        const [liveRes, marketsRes] = await Promise.all([
          fetch(`${API_URL}/api/market/prices`, { signal: AbortSignal.timeout(25000) }),
          fetch(`${API_URL}/api/market/markets`, { signal: AbortSignal.timeout(10000) }).then(r => r.json()).catch(() => null),
        ]);
        if (marketsRes?.success && marketsRes.data) setMarketList(marketsRes.data);
        if (liveRes.ok) {
          const liveData = await liveRes.json();
          if (liveData.success && liveData.data?.length > 0) {
            const mapped = liveData.data.map((p: any, i: number) => ({
              id: `live-${i}`,
              species: p.species,
              variety: p.variety,
              price_per_kg: p.price_per_kg,
              min_price: p.min_price,
              max_price: p.max_price,
              market_name: p.market_name,
              district: p.district,
              price_date: p.price_date || new Date().toISOString().split('T')[0],
              trend: p.trend,
              data_source: p.data_source || 'nfdb_govt',
              unit: p.unit || 'per_kg',
              species_type: p.species_type || classifySpecies(p.species || ''),
            }));
            setPrices(mapped);
            gotLivePrices = true;
            setDataSource('NFDB FMPIS (Govt of India)');
            const latestDate = mapped[0]?.price_date;
            if (latestDate) setLastUpdated(new Date(latestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
          }
        }
      } catch {
        // Backend unavailable, fall through to Supabase
      }

      // Fallback: Supabase benchmark prices
      if (!gotLivePrices) {
        const pricesRes = await supabase.from('market_prices').select('*').order('price_date', { ascending: false }).order('species').limit(50);
        if (pricesRes.data) {
          const withTypes = pricesRes.data.map((p: any) => ({
            ...p,
            species_type: p.species_type || classifySpecies(p.species || ''),
          }));
          setPrices(withTypes);
          if (withTypes.length > 0) {
            const latest = withTypes[0]?.price_date;
            if (latest) {
              const d = new Date(latest);
              setLastUpdated(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
            }
            setDataSource(dataSource || 'Supabase (Benchmark)');
          }
        }
      }

      // Fetch live alerts + feed prices directly (no backend needed)
      try {
        const [liveAlertData, feedData] = await Promise.all([
          fetchLiveAlerts().catch(() => []),
          Promise.resolve(getFeedPrices()),
        ]);
        setLiveAlerts(liveAlertData);
        setFeedPrices(feedData);
      } catch {
        // Fallback: empty data
      }
    } catch (err) {
      console.warn('AquaConnect error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time subscription to community_posts
  useEffect(() => {
    const channel = supabase
      .channel('community_posts_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_comments' }, () => {
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handlePost = async () => {
    if (!newPostText.trim()) return;
    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '00000000-0000-0000-0000-000000000000';
    await supabase.from('community_posts').insert({
      cooperative_id: COOP_ID, user_id: userId,
      content: newPostText.trim(), post_type: newPostType,
    });
    setNewPostText('');
    setShowNewPost(false);
    setPosting(false);
    fetchData();
  };

  const handleLike = async (postId: string, currentLikes: number) => {
    await supabase.from('community_posts').update({ likes_count: currentLikes + 1 }).eq('id', postId);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return;
    setCommenting(postId);
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '00000000-0000-0000-0000-000000000000';
    await supabase.from('community_comments').insert({
      post_id: postId, user_id: userId, content: commentText.trim(),
    });
    const { count } = await supabase.from('community_comments').select('*', { count: 'exact', head: true }).eq('post_id', postId);
    await supabase.from('community_posts').update({ comments_count: count || 0 }).eq('id', postId);
    setCommentText('');
    setCommenting(null);
    fetchData();
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.nav}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
          <Text style={s.navTitle}>AquaConnect</Text>
          <View style={{ width: theme.layout.backButtonSize }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={MODULE_COLOR} />
          <Text style={{ marginTop: 12, color: theme.colors.textLight }}>Loading community...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
        <Text style={s.navTitle}>AquaConnect</Text>
        <View style={{ width: theme.layout.backButtonSize }} />
      </View>

      <View style={s.tabRow}>
        {(['feed', 'market', 'members', 'alerts'] as const).map(t => (
          <TouchableOpacity key={t} style={[s.tabBtn, tab === t && { backgroundColor: MODULE_COLOR }]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && { color: theme.colors.white, fontWeight: '600' }]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[MODULE_COLOR]} tintColor={MODULE_COLOR} />}
      >
        {/* FEED TAB */}
        {tab === 'feed' && (
          <>
            <TouchableOpacity style={[s.newPostBtn, { backgroundColor: MODULE_COLOR }]} onPress={() => setShowNewPost(true)}>
              <Text style={s.newPostText}>+ New Post</Text>
            </TouchableOpacity>
            <Text style={s.sectionSub}>{posts.length} posts in your cooperative</Text>
            {posts.length === 0 && <Text style={s.emptyTab}>No posts yet. Be the first to share!</Text>}
            {posts.map(p => {
              const author = p.users?.full_name || 'Anonymous Farmer';
              const isOpen = expandedPost === p.id;
              const comments = p.community_comments || [];
              return (
                <View key={p.id} style={s.postCard}>
                  <View style={s.postHeader}>
                    <View style={[s.postBadge, { backgroundColor: POST_COLORS[p.post_type] + '20' }]}>
                      <Text style={{ fontSize: 14 }}>{POST_ICONS[p.post_type]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={s.postAuthor}>{author}</Text>
                        <Text style={[s.postTypeBadge, { backgroundColor: POST_COLORS[p.post_type] + '15', color: POST_COLORS[p.post_type] }]}>
                          {p.post_type.charAt(0).toUpperCase() + p.post_type.slice(1)}
                        </Text>
                      </View>
                      <Text style={s.postTime}>{formatTime(p.created_at)}</Text>
                    </View>
                  </View>
                  <Text style={s.postContent}>{p.content}</Text>
                  <View style={s.postActions}>
                    <TouchableOpacity style={s.postAction} onPress={() => handleLike(p.id, p.likes_count)}>
                      <Text style={s.postActionText}>👍 {p.likes_count}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.postAction} onPress={() => setExpandedPost(isOpen ? null : p.id)}>
                      <Text style={s.postActionText}>💬 {p.comments_count} {isOpen ? 'Hide' : 'Comment'}</Text>
                    </TouchableOpacity>
                  </View>

                  {isOpen && (
                    <View style={s.commentsSection}>
                      {comments.length === 0 && <Text style={s.noCommentsText}>No comments yet. Start the conversation!</Text>}
                      {comments.map(c => (
                        <View key={c.id} style={s.commentItem}>
                          <View style={s.commentDot} />
                          <View style={{ flex: 1 }}>
                            <Text style={s.commentAuthor}>{c.users?.full_name || 'Farmer'}</Text>
                            <Text style={s.commentText}>{c.content}</Text>
                            <Text style={s.commentTime}>{formatTime(c.created_at)}</Text>
                          </View>
                        </View>
                      ))}
                      <View style={s.commentInputRow}>
                        <TextInput
                          style={s.commentInput}
                          placeholder="Write a comment..."
                          placeholderTextColor={theme.colors.textLight}
                          value={commentText}
                          onChangeText={setCommentText}
                          multiline
                        />
                        <TouchableOpacity
                          style={[s.commentSubmit, { backgroundColor: MODULE_COLOR, opacity: (!commentText.trim() || commenting === p.id) ? 0.5 : 1 }]}
                          onPress={() => handleComment(p.id)}
                          disabled={!commentText.trim() || commenting === p.id}
                        >
                          <Text style={s.commentSubmitText}>{commenting === p.id ? '...' : 'Send'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        {/* MARKET TAB */}
        {tab === 'market' && (
          <>
            {weather && (
              <View style={s.weatherCard}>
                <View style={s.weatherHeader}>
                  <Text style={s.weatherTitle}>Vijayawada, Andhra Pradesh</Text>
                  <Text style={s.weatherBadge}>Live</Text>
                </View>
                <View style={s.weatherRow}>
                  <Text style={s.weatherTemp}>{weather.current?.temperature_2m ?? '--'}°C</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.weatherDetail}>💧 {weather.current?.relative_humidity_2m ?? '--'}%</Text>
                    <Text style={s.weatherDetail}>💨 {weather.current?.wind_speed_10m ?? '--'} km/h</Text>
                  </View>
                </View>
                {weather.daily && (
                  <View style={s.forecastRow}>
                    {weather.daily.time?.slice(0, 5).map((date: string, i: number) => (
                      <View key={i} style={s.forecastDay}>
                        <Text style={s.forecastDate}>{new Date(date).toLocaleDateString('en-IN', { weekday: 'short' })}</Text>
                        <Text style={s.forecastTemp}>{weather.daily.temperature_2m_max[i]}°</Text>
                        <Text style={s.forecastMin}>{weather.daily.temperature_2m_min[i]}°</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={s.marketHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.sectionTitle}>Market Prices</Text>
                <Text style={s.sectionSub}>
                  {lastUpdated ? `${lastUpdated}` : 'Loading...'}
                  {dataSource ? ` • ${dataSource}` : ''}
                </Text>
              </View>
              <TouchableOpacity style={[s.refreshBadge, { backgroundColor: MODULE_COLOR }]} onPress={onRefresh}>
                <Text style={s.refreshText}>↻ Refresh</Text>
              </TouchableOpacity>
            </View>

            {/* Species Type Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
              {[
                { key: 'all', label: 'All Species' },
                { key: 'shrimp', label: '🦐 Shrimp' },
                { key: 'prawn', label: '🦞 Prawn' },
                { key: 'freshwater_fish', label: '🐟 Freshwater' },
                { key: 'marine_fish', label: '🐠 Marine' },
                { key: 'crab', label: '🦀 Crab' },
              ].map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[s.filterChip, selectedSpeciesType === f.key && { backgroundColor: MODULE_COLOR }]}
                  onPress={() => setSelectedSpeciesType(f.key)}
                >
                  <Text style={[s.filterText, selectedSpeciesType === f.key && { color: theme.colors.white, fontWeight: '600' }]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* District Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
              {(() => {
                const districts = [...new Set(prices.map(p => p.district).filter(Boolean))].sort();
                return [{ key: 'all', label: '🏛 All AP' }, ...districts.map(d => ({ key: d, label: `📍 ${d}` }))];
              })().map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[s.filterChip, selectedDistrict === f.key && { backgroundColor: theme.colors.infoBlue }]}
                  onPress={() => setSelectedDistrict(f.key)}
                >
                  <Text style={[s.filterText, selectedDistrict === f.key && { color: theme.colors.white, fontWeight: '600' }]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Filter result count */}
            {prices.length > 0 && (() => {
              const filtered = prices.filter(p => {
                if (selectedSpeciesType !== 'all' && p.species_type !== selectedSpeciesType) return false;
                if (selectedDistrict !== 'all' && p.district !== selectedDistrict) return false;
                return true;
              });
              const hasActiveFilters = selectedSpeciesType !== 'all' || selectedDistrict !== 'all';
              return (
                <View style={s.resultCountRow}>
                  <Text style={s.resultCountText}>
                    Showing {filtered.length} of {prices.length} prices
                  </Text>
                  {hasActiveFilters && (
                    <TouchableOpacity onPress={() => { setSelectedSpeciesType('all'); setSelectedDistrict('all'); }}>
                      <Text style={s.clearAllText}>Clear all</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })()}

            {prices.length === 0 && (
              <View style={s.noDataCard}>
                <Text style={s.noDataIcon}>📡</Text>
                <Text style={s.noDataTitle}>No market data available</Text>
                <Text style={s.noDataDesc}>NFDB prices couldn't be loaded right now. Pull down to refresh.</Text>
              </View>
            )}

            {/* Group prices by species */}
            {(() => {
              const filtered = prices.filter(p => {
                if (selectedSpeciesType !== 'all' && p.species_type !== selectedSpeciesType) return false;
                if (selectedDistrict !== 'all' && p.district !== selectedDistrict) return false;
                return true;
              });
              const grouped = filtered.reduce((acc, p) => {
                if (!acc[p.species]) acc[p.species] = [];
                acc[p.species].push(p);
                return acc;
              }, {} as Record<string, MarketPrice[]>);

              const typeLabels: Record<string, string> = {
                shrimp: '🦐 Shrimp',
                prawn: '🦞 Prawn',
                freshwater_fish: '🐟 Freshwater Fish',
                marine_fish: '🐠 Marine Fish',
                crab: '🦀 Crab',
                other: '🐟 Fish',
              };

              if (prices.length > 0 && Object.keys(grouped).length === 0) {
                return (
                  <View style={s.noDataCard}>
                    <Text style={s.noDataIcon}>🔍</Text>
                    <Text style={s.noDataTitle}>No results match your filters</Text>
                    <Text style={s.noDataDesc}>Try a different species type or district combination.</Text>
                    <TouchableOpacity
                      style={[s.clearFiltersBtn, { backgroundColor: MODULE_COLOR }]}
                      onPress={() => { setSelectedSpeciesType('all'); setSelectedDistrict('all'); }}
                    >
                      <Text style={s.clearFiltersBtnText}>Clear all filters</Text>
                    </TouchableOpacity>
                  </View>
                );
              }

              if (Object.keys(grouped).length === 0) return null;

              const sortedEntries = Object.entries(grouped).sort((a, b) => {
                const typeA = a[1][0]?.species_type || 'other';
                const typeB = b[1][0]?.species_type || 'other';
                const order: Record<string, number> = { shrimp: 0, prawn: 1, freshwater_fish: 2, marine_fish: 3, crab: 4, other: 5 };
                return (order[typeA] ?? 5) - (order[typeB] ?? 5);
              });

              let lastType = '';

              return sortedEntries.map(([species, items]) => {
                const currentType = items[0]?.species_type || 'other';
                const showTypeHeader = currentType !== lastType;
                lastType = currentType;

                return (
                  <View key={species}>
                    {showTypeHeader && (
                      <View style={[s.typeHeaderRow, { marginTop: lastType === 'shrimp' ? 0 : theme.spacing.sm }]}>
                        <Text style={s.typeHeaderText}>{typeLabels[currentType]}</Text>
                      </View>
                    )}
                    <View style={s.speciesSection}>
                      <View style={s.speciesHeader}>
                        <Text style={s.speciesName}>{species}</Text>
                        <View style={s.sourceBadge}>
                          <Text style={s.sourceText}>🏛 Govt of India</Text>
                        </View>
                      </View>
                      {items.map(p => (
                        <View key={p.id} style={s.priceCard}>
                          <View style={{ flex: 1 }}>
                            <Text style={s.priceVariety}>{p.variety}</Text>
                            <Text style={s.priceMarket}>📍 {p.market_name}</Text>
                            <Text style={s.priceDistrict}>{p.district}</Text>
                            {p.min_price != null && p.max_price != null && p.min_price !== p.max_price && (
                              <Text style={s.priceRange}>Range: ₹{p.min_price} – ₹{p.max_price}/kg</Text>
                            )}
                          </View>
                          <View style={s.priceRight}>
                            <Text style={[s.priceValue, { color: theme.colors.text }]}>₹{p.price_per_kg}</Text>
                            <Text style={s.priceUnit}>per kg</Text>
                            <View style={[s.trendBadge, { backgroundColor: TREND_COLORS[p.trend] + '20' }]}>
                              <Text style={[s.trendText, { color: TREND_COLORS[p.trend] }]}>
                                {TREND_ICONS[p.trend]} {p.trend}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              });
            })()}
          </>
        )}

        {/* MEMBERS TAB - Fish Farmer Directory */}
        {tab === 'members' && (
          <>
            <View style={s.marketHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.sectionTitle}>Fish Farmer Directory</Text>
                <Text style={s.sectionSub}>{members.length} farmers across Andhra Pradesh</Text>
              </View>
            </View>

            {/* District Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
              {(() => {
                const districts = [...new Set(members.map(m => m.profiles?.[0]?.district).filter((d): d is string => !!d))].sort();
                return [{ key: 'all', label: '🏛 All AP' }, ...districts.map(d => ({ key: d, label: `📍 ${d}` }))];
              })().map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[s.filterChip, selectedFarmerDistrict === f.key && { backgroundColor: MODULE_COLOR }]}
                  onPress={() => setSelectedFarmerDistrict(f.key)}
                >
                  <Text style={[s.filterText, selectedFarmerDistrict === f.key && { color: theme.colors.white, fontWeight: '600' }]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Filter result count */}
            {(() => {
              const filtered = members.filter(m => {
                if (selectedFarmerDistrict !== 'all' && m.profiles?.[0]?.district !== selectedFarmerDistrict) return false;
                return true;
              });
              const hasFilter = selectedFarmerDistrict !== 'all';
              return (
                <View style={s.resultCountRow}>
                  <Text style={s.resultCountText}>Showing {filtered.length} of {members.length} farmers</Text>
                  {hasFilter && (
                    <TouchableOpacity onPress={() => setSelectedFarmerDistrict('all')}>
                      <Text style={s.clearAllText}>Clear filter</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })()}

            {members.length === 0 && <Text style={s.emptyTab}>No farmers found. Run the seed SQL in Supabase.</Text>}

            {/* Farmer Cards grouped by district */}
            {(() => {
              const filtered = members.filter(m => {
                if (selectedFarmerDistrict !== 'all' && m.profiles?.[0]?.district !== selectedFarmerDistrict) return false;
                return true;
              });

              if (filtered.length === 0 && members.length > 0) {
                return (
                  <View style={s.noDataCard}>
                    <Text style={s.noDataIcon}>🔍</Text>
                    <Text style={s.noDataTitle}>No farmers in this district</Text>
                    <Text style={s.noDataDesc}>Try selecting a different district.</Text>
                    <TouchableOpacity style={[s.clearFiltersBtn, { backgroundColor: MODULE_COLOR }]} onPress={() => setSelectedFarmerDistrict('all')}>
                      <Text style={s.clearFiltersBtnText}>Show all farmers</Text>
                    </TouchableOpacity>
                  </View>
                );
              }

              const speciesEmoji: Record<string, string> = { shrimp: '🦐', prawn: '🦞', fish: '🐟' };
              const speciesLabel: Record<string, string> = { shrimp: 'Shrimp', prawn: 'Prawn', fish: 'Fish' };

              const grouped: Record<string, Member[]> = {};
              filtered.forEach(m => {
                const dist = m.profiles?.[0]?.district || 'Other';
                if (!grouped[dist]) grouped[dist] = [];
                grouped[dist].push(m);
              });

              return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0])).map(([district, farmers]) => (
                <View key={district}>
                  <View style={s.districtHeader}>
                    <Text style={s.districtHeaderText}>📍 {district}</Text>
                    <Text style={s.districtCount}>{farmers.length} farmer{farmers.length > 1 ? 's' : ''}</Text>
                  </View>
                  {farmers.map((m, i) => {
                    const profile = m.profiles?.[0];
                    const ponds = m.ponds || [];
                    const isExpanded = expandedFarmer === m.id;
                    const activePonds = ponds.filter(p => p.status === 'active');
                    const totalPondArea = ponds.reduce((sum, p) => sum + (p.area_acres || 0), 0);

                    return (
                      <TouchableOpacity
                        key={m.id || i}
                        style={s.farmerCard}
                        activeOpacity={0.7}
                        onPress={() => setExpandedFarmer(isExpanded ? null : m.id)}
                      >
                        {/* Farmer Header */}
                        <View style={s.farmerTop}>
                          <View style={[s.farmerAvatar, { backgroundColor: MODULE_COLOR }]}>
                            <Text style={s.farmerAvatarText}>{m.full_name?.charAt(0) || '?'}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                              <Text style={s.farmerName}>{m.full_name}</Text>
                              {m.role === 'cooperative' && (
                                <View style={[s.leaderBadge]}><Text style={s.leaderBadgeText}>⭐ Leader</Text></View>
                              )}
                            </View>
                            <Text style={s.farmerPhone}>📱 {m.phone}</Text>
                            {profile && (
                              <Text style={s.farmerLocation}>📍 {profile.village}{profile.pincode ? `, ${profile.pincode}` : ''}</Text>
                            )}
                          </View>
                          <TouchableOpacity style={[s.memberDirCall, { backgroundColor: MODULE_COLOR }]} onPress={(e) => { e.stopPropagation?.(); Linking.openURL(`tel:${m.phone}`); }}>
                            <Text style={s.memberDirCallText}>📞</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Quick Stats Row */}
                        {profile && (
                          <View style={s.farmerStats}>
                            <View style={s.farmerStatItem}>
                              <Text style={s.farmerStatIcon}>{speciesEmoji[profile.primary_species || ''] || '🐟'}</Text>
                              <Text style={s.farmerStatValue}>{speciesLabel[profile.primary_species || ''] || profile.primary_species || '--'}</Text>
                            </View>
                            <View style={s.farmerStatItem}>
                              <Text style={s.farmerStatIcon}>🏞</Text>
                              <Text style={s.farmerStatValue}>{totalPondArea > 0 ? `${totalPondArea} ac` : profile.total_pond_area ? `${profile.total_pond_area} ac` : '--'}</Text>
                            </View>
                            <View style={s.farmerStatItem}>
                              <Text style={s.farmerStatIcon}>🕐</Text>
                              <Text style={s.farmerStatValue}>{profile.years_experience ? `${profile.years_experience} yrs` : '--'}</Text>
                            </View>
                            <View style={s.farmerStatItem}>
                              <Text style={s.farmerStatIcon}>🐟</Text>
                              <Text style={s.farmerStatValue}>{activePonds.length} pond{activePonds.length !== 1 ? 's' : ''}</Text>
                            </View>
                          </View>
                        )}

                        {/* Expanded Pond Details */}
                        {isExpanded && ponds.length > 0 && (
                          <View style={s.farmerPondsSection}>
                            <View style={s.pondsSectionHeader}>
                              <Text style={s.pondsSectionTitle}>Pond Details</Text>
                              <Text style={s.pondsSectionSub}>{activePonds.length} active of {ponds.length} total</Text>
                            </View>
                            {ponds.map(pond => (
                              <View key={pond.id} style={[s.pondCard, pond.status !== 'active' && { opacity: 0.5 }]}>
                                <View style={s.pondCardHeader}>
                                  <Text style={s.pondName}>{pond.name}</Text>
                                  <View style={[s.pondStatusBadge, { backgroundColor: pond.status === 'active' ? theme.colors.green + '20' : theme.colors.grey[200] }]}>
                                    <Text style={[s.pondStatusText, { color: pond.status === 'active' ? theme.colors.green : theme.colors.textLight }]}>
                                      {pond.status === 'active' ? '● Active' : pond.status}
                                    </Text>
                                  </View>
                                </View>
                                <View style={s.pondDetailsGrid}>
                                  <Text style={s.pondDetailItem}>🏞 {pond.area_acres} acres</Text>
                                  <Text style={s.pondDetailItem}>{speciesEmoji[pond.species?.toLowerCase().includes('shrimp') ? 'shrimp' : pond.species?.toLowerCase().includes('prawn') ? 'prawn' : 'fish'] || '🐟'} {pond.species}</Text>
                                </View>
                                {pond.stocking_density && (
                                  <Text style={s.pondDetailItem}>📊 Stocking: {pond.stocking_density.toLocaleString()}/acre</Text>
                                )}
                                <View style={s.pondDatesRow}>
                                  {pond.stocking_date && <Text style={s.pondDateItem}>📅 Stocked: {new Date(pond.stocking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>}
                                  {pond.expected_harvest_date && <Text style={s.pondDateItem}>🎯 Harvest: {new Date(pond.expected_harvest_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>}
                                </View>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Expand hint */}
                        <View style={s.expandHint}>
                          <Text style={s.expandHintText}>{isExpanded ? '▲ Tap to collapse' : `▼ ${ponds.length > 0 ? `View ${ponds.length} pond${ponds.length > 1 ? 's' : ''}` : 'No ponds added'}`}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ));
            })()}
          </>
        )}

        {/* ALERTS TAB */}
        {tab === 'alerts' && (
          <>
            <View style={s.marketHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.sectionTitle}>Smart Alerts & Feed Prices</Text>
                <Text style={s.sectionSub}>Live from weather stations + AP feed markets</Text>
              </View>
            </View>

            {/* District Filter for Alerts */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
              {(() => {
                const districts = [...new Set([...liveAlerts.map(a => a.district).filter(Boolean), ...alerts.map(a => a.district).filter(Boolean)])].sort();
                return [{ key: 'all', label: '🏛 All AP' }, ...districts.map(d => ({ key: d, label: `📍 ${d}` }))];
              })().map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[s.filterChip, alertDistrict === f.key && { backgroundColor: MODULE_COLOR }]}
                  onPress={() => f.key && setAlertDistrict(f.key)}
                >
                  <Text style={[s.filterText, alertDistrict === f.key && { color: theme.colors.white, fontWeight: '600' }]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Live Alerts from Backend */}
            {liveAlerts.length > 0 && (
              <>
                <Text style={[s.sectionTitle, { marginTop: theme.spacing.sm }]}>🔴 Live Alerts</Text>
                {liveAlerts
                  .filter(a => alertDistrict === 'all' || a.district === alertDistrict)
                  .sort((a, b) => { const p: Record<string, number> = { high: 0, medium: 1, low: 2 }; return (p[a.priority] ?? 2) - (p[b.priority] ?? 2); })
                  .map(a => {
                    const typeEmoji: Record<string, string> = { weather: '🌦', disease: '🦠', feeding: '🍽', market: '📊', general: '📢' };
                    return (
                      <View key={a.id} style={s.alertCard}>
                        <View style={[s.alertPriority, { backgroundColor: a.priority === 'high' ? theme.colors.red : a.priority === 'medium' ? theme.colors.amber : theme.colors.green }]} />
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 14 }}>{typeEmoji[a.alert_type] || '📢'}</Text>
                            <Text style={s.alertTitle}>{a.title}</Text>
                          </View>
                          <Text style={s.alertMsg}>{a.message}</Text>
                          {a.action && (
                            <View style={[s.alertAction, { backgroundColor: MODULE_COLOR + '10' }]}>
                              <Text style={[s.alertActionText, { color: MODULE_COLOR }]}>✅ {a.action}</Text>
                            </View>
                          )}
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                            <Text style={s.alertTime}>{a.source || 'AI Alert'} • {a.district || 'AP'}</Text>
                            <View style={[s.alertPriorityBadge, { backgroundColor: a.priority === 'high' ? theme.colors.red + '20' : a.priority === 'medium' ? theme.colors.amber + '20' : theme.colors.green + '20' }]}>
                              <Text style={{ fontSize: 10, fontWeight: '600', color: a.priority === 'high' ? theme.colors.red : a.priority === 'medium' ? theme.colors.amber : theme.colors.green }}>{a.priority}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}
              </>
            )}

            {liveAlerts.length === 0 && loading && (
              <View style={s.noDataCard}>
                <ActivityIndicator size="small" color={MODULE_COLOR} />
                <Text style={[s.noDataTitle, { marginTop: theme.spacing.sm }]}>Fetching weather data from 8 AP districts...</Text>
              </View>
            )}
            {liveAlerts.length === 0 && !loading && (
              <View style={s.noDataCard}>
                <Text style={s.noDataIcon}>📡</Text>
                <Text style={s.noDataTitle}>No alerts right now</Text>
                <Text style={s.noDataDesc}>All clear across AP districts. Pull down to refresh.</Text>
              </View>
            )}

            {/* Cooperative Alerts from Supabase */}
            {alerts.length > 0 && (
              <>
                <Text style={[s.sectionTitle, { marginTop: theme.spacing.md }]}>📋 Community Alerts</Text>
                {alerts.map(a => (
                  <View key={a.id} style={s.alertCard}>
                    <View style={[s.alertPriority, { backgroundColor: a.priority === 'high' ? theme.colors.red : a.priority === 'medium' ? theme.colors.amber : theme.colors.green }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.alertTitle}>{a.title}</Text>
                      <Text style={s.alertMsg}>{a.message}</Text>
                      <Text style={s.alertTime}>{formatTime(a.created_at)}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* FEED PRICES SECTION */}
            {feedPrices.length > 0 && (
              <>
                <Text style={[s.sectionTitle, { marginTop: theme.spacing.md }]}>💰 Feed Ingredient Prices</Text>
                <Text style={s.sectionSub}>Today's AP feed market rates</Text>
                {(['protein', 'energy', 'lipid', 'additive'] as const).map(cat => {
                  const items = feedPrices.filter(f => f.category === cat);
                  if (items.length === 0) return null;
                  const catLabel: Record<string, string> = { protein: '🥩 Protein Sources', energy: '⚡ Energy Sources', lipid: '🫗 Lipids & Oils', additive: '💊 Additives & Vitamins' };
                  return (
                    <View key={cat}>
                      <Text style={[s.typeHeaderRow, { marginTop: theme.spacing.sm }]}><Text style={s.typeHeaderText}>{catLabel[cat]}</Text></Text>
                      {items.map(f => (
                        <View key={f.id} style={s.feedCard}>
                          <View style={{ flex: 1 }}>
                            <Text style={s.feedName}>{f.name}</Text>
                            <Text style={s.feedNameTe}>{f.name_te}</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={s.feedPrice}>₹{f.price_per_kg}/kg</Text>
                            <Text style={[s.feedChange, { color: f.trend === 'up' ? theme.colors.red : f.trend === 'down' ? theme.colors.green : theme.colors.textLight }]}>
                              {f.trend === 'up' ? '↑' : f.trend === 'down' ? '↓' : '→'} {Math.abs(f.change_percent)}%
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  );
                })}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* NEW POST MODAL */}
      <Modal visible={showNewPost} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>New Post</Text>
              <TouchableOpacity onPress={() => setShowNewPost(false)}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={s.typeRow}>
              {(['general', 'question', 'tip', 'alert'] as const).map(t => (
                <TouchableOpacity key={t} style={[s.typeBtn, newPostType === t && { backgroundColor: MODULE_COLOR }]} onPress={() => setNewPostType(t)}>
                  <Text style={[s.typeBtnText, newPostType === t && { color: theme.colors.white }]}>{POST_ICONS[t]} {t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={s.postInput}
              placeholder="Share something with your cooperative..."
              placeholderTextColor={theme.colors.textLight}
              multiline
              value={newPostText}
              onChangeText={setNewPostText}
            />
            <TouchableOpacity
              style={[s.postSubmit, { backgroundColor: MODULE_COLOR, opacity: (!newPostText.trim() || posting) ? 0.5 : 1 }]}
              onPress={handlePost}
              disabled={!newPostText.trim() || posting}
            >
              <Text style={s.postSubmitText}>{posting ? 'Posting...' : 'Post'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  nav: { backgroundColor: MODULE_COLOR, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: theme.spacing.sm + 12, paddingBottom: theme.spacing.sm + 6, paddingHorizontal: theme.spacing.sm + 4 },
  backBtn: { width: theme.layout.backButtonSize, height: theme.layout.backButtonSize, justifyContent: 'center', alignItems: 'center' },
  backText: { color: theme.colors.white, fontSize: theme.fontSize.xxl, fontWeight: '600' },
  navTitle: { color: theme.colors.white, fontSize: theme.fontSize.lg, fontWeight: '700' },
  tabRow: { flexDirection: 'row', backgroundColor: theme.colors.card, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  tabBtn: { flex: 1, paddingVertical: theme.spacing.sm + 2, alignItems: 'center' },
  tabText: { fontSize: theme.fontSize.xs, color: theme.colors.textLight, fontWeight: '500' },
  scroll: { padding: theme.spacing.md, paddingBottom: 30 },

  // Feed
  newPostBtn: { borderRadius: theme.borderRadius.md, paddingVertical: theme.spacing.sm + 2, alignItems: 'center', marginBottom: theme.spacing.md },
  newPostText: { color: theme.colors.white, fontWeight: '700', fontSize: theme.fontSize.sm },
  postCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm },
  postBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.sm },
  postAuthor: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  postTypeBadge: { fontSize: 10, fontWeight: '600', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  postType: { fontSize: 12, fontWeight: '600', color: theme.colors.text },
  postTime: { fontSize: 11, color: theme.colors.textLight },
  postContent: { fontSize: 14, color: theme.colors.text, lineHeight: 22 },
  postActions: { flexDirection: 'row', marginTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm },
  postAction: { marginRight: theme.spacing.md },
  postActionText: { fontSize: 12, color: theme.colors.textLight },

  // Comments
  commentsSection: { marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border },
  noCommentsText: { fontSize: 12, color: theme.colors.textLight, textAlign: 'center', paddingVertical: 8 },
  commentItem: { flexDirection: 'row', paddingVertical: 6, gap: 8 },
  commentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: MODULE_COLOR, marginTop: 5 },
  commentAuthor: { fontSize: 12, fontWeight: '700', color: theme.colors.text },
  commentText: { fontSize: 13, color: theme.colors.text, lineHeight: 18, marginTop: 2 },
  commentTime: { fontSize: 10, color: theme.colors.textLight, marginTop: 2 },
  commentInputRow: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'flex-end' },
  commentInput: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm, padding: 8, fontSize: 13, color: theme.colors.text, maxHeight: 60, textAlignVertical: 'top' },
  commentSubmit: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.borderRadius.sm },
  commentSubmitText: { fontSize: 12, color: theme.colors.white, fontWeight: '600' },

  // Market
  marketHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm },
  refreshBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.sm },
  refreshText: { color: theme.colors.white, fontSize: 12, fontWeight: '600' },
  filterScroll: { marginBottom: 6, maxHeight: 36 },
  filterContent: { gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: theme.colors.grey[100], borderWidth: 1, borderColor: theme.colors.border },
  filterText: { fontSize: 12, color: theme.colors.textLight, fontWeight: '500' },
  resultCountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm, marginTop: 2, paddingHorizontal: 2 },
  resultCountText: { fontSize: 12, color: theme.colors.textLight, fontWeight: '500' },
  clearAllText: { fontSize: 12, color: MODULE_COLOR, fontWeight: '600' },
  noDataCard: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.md },
  noDataIcon: { fontSize: 36, marginBottom: 8 },
  noDataTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  noDataDesc: { fontSize: 13, color: theme.colors.textLight, textAlign: 'center', lineHeight: 20 },
  clearFiltersBtn: { marginTop: 14, paddingHorizontal: 20, paddingVertical: 8, borderRadius: theme.borderRadius.sm },
  clearFiltersBtnText: { color: theme.colors.white, fontSize: 13, fontWeight: '600' },
  typeHeaderRow: { marginBottom: 4, marginTop: 2 },
  typeHeaderText: { fontSize: 13, fontWeight: '700', color: MODULE_COLOR, textTransform: 'uppercase', letterSpacing: 0.5 },
  speciesSection: { marginBottom: theme.spacing.sm },
  speciesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  speciesName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  sourceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: theme.colors.green + '15' },
  sourceText: { fontSize: 10, fontWeight: '600', color: theme.colors.green },
  sectionTitle: { fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text, marginBottom: 2 },
  sectionSub: { fontSize: 12, color: theme.colors.textLight, marginBottom: theme.spacing.sm },
  priceCard: { flexDirection: 'row', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, marginBottom: theme.spacing.xs, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  priceVariety: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  priceMarket: { fontSize: 11, color: theme.colors.textLight, marginTop: 3 },
  priceDistrict: { fontSize: 10, color: MODULE_COLOR, marginTop: 1, fontWeight: '500' },
  priceRange: { fontSize: 10, color: theme.colors.textLight, marginTop: 2, fontStyle: 'italic' },
  priceRight: { alignItems: 'flex-end' },
  priceValue: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  priceUnit: { fontSize: 10, color: theme.colors.textLight },
  trendBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.borderRadius.sm, marginTop: 4 },
  trendText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },

  // Members - Fish Farmer Directory
  districtHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.sm, paddingHorizontal: 2, marginBottom: theme.spacing.xs },
  districtHeaderText: { fontSize: 13, fontWeight: '700', color: theme.colors.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  districtCount: { fontSize: 11, color: theme.colors.textLight },
  farmerCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  farmerTop: { flexDirection: 'row', alignItems: 'center' },
  farmerAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.sm },
  farmerAvatarText: { fontSize: 18, fontWeight: '700', color: theme.colors.white },
  farmerName: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  leaderBadge: { marginLeft: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, backgroundColor: theme.colors.amber + '20' },
  leaderBadgeText: { fontSize: 10, fontWeight: '600', color: theme.colors.amber },
  farmerPhone: { fontSize: 12, color: theme.colors.text, marginTop: 2, fontWeight: '600' },
  farmerLocation: { fontSize: 11, color: theme.colors.textLight, marginTop: 1 },
  farmerStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border },
  farmerStatItem: { alignItems: 'center' },
  farmerStatIcon: { fontSize: 16, marginBottom: 2 },
  farmerStatValue: { fontSize: 11, color: theme.colors.textLight, fontWeight: '600' },
  farmerPondsSection: { marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border },
  pondsSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  pondsSectionTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  pondsSectionSub: { fontSize: 11, color: theme.colors.textLight },
  pondCard: { backgroundColor: theme.colors.grey[50], borderRadius: theme.borderRadius.sm, padding: theme.spacing.sm, marginBottom: theme.spacing.xs, borderWidth: 1, borderColor: theme.colors.border },
  pondCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pondName: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  pondStatusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  pondStatusText: { fontSize: 10, fontWeight: '600' },
  pondDetailsGrid: { flexDirection: 'row', gap: 12, marginBottom: 3 },
  pondDetailItem: { fontSize: 12, color: theme.colors.textLight },
  pondDatesRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  pondDateItem: { fontSize: 11, color: theme.colors.textLight },
  expandHint: { marginTop: theme.spacing.sm, alignItems: 'center' },
  expandHintText: { fontSize: 11, color: MODULE_COLOR, fontWeight: '500' },
  memberDirCall: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.borderRadius.sm },
  memberDirCallText: { color: theme.colors.white, fontSize: 16, fontWeight: '600' },

  // Alerts
  alertCard: { flexDirection: 'row', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  alertPriority: { width: 4, borderRadius: 2, marginRight: theme.spacing.sm + 4, alignSelf: 'stretch' },
  alertTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  alertMsg: { fontSize: 12, color: theme.colors.textLight, marginTop: 4, lineHeight: 18 },
  alertTime: { fontSize: 11, color: theme.colors.textLight, marginTop: 6 },
  alertAction: { marginTop: 6, paddingVertical: 4, paddingHorizontal: 8, borderRadius: theme.borderRadius.sm },
  alertActionText: { fontSize: 12, fontWeight: '500' },
  alertPriorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: theme.borderRadius.sm },

  // Feed Prices
  feedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  feedName: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  feedNameTe: { fontSize: 11, color: theme.colors.textLight, marginTop: 1 },
  feedPrice: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  feedChange: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  // Modal
  emptyTab: { textAlign: 'center', color: theme.colors.textLight, fontSize: 13, paddingVertical: 30 },
  modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.white, borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl, padding: theme.spacing.lg, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  modalTitle: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.text },
  modalClose: { fontSize: theme.fontSize.lg, color: theme.colors.textLight, padding: 4 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: theme.spacing.md },
  typeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.sm, backgroundColor: theme.colors.grey[100] },
  typeBtnText: { fontSize: 12, color: theme.colors.textLight, fontWeight: '500' },
  postInput: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 4, minHeight: 100, textAlignVertical: 'top', fontSize: 14, color: theme.colors.text, marginBottom: theme.spacing.md },
  postSubmit: { borderRadius: theme.borderRadius.md, paddingVertical: theme.spacing.sm + 4, alignItems: 'center' },
  postSubmitText: { color: theme.colors.white, fontWeight: '700', fontSize: theme.fontSize.md },

  // Weather
  weatherCard: { backgroundColor: theme.colors.infoBlue + '10', borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.infoBlue + '30' },
  weatherHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  weatherTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  weatherBadge: { fontSize: 10, fontWeight: '700', color: theme.colors.green, backgroundColor: theme.colors.green + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
  weatherRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  weatherTemp: { fontSize: 32, fontWeight: '800', color: theme.colors.infoBlue, marginRight: 12 },
  weatherDetail: { fontSize: 12, color: theme.colors.textLight },
  forecastRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 8 },
  forecastDay: { alignItems: 'center' },
  forecastDate: { fontSize: 11, fontWeight: '600', color: theme.colors.text },
  forecastTemp: { fontSize: 13, fontWeight: '700', color: theme.colors.text, marginTop: 2 },
  forecastMin: { fontSize: 11, color: theme.colors.textLight },
});
