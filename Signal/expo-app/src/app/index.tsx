import {
  popToNative,
  useSharedState,
  sendMessage,
  addMessageListener,
} from 'expo-brownfield';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

interface Chat {
  id: number;
  name: string;
  preview: string;
  initials: string;
  color: string;
  unread: number;
  pinned: boolean;
}

const SIGNAL_BLUE = '#3A76F0';

export default function SignalSafetyCenter() {
  const scheme = useColorScheme();
  const cardBg = scheme === 'dark' ? '#1C1C1E' : '#F2F2F7';
  const subtle = scheme === 'dark' ? '#3A3A3C' : '#E5E5EA';
  const muted = scheme === 'dark' ? '#8E8E93' : '#6E6E73';

  const [chats] = useSharedState<Chat[]>('chats', []);
  const [unreadTotal] = useSharedState<number>('unreadTotal', 0);
  const [storiesCount] = useSharedState<number>('storiesCount', 0);
  const [linkedDevices] = useSharedState<number>('linkedDevices', 0);

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const sub = addMessageListener((msg) => {
      if (msg.type === 'CHAT_OPENED') {
        setToast(`Opening "${msg.name}"…`);
      } else if (msg.type === 'CHATS_MARKED_READ') {
        setToast('All chats marked as read');
      }
      setTimeout(() => setToast(null), 2200);
    });
    return () => sub.remove();
  }, []);

  const dismiss = () => popToNative(true);

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={[styles.header, { borderBottomColor: subtle }]}>
          <ThemedText style={styles.headerTitle}>Safety Center</ThemedText>
          <Pressable
            onPress={dismiss}
            hitSlop={8}
            style={({ pressed }) => [
              styles.closeBtn,
              { backgroundColor: SIGNAL_BLUE, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <ThemedText style={styles.closeText}>Done</ThemedText>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={[styles.icon, { backgroundColor: SIGNAL_BLUE }]}>
              <ThemedText style={styles.iconGlyph}>S</ThemedText>
            </View>
            <ThemedText type="title" style={styles.title}>
              Your conversations
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: muted }]}>
              Rendered by React Native inside Signal iOS — dismiss via
              {' '}<ThemedText style={styles.code}>popToNative()</ThemedText>
            </ThemedText>
          </View>

          <View style={styles.statsRow}>
            <Stat label="Unread" value={String(unreadTotal ?? 0)} bg={cardBg} />
            <Stat label="Stories" value={String(storiesCount ?? 0)} bg={cardBg} />
            <Stat
              label="Linked"
              value={String(linkedDevices ?? 0)}
              bg={cardBg}
            />
          </View>

          <Pressable
            onPress={() => sendMessage({ type: 'MARK_ALL_READ' })}
            style={({ pressed }) => [
              styles.actionRow,
              { backgroundColor: cardBg, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.actionTitle}>
                Mark all chats as read
              </ThemedText>
              <ThemedText style={[styles.actionSubtitle, { color: muted }]}>
                Clears the unread counter across all conversations
              </ThemedText>
            </View>
            <ThemedText style={[styles.chevron, { color: SIGNAL_BLUE }]}>
              ›
            </ThemedText>
          </Pressable>

          <ThemedText style={[styles.section, { color: muted }]}>
            Tap a chat to jump straight into it (dismisses RN, hands back to native)
          </ThemedText>

          <View style={[styles.list, { backgroundColor: cardBg }]}>
            {(chats ?? []).map((c, idx) => (
              <Pressable
                key={c.id}
                onPress={() => {
                  sendMessage({ type: 'OPEN_CHAT', id: c.id, name: c.name });
                  setTimeout(() => popToNative(true), 350);
                }}
                style={({ pressed }) => [
                  styles.row,
                  idx < (chats?.length ?? 0) - 1 && {
                    borderBottomColor: subtle,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <View
                  style={[styles.avatar, { backgroundColor: c.color }]}
                >
                  <ThemedText style={styles.avatarText}>{c.initials}</ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowHead}>
                    <ThemedText
                      style={styles.rowTitle}
                      numberOfLines={1}
                    >
                      {c.name}
                    </ThemedText>
                    {c.pinned && (
                      <ThemedText style={[styles.pin, { color: muted }]}>
                        📌
                      </ThemedText>
                    )}
                  </View>
                  <ThemedText
                    style={[styles.rowPreview, { color: muted }]}
                    numberOfLines={1}
                  >
                    {c.preview}
                  </ThemedText>
                </View>
                {c.unread > 0 && (
                  <View
                    style={[styles.unread, { backgroundColor: SIGNAL_BLUE }]}
                  >
                    <ThemedText style={styles.unreadText}>{c.unread}</ThemedText>
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          {toast && (
            <View style={[styles.toast, { backgroundColor: SIGNAL_BLUE }]}>
              <ThemedText style={styles.toastText}>{toast}</ThemedText>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Stat({
  label,
  value,
  bg,
}: {
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <View style={[styles.stat, { backgroundColor: bg }]}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600' },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  closeText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  scroll: { padding: Spacing.three, gap: Spacing.three },
  hero: { alignItems: 'center', paddingTop: Spacing.two, gap: 8 },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: { color: '#fff', fontSize: 30, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 13, textAlign: 'center', paddingHorizontal: 12 },
  code: {
    fontFamily: 'Menlo',
    fontSize: 12,
  },
  statsRow: { flexDirection: 'row', gap: Spacing.two },
  stat: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 2 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: 12,
    gap: Spacing.two,
  },
  actionTitle: { fontSize: 15, fontWeight: '600' },
  actionSubtitle: { fontSize: 12, marginTop: 2 },
  chevron: { fontSize: 28, fontWeight: '400' },
  section: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  list: { borderRadius: 12, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    gap: Spacing.two,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  pin: { fontSize: 11 },
  rowPreview: { fontSize: 12, marginTop: 2 },
  unread: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  toast: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  toastText: { color: '#fff', fontWeight: '600' },
});
