import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS, SPACING } from '../constants/theme';
import { GazettePublication } from '../types';

// Mock data for development purposes
const MOCK_FAVORITES: GazettePublication[] = [
  {
    id: '1',
    title: 'Vergi Usul Kanunu Genel Tebliği',
    content: 'Vergi Usul Kanunu Genel Tebliği ile ilgili detaylı içerik...',
    summary: 'Vergi Usul Kanunu Genel Tebliği ile ilgili değişiklikler ve düzenlemeler',
    publishDate: '2025-03-10',
    categories: ['finance-accounting', 'law-compliance'],
    url: 'https://example.com/publication/1',
    isFavorite: true,
  },
  {
    id: '3',
    title: 'Kişisel Verilerin Korunması Kanunu Uygulama Yönetmeliği',
    content: 'Kişisel Verilerin Korunması Kanunu Uygulama Yönetmeliği ile ilgili detaylı içerik...',
    summary: 'Kişisel Verilerin Korunması Kanunu Uygulama Yönetmeliği ile ilgili değişiklikler',
    publishDate: '2025-03-08',
    categories: ['information-technology', 'law-compliance'],
    url: 'https://example.com/publication/3',
    isFavorite: true,
  },
];

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState<GazettePublication[]>(MOCK_FAVORITES);

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  const renderFavoriteItem = ({ item }: { item: GazettePublication }) => {
    return (
      <TouchableOpacity
        style={styles.favoriteItem}
        onPress={() => {
          // @ts-ignore - We'll fix the navigation types later
          navigation.navigate('PublicationDetail', { publication: item });
        }}
      >
        <View style={styles.favoriteHeader}>
          <Text style={styles.favoriteDate}>
            {new Date(item.publishDate).toLocaleDateString('tr-TR')}
          </Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFavorite(item.id)}
          >
            <MaterialIcons name="close" size={20} color={COLORS.disabled} />
          </TouchableOpacity>
        </View>
        <Text style={styles.favoriteTitle}>{item.title}</Text>
        <Text style={styles.favoriteSummary} numberOfLines={2}>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorilerim</Text>
      </View>
      
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="favorite-border" size={64} color={COLORS.disabled} />
          <Text style={styles.emptyTitle}>Henüz favori yayınınız yok</Text>
          <Text style={styles.emptySubtitle}>
            Favori yayınlarınızı buradan kolayca takip edebilirsiniz
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => {
              // @ts-ignore - We'll fix the navigation types later
              navigation.navigate('Home');
            }}
          >
            <Text style={styles.browseButtonText}>Yayınlara Göz At</Text>
          </TouchableOpacity>
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
  listContainer: {
    padding: SPACING.m,
  },
  favoriteItem: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.base,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    ...SHADOWS.small,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  favoriteDate: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
  removeButton: {
    padding: SPACING.xs,
  },
  favoriteTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  favoriteSummary: {
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
    marginBottom: SPACING.l,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderRadius: SIZES.base,
  },
  browseButtonText: {
    color: COLORS.card,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
});

export default FavoritesScreen;
