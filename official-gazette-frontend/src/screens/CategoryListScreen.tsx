import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS, SPACING } from '../constants/theme';
import { Category } from '../constants/categories';
import CATEGORIES from '../constants/categories';

const CategoryListScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [subscribedCategories, setSubscribedCategories] = useState<string[]>([
    'law-compliance',
    'finance-economy',
  ]);

  const handleToggleSubscription = (categoryId: string) => {
    setSubscribedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategories = CATEGORIES.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSubscribed = subscribedCategories.includes(item.id);
    
    return (
      <View style={styles.categoryItem}>
        <View style={styles.categoryIconContainer}>
          <MaterialIcons name={item.icon as any} size={24} color={COLORS.primary} />
        </View>
        <View style={styles.categoryContent}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <Switch
          trackColor={{ false: COLORS.disabled, true: `${COLORS.primary}80` }}
          thumbColor={isSubscribed ? COLORS.primary : COLORS.card}
          ios_backgroundColor={COLORS.disabled}
          onValueChange={() => handleToggleSubscription(item.id)}
          value={isSubscribed}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kategoriler</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color={COLORS.disabled} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Kategori ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <MaterialIcons name="close" size={20} color={COLORS.disabled} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <MaterialIcons name="info" size={20} color={COLORS.primary} style={styles.infoIcon} />
        <Text style={styles.infoText}>
          Abone olduğunuz kategorilere ait yeni yayınlar için bildirim alacaksınız
        </Text>
      </View>
      
      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={64} color={COLORS.disabled} />
            <Text style={styles.emptyTitle}>Kategori Bulunamadı</Text>
            <Text style={styles.emptySubtitle}>
              Arama kriterlerinize uygun kategori bulunamadı
            </Text>
          </View>
        }
      />
      
      <View style={styles.subscriptionSummary}>
        <Text style={styles.summaryText}>
          {subscribedCategories.length} kategori aboneliği
        </Text>
      </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.base,
    marginHorizontal: SPACING.l,
    marginBottom: SPACING.m,
    paddingHorizontal: SPACING.m,
    ...SHADOWS.small,
  },
  searchIcon: {
    marginRight: SPACING.s,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10', // 10% opacity
    borderRadius: SIZES.base,
    marginHorizontal: SPACING.l,
    marginBottom: SPACING.m,
    padding: SPACING.m,
  },
  infoIcon: {
    marginRight: SPACING.s,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  listContainer: {
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.xl,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.base,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    ...SHADOWS.small,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20', // 20% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  categoryDescription: {
    fontSize: SIZES.small,
    color: COLORS.text,
    opacity: 0.8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
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
  subscriptionSummary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  summaryText: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default CategoryListScreen;
