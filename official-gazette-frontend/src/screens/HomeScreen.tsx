import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS, SPACING } from '../constants/theme';
import { GazettePublication } from '../types';

// Mock data for development purposes
const MOCK_PUBLICATIONS: GazettePublication[] = [
  {
    id: '1',
    title: 'Vergi Usul Kanunu Genel Tebliği',
    content: 'Vergi Usul Kanunu Genel Tebliği ile ilgili detaylı içerik...',
    summary: 'Vergi Usul Kanunu Genel Tebliği ile ilgili değişiklikler ve düzenlemeler',
    publishDate: '2025-03-10',
    categories: ['finance-accounting', 'law-compliance'],
    url: 'https://example.com/publication/1',
  },
  {
    id: '2',
    title: 'İş Sağlığı ve Güvenliği Yönetmeliği',
    content: 'İş Sağlığı ve Güvenliği Yönetmeliği ile ilgili detaylı içerik...',
    summary: 'İş Sağlığı ve Güvenliği Yönetmeliği ile ilgili değişiklikler ve düzenlemeler',
    publishDate: '2025-03-09',
    categories: ['health-safety', 'human-resources'],
    url: 'https://example.com/publication/2',
  },
  {
    id: '3',
    title: 'Kişisel Verilerin Korunması Kanunu Uygulama Yönetmeliği',
    content: 'Kişisel Verilerin Korunması Kanunu Uygulama Yönetmeliği ile ilgili detaylı içerik...',
    summary: 'Kişisel Verilerin Korunması Kanunu Uygulama Yönetmeliği ile ilgili değişiklikler',
    publishDate: '2025-03-08',
    categories: ['information-technology', 'law-compliance'],
    url: 'https://example.com/publication/3',
  },
  {
    id: '4',
    title: 'Gümrük Yönetmeliğinde Değişiklik Yapılmasına Dair Yönetmelik',
    content: 'Gümrük Yönetmeliğinde Değişiklik Yapılmasına Dair Yönetmelik ile ilgili detaylı içerik...',
    summary: 'Gümrük Yönetmeliğinde yapılan değişiklikler ve düzenlemeler',
    publishDate: '2025-03-07',
    categories: ['foreign-trade', 'purchasing-logistics'],
    url: 'https://example.com/publication/4',
  },
  {
    id: '5',
    title: 'Kalite Yönetim Sistemleri Standardı Tebliği',
    content: 'Kalite Yönetim Sistemleri Standardı Tebliği ile ilgili detaylı içerik...',
    summary: 'Kalite Yönetim Sistemleri Standardı Tebliği ile ilgili değişiklikler ve düzenlemeler',
    publishDate: '2025-03-06',
    categories: ['quality', 'management-admin'],
    url: 'https://example.com/publication/5',
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [publications, setPublications] = useState<GazettePublication[]>(MOCK_PUBLICATIONS);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate a network request
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const renderPublicationItem = ({ item }: { item: GazettePublication }) => {
    return (
      <TouchableOpacity
        style={styles.publicationItem}
        onPress={() => {
          // @ts-ignore - We'll fix the navigation types later
          navigation.navigate('PublicationDetail', { publication: item });
        }}
      >
        <View style={styles.publicationHeader}>
          <Text style={styles.publicationDate}>
            {new Date(item.publishDate).toLocaleDateString('tr-TR')}
          </Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => {
              // Toggle favorite logic will be implemented later
              console.log('Toggle favorite for:', item.id);
            }}
          >
            <MaterialIcons
              name={item.isFavorite ? 'favorite' : 'favorite-border'}
              size={24}
              color={item.isFavorite ? COLORS.secondary : COLORS.disabled}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.publicationTitle}>{item.title}</Text>
        <Text style={styles.publicationSummary} numberOfLines={2}>
          {item.summary}
        </Text>
        <View style={styles.categoriesContainer}>
          {item.categories.map((categoryId) => (
            <View key={categoryId} style={styles.categoryTag}>
              <Text style={styles.categoryText}>
                {categoryId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resmi Gazete</Text>
        <TouchableOpacity
          onPress={() => {
            // @ts-ignore - We'll fix the navigation types later
            navigation.navigate('Notifications');
          }}
        >
          <MaterialIcons name="notifications" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderTitle}>Son Yayınlar</Text>
        <TouchableOpacity
          onPress={() => {
            // @ts-ignore - We'll fix the navigation types later
            navigation.navigate('ChatDetail');
          }}
          style={styles.chatButton}
        >
          <MaterialIcons name="chat" size={24} color={COLORS.card} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={publications}
        keyExtractor={(item) => item.id}
        renderItem={renderPublicationItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.l,
    paddingBottom: SPACING.m,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.m,
  },
  subHeaderTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  chatButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  listContainer: {
    padding: SPACING.m,
  },
  publicationItem: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.base,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    ...SHADOWS.small,
  },
  publicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  publicationDate: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  publicationTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  publicationSummary: {
    fontSize: SIZES.font,
    color: COLORS.text,
    opacity: 0.8,
    marginBottom: SPACING.m,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: COLORS.primary + '20', // 20% opacity
    borderRadius: SIZES.base,
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.s,
    marginBottom: SPACING.xs,
  },
  categoryText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
});

export default HomeScreen;
