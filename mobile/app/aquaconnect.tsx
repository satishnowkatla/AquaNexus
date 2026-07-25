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

const MODULE_COLOR = MODULE_COLOR_MAP.aquaconnect;
const COOP_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const POST_ICONS: Record<string, string> = { question: '❓', tip: '💡', alert: '⚠️', general: '💬' };
const POST_COLORS: Record<string, string> = { question: theme.colors.blue, tip: theme.colors.green, alert: theme.colors.red, general: theme.colors.textLight };
const TREND_ICONS: Record<string, string> = { up: '↑', down: '↓', stable: '→' };
const TREND_COLORS: Record<string, string> = { up: theme.colors.green, down: theme.colors.red, stable: theme.colors.amber };

type Post = {
  id: string; content: string; post_type: string;
  likes_count: number; comments_count: number;
  created_at: string; user_id: string;
};
type MarketPrice = {
  id: string; species: string; variety: string;
  price_per_kg: number; min_price?: number; max_price?: number;
  market_name: string;
  district: string; price_date: string; trend: string;
  data_source?: string; unit?: string;
};
type Member = {
  id: string; full_name: string; phone: string;
  role: string; created_at: string;
};
type Alert = {
  id: string; title: string; message: string;
  alert_type: string; priority: string; created_at: string;
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
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      // Fetch community data from Supabase + weather directly
      const [postsRes, membersRes, alertsRes, weatherRes] = await Promise.all([
        supabase.from('community_posts').select('*').eq('cooperative_id', COOP_ID).order('created_at', { ascending: false }).limit(30),
        supabase.from('users').select('id, full_name, phone, role, created_at').order('created_at', { ascending: false }),
        supabase.from('cooperative_alerts').select('*').eq('cooperative_id', COOP_ID).order('created_at', { ascending: false }).limit(20),
        fetch('https://api.open-meteo.com/v1/forecast?latitude=16.5062&longitude=80.6480&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Asia%2FKolkata&forecast_days=7').then(r => r.json()).catch(() => null),
      ]);
      if (postsRes.data) setPosts(postsRes.data);
      if (membersRes.data) setMembers(membersRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (weatherRes) setWeather(weatherRes);

      // Try live AGMARKNET data from backend first
      let gotLivePrices = false;
      try {
        const liveRes = await fetch(`${API_URL}/api/market/prices`, { signal: AbortSignal.timeout(8000) });
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
              data_source: p.data_source || 'agmarknet',
              unit: p.unit || 'per_kg',
            }));
            setPrices(mapped);
            gotLivePrices = true;
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
          setPrices(pricesRes.data);
          if (pricesRes.data.length > 0) {
            const latest = pricesRes.data[0]?.price_date;
            if (latest) {
              const d = new Date(latest);
              setLastUpdated(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
            }
          }
        }
      }
    } catch (err) {
      console.warn('AquaConnect error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
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
            {posts.length === 0 && <Text style={s.emptyTab}>No posts yet. Be the first to share!</Text>}
            {posts.map(p => (
              <View key={p.id} style={s.postCard}>
                <View style={s.postHeader}>
                  <View style={[s.postBadge, { backgroundColor: POST_COLORS[p.post_type] + '20' }]}>
                    <Text style={{ fontSize: 14 }}>{POST_ICONS[p.post_type]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.postType}>{p.post_type.charAt(0).toUpperCase() + p.post_type.slice(1)}</Text>
                    <Text style={s.postTime}>{formatTime(p.created_at)}</Text>
                  </View>
                </View>
                <Text style={s.postContent}>{p.content}</Text>
                <View style={s.postActions}>
                  <TouchableOpacity style={s.postAction} onPress={() => handleLike(p.id, p.likes_count)}>
                    <Text style={s.postActionText}>👍 {p.likes_count}</Text>
                  </TouchableOpacity>
                  <View style={s.postAction}>
                    <Text style={s.postActionText}>💬 {p.comments_count}</Text>
                  </View>
                </View>
              </View>
            ))}
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
                <Text style={s.sectionTitle}>Fish & Shrimp Prices</Text>
                <Text style={s.sectionSub}>{lastUpdated ? `Updated ${lastUpdated}` : 'Loading...'}</Text>
              </View>
              <TouchableOpacity style={[s.refreshBadge, { backgroundColor: MODULE_COLOR }]} onPress={onRefresh}>
                <Text style={s.refreshText}>↻ Refresh</Text>
              </TouchableOpacity>
            </View>

            {/* District Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
              {['all', ...Array.from(new Set(prices.map(p => p.district).filter(Boolean)))].map(d => (
                <TouchableOpacity
                  key={d}
                  style={[s.filterChip, selectedDistrict === d && { backgroundColor: MODULE_COLOR }]}
                  onPress={() => setSelectedDistrict(d)}
                >
                  <Text style={[s.filterText, selectedDistrict === d && { color: theme.colors.white, fontWeight: '600' }]}>
                    {d === 'all' ? 'All Districts' : d}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {prices.length === 0 && <Text style={s.emptyTab}>No prices available today</Text>}

            {/* Group prices by species */}
            {(() => {
              const filtered = selectedDistrict === 'all' ? prices : prices.filter(p => p.district === selectedDistrict);
              const grouped = filtered.reduce((acc, p) => {
                if (!acc[p.species]) acc[p.species] = [];
                acc[p.species].push(p);
                return acc;
              }, {} as Record<string, MarketPrice[]>);

              return Object.entries(grouped).map(([species, items]) => (
                <View key={species} style={s.speciesSection}>
                  <View style={s.speciesHeader}>
                    <Text style={s.speciesName}>{species}</Text>
                    <View style={[s.sourceBadge, { backgroundColor: items[0]?.data_source === 'agmarknet' ? theme.colors.green + '20' : theme.colors.blue + '15' }]}>
                      <Text style={[s.sourceText, { color: items[0]?.data_source === 'agmarknet' ? theme.colors.green : theme.colors.blue }]}>
                        {items[0]?.data_source === 'agmarknet' ? '🏛 Govt Mandi' : '📊 Benchmark'}
                      </Text>
                    </View>
                  </View>
                  {items.map(p => (
                    <View key={p.id} style={s.priceCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.priceVariety}>{p.variety}</Text>
                        <Text style={s.priceMarket}>📍 {p.market_name}</Text>
                        {p.min_price != null && p.max_price != null && (
                          <Text style={s.priceRange}>Range: ₹{p.min_price.toFixed(0)} – ₹{p.max_price.toFixed(0)}</Text>
                        )}
                      </View>
                      <View style={s.priceRight}>
                        <Text style={[s.priceValue, { color: theme.colors.text }]}>₹{p.price_per_kg.toFixed(0)}</Text>
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
              ));
            })()}
          </>
        )}

        {/* MEMBERS TAB */}
        {tab === 'members' && (
          <>
            <Text style={s.sectionTitle}>Cooperative Members</Text>
            <Text style={s.sectionSub}>{members.length} members in Krishna Delta Fish Farmers</Text>
            {members.map((m, i) => (
              <View key={m.id || i} style={s.memberCard}>
                <View style={[s.avatar, { backgroundColor: MODULE_COLOR + '20' }]}>
                  <Text style={[s.avatarText, { color: MODULE_COLOR }]}>{m.full_name?.charAt(0) || '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.memberName}>{m.full_name}</Text>
                  <Text style={s.memberPhone}>{m.phone}</Text>
                </View>
                <TouchableOpacity style={[s.callBtn, { backgroundColor: MODULE_COLOR }]} onPress={() => Linking.openURL(`tel:${m.phone}`)}>
                  <Text style={s.callText}>Call</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* ALERTS TAB */}
        {tab === 'alerts' && (
          <>
            <Text style={s.sectionTitle}>Cooperative Alerts</Text>
            {alerts.length === 0 && <Text style={s.emptyTab}>No alerts</Text>}
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
  postType: { fontSize: 12, fontWeight: '600', color: theme.colors.text },
  postTime: { fontSize: 11, color: theme.colors.textLight },
  postContent: { fontSize: 14, color: theme.colors.text, lineHeight: 22 },
  postActions: { flexDirection: 'row', marginTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm },
  postAction: { marginRight: theme.spacing.md },
  postActionText: { fontSize: 12, color: theme.colors.textLight },

  // Market
  marketHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm },
  refreshBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.sm },
  refreshText: { color: theme.colors.white, fontSize: 12, fontWeight: '600' },
  filterScroll: { marginBottom: theme.spacing.md, maxHeight: 40 },
  filterContent: { gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: theme.colors.grey[100], borderWidth: 1, borderColor: theme.colors.border },
  filterText: { fontSize: 12, color: theme.colors.textLight, fontWeight: '500' },
  speciesSection: { marginBottom: theme.spacing.md },
  speciesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  speciesName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  sourceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  sourceText: { fontSize: 10, fontWeight: '600' },
  sectionTitle: { fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text, marginBottom: 2 },
  sectionSub: { fontSize: 12, color: theme.colors.textLight, marginBottom: theme.spacing.sm },
  priceCard: { flexDirection: 'row', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, marginBottom: theme.spacing.xs, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  priceVariety: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  priceMarket: { fontSize: 11, color: theme.colors.textLight, marginTop: 3 },
  priceRange: { fontSize: 10, color: theme.colors.textLight, marginTop: 2, fontStyle: 'italic' },
  priceRight: { alignItems: 'flex-end' },
  priceValue: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  priceUnit: { fontSize: 10, color: theme.colors.textLight },
  trendBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.borderRadius.sm, marginTop: 4 },
  trendText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },

  // Members
  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  avatar: { width: theme.layout.avatarMd, height: theme.layout.avatarMd, borderRadius: theme.layout.avatarMd / 2, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.sm + 4 },
  avatarText: { fontSize: theme.fontSize.lg, fontWeight: '700' },
  memberName: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  memberPhone: { fontSize: 12, color: theme.colors.textLight, marginTop: 1 },
  callBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: theme.borderRadius.sm },
  callText: { color: theme.colors.white, fontSize: 12, fontWeight: '600' },

  // Alerts
  alertCard: { flexDirection: 'row', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  alertPriority: { width: 4, borderRadius: 2, marginRight: theme.spacing.sm + 4, alignSelf: 'stretch' },
  alertTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  alertMsg: { fontSize: 12, color: theme.colors.textLight, marginTop: 4, lineHeight: 18 },
  alertTime: { fontSize: 11, color: theme.colors.textLight, marginTop: 6 },

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
