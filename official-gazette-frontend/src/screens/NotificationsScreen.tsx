import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS, SPACING } from '../constants/theme';
import { Notification } from '../types';

// Mock notifications for development purposes
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Yeni Vergi Düzenlemesi',
    body: 'Vergi Usul Kanunu Genel Tebliği yayınlandı',
    data: {
      type: 'publication',
      publicationId: '1',
    },
    read: false,
    createdAt: '2025-03-12T08:30:00.000Z',
  },
  {
    id: '2',
    title: 'İş Sağlığı ve Güvenliği Yönetmeliği',
    body: 'İş Sağlığı ve Güvenliği Yönetmeliği ile ilgili değişiklikler yayınlandı',
    data: {
      type: 'publication',
      publicationId: '2',
    },
    read: true,
    createdAt: '2025-03-11T09:15:00.000Z',
  },
  {
    id: '3',
    title: 'Kişisel Verilerin Korunması',
    body: 'Kişisel Verilerin Korunması Kanunu Uygulama Yönetmeliği yayınlandı',
    data: {
      type: 'publication',
      publicationId: '3',
    },
    read: true,
    createdAt: '2025-03-10T10:00:00.000Z',
  },
  {
    id: '4',
    title: 'Sistem Bildirimi',
    body: 'Uygulama başarıyla güncellendi',
    data: {
      type: 'system',
    },
    read: false,
    createdAt: '2025-03-09T14:30:00.000Z',
  },
];

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.data.type === 'publication' && notification.data.publicationId) {
      // In a real app, we would fetch the publication details here
      // For now, we'll navigate to a mock publication
      const mockPublication = {
        id: notification.data.publicationId,
        title: notification.title,
        content: 'Bu yayının içeriği burada görüntülenecektir.',
        summary: notification.body,
        publishDate: new Date().toISOString(),
        categories: ['law-compliance'],
        url: 'https://example.com/publication',
      };
      
      // @ts-ignore - We'll fix the navigation types later
      navigation.navigate('PublicationDetail', { publication: mockPublication });
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.read && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationIcon}>
          <MaterialIcons
            name={item.data.type === 'publication' ? 'article' : 'system-update'}
            size={24}
            color={COLORS.primary}
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationBody} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.notificationDate}>{formattedDate}</Text>
        </View>
        {!item.read && (
          <View style={styles.unreadIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bildirimler</Text>
      </View>
      
      <View style={styles.settingsContainer}>
        <View style={styles.settingsItem}>
          <Text style={styles.settingsText}>Bildirimleri Etkinleştir</Text>
          <Switch
            trackColor={{ false: COLORS.disabled, true: `${COLORS.primary}80` }}
            thumbColor={notificationsEnabled ? COLORS.primary : COLORS.card}
            ios_backgroundColor={COLORS.disabled}
            onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
            value={notificationsEnabled}
          />
        </View>
      </View>
      
      {notifications.length > 0 ? (
        <>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={markAllAsRead}
            >
              <Text style={styles.actionButtonText}>Tümünü Okundu İşaretle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={clearAllNotifications}
            >
              <Text style={[styles.actionButtonText, styles.clearButtonText]}>Temizle</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotificationItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="notifications-off" size={64} color={COLORS.disabled} />
          <Text style={styles.emptyTitle}>Bildirim Bulunmuyor</Text>
          <Text style={styles.emptySubtitle}>
            Yeni bildirimler geldiğinde burada görüntülenecektir
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.l,
    paddingBottom: SPACING.m,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  settingsContainer: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    marginBottom: SPACING.m,
    ...SHADOWS.small,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsText: {
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.m,
  },
  actionButton: {
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: SIZES.base,
    backgroundColor: COLORS.card,
    ...SHADOWS.small,
  },
  actionButtonText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: COLORS.error + '10', // 10% opacity
  },
  clearButtonText: {
    color: COLORS.error,
  },
  listContainer: {
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.l,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.base,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    ...SHADOWS.small,
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20', // 20% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  notificationBody: {
    fontSize: SIZES.font,
    color: COLORS.text,
    opacity: 0.8,
    marginBottom: SPACING.s,
  },
  notificationDate: {
    fontSize: SIZES.small,
    color: COLORS.disabled,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.s,
    alignSelf: 'flex-start',
    marginTop: SPACING.s,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.m,
    marginBottom: SPACING.s,
  },
  emptySubtitle: {
    fontSize: SIZES.font,
    color: COLORS.text,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
